import { SecurityValidator } from '@core/security'
import { DownloadState, ImageDimensionsResizeJob } from '@core/types'
import { app, ipcMain } from 'electron'
import fs from 'node:fs'
import path from 'node:path'
import { Worker } from 'worker_threads'

const getDownloadStateWorkerPath = (): string => {
    if (app.isPackaged) {
        // Possible locations depending on asar usage
        const candidates = [
            // asar unpacked (when asar: true with unpack rules)
            path.join(process.resourcesPath, 'app.asar.unpacked', 'dist', 'main', 'resize-and-compress-worker.js'),
            // asar disabled (entire app folder present)
            path.join(process.resourcesPath, 'app', 'dist', 'main', 'resize-and-compress-worker.js'),
            // fallback using app.getAppPath()
            path.join(app.getAppPath(), 'dist', 'main', 'resize-and-compress-worker.js')
        ]
        for (const c of candidates) {
            if (fs.existsSync(c)) {
                return c
            }
        }
        console.warn('[worker-path] none of the packaged worker candidates exist, returning first candidate for diagnostics')
        return candidates[0]
    }
    return path.join(__dirname, 'resize-and-compress-worker.js')
}

const getDownloadState = async (job: ImageDimensionsResizeJob): Promise<DownloadState> => {
    return new Promise<DownloadState>(async (resolve, reject): Promise<void> => {
        let downloadStateWorker: Worker

        try {
            // SECURITY: Acquire job slot to prevent DoS via too many concurrent operations
            await SecurityValidator.acquireJobSlot()

            // SECURITY: Validate input job data
            if (!job || typeof job !== 'object') {
                SecurityValidator.releaseJobSlot()
                reject(new Error('Invalid job: must be a valid object'))
                return
            }

            const { originalImageBlob, origin, dimensions } = job

            // SECURITY: Validate required fields
            if (!originalImageBlob || !origin || !dimensions) {
                SecurityValidator.releaseJobSlot()
                reject(new Error('Invalid job: missing required fields (originalImageBlob, origin, dimensions)'))
                return
            }

            // SECURITY: Validate image buffer
            try {
                await SecurityValidator.validateImageBuffer(originalImageBlob)
            } catch (error) {
                SecurityValidator.releaseJobSlot()
                reject(new Error(`Invalid image data: ${(error as Error).message}`))
                return
            }

            // SECURITY: Validate dimensions to prevent DoS
            try {
                SecurityValidator.validateImageDimensions([origin, ...dimensions])
            } catch (error) {
                SecurityValidator.releaseJobSlot()
                reject(new Error(`Invalid dimensions: ${(error as Error).message}`))
                return
            }

            const workerPath = getDownloadStateWorkerPath()
            console.log('[SECURE] Creating download state worker with path:', workerPath)
            downloadStateWorker = new Worker(workerPath, {
                env: { ...process.env, NODE_PATH: process.env.NODE_PATH || '' }
            })
        } catch (error) {
            SecurityValidator.releaseJobSlot()
            console.error('Failed to create download state worker:', error)
            reject(new Error(`Failed to create download state worker: ${error}`))
            return
        }

        downloadStateWorker.postMessage(job)

        const messageHandler = (data: any): void => {
            // SECURITY: Always release job slot when worker completes
            SecurityValidator.releaseJobSlot()
            
            const downloadState: DownloadState = data
            if (!downloadState.success || downloadState.error) {
                reject(new Error(downloadState.error || 'Worker failed without error message'))
            } else {
                resolve(downloadState)
            }

            downloadStateWorker.terminate()
        }

        const errorHandler = (error: Error): void => {
            // SECURITY: Always release job slot on error
            SecurityValidator.releaseJobSlot()
            
            console.error('Download state worker error:', error)
            reject(new Error(`Worker error: ${error.message}`))
            downloadStateWorker.terminate()
        }

        downloadStateWorker.addListener('message', messageHandler)
        downloadStateWorker.addListener('error', errorHandler)
    })
}

const handleDownloadState = (): void => {
    ipcMain.handle('job:image-dimensions-resize', (event, job: ImageDimensionsResizeJob): Promise<DownloadState> => {
        console.log('handleDownloadState called with job:', event, job)
        return getDownloadState(job)
    })
}

export { handleDownloadState }

