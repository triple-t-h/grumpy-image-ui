import { getFileExtensionFromFilename, getResizeImageBuffer, isSharpFormatsSupported } from '@core/image-processing/server'
import { SecurityValidator } from '@core/security'
import type { ImageDimension, ImageDimensionsResizeJob } from '@core/types'
import JSZip from 'jszip'
import log from 'loglevel'
import fs from 'node:fs'
import path from 'node:path'
import { parentPort } from 'worker_threads'

// Extra diagnostics to understand sharp resolution inside worker when packaged
try {
    const resolvedSharp = require.resolve('sharp')
    const sharpDir = path.dirname(resolvedSharp)
    const candidateNative = path.join(sharpDir, 'build', 'Release', 'sharp.node')
    log.info('[worker][sharp] resolve path:', resolvedSharp)
    log.info('[worker][sharp] native binding exists:', fs.existsSync(candidateNative), candidateNative)
    log.info('[worker][sharp] resourcesPath:', (process as any).resourcesPath)
} catch (e) {
    log.error('[worker][sharp] require.resolve failed:', (e as Error).message)
}

parentPort?.on("message", async (imageDimensionsResizeJob: ImageDimensionsResizeJob): Promise<void> => {
    const started = Date.now()
    log.info('[worker] Received job')
    try {
        // SECURITY: Validate worker input data
        if (!imageDimensionsResizeJob || typeof imageDimensionsResizeJob !== 'object') {
            parentPort?.postMessage({ success: false, error: 'SECURITY: Invalid job data structure' })
            return
        }

        const { originalImageBlob, origin, dimensions } = imageDimensionsResizeJob

        if (!originalImageBlob || !origin || !dimensions || dimensions.length === 0) {
            parentPort?.postMessage({ success: false, error: 'SECURITY: Invalid image resize job parameters' })
            return
        }

        // SECURITY: Validate dimensions to prevent DoS attacks
        try {
            SecurityValidator.validateImageDimensions([origin, ...dimensions])
        } catch (error) {
            parentPort?.postMessage({ success: false, error: `SECURITY: ${(error as Error).message}` })
            return
        }

        const originAndDimension: ImageDimension[] = [origin, ...dimensions]
            , zip = new JSZip()

        // SECURITY: Validate and normalize image buffer using security validator
        let baseBuffer: Buffer
        try {
            baseBuffer = await SecurityValidator.validateImageBuffer(originalImageBlob)
        } catch (error) {
            parentPort?.postMessage({ success: false, error: `SECURITY: Invalid image buffer - ${(error as Error).message}` })
            return
        }
        log.info('[worker] Base buffer size:', baseBuffer.length)

        for (const dimension of originAndDimension) {
            const { imageFormat, filename, height, width, quality } = dimension
            if (!imageFormat || !filename || !height || !width) {
                log.warn('[worker] SECURITY: Skipping invalid dimension', dimension)
                continue
            }

            // SECURITY: Sanitize filename to prevent directory traversal
            const sanitizedFilename = SecurityValidator.sanitizeFilename(filename)
                , extFromFilename = getFileExtensionFromFilename(sanitizedFilename)
                , isValidSharpExt = isSharpFormatsSupported(extFromFilename)
                , targetExt = isValidSharpExt ? extFromFilename : imageFormat.toLowerCase()

            let resized: Buffer
            try {
                resized = await getResizeImageBuffer(
                    baseBuffer,
                    targetExt as any,
                    quality || 80,
                    [width, height]
                )
            } catch (err) {
                log.error('[worker] SECURITY: sharp resize failed for', sanitizedFilename, err)
                parentPort?.postMessage({ success: false, error: `Image processing failed: ${(err as Error).message}` })
                return
            }
            const finalName = isValidSharpExt ? sanitizedFilename : `${sanitizedFilename}.${targetExt}`
            zip.file(finalName, resized)
        }

        const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' })
        log.info('[worker] Completed in', Date.now() - started, 'ms; zip size', zipBuffer.length)
        parentPort?.postMessage({ success: true, zipBuffer })
    } catch (error) {
        log.error('[worker] Unhandled error', error)
        parentPort?.postMessage({ success: false, error: error instanceof Error ? error.message : 'Unknown error' })
    }
})