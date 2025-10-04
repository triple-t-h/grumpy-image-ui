import type { DownloadState, ImageDimensionsResizeJob } from '@core/types'
import { electronAPI } from '@electron-toolkit/preload'
import { contextBridge, ipcRenderer } from 'electron'

// Clean API implementation - all logic contained in preload script
const api = {
  // Image processing API
  handleImageDimensionsResizeJob: async (job: ImageDimensionsResizeJob): Promise<DownloadState> => {
    console.log('Preload: Processing image dimensions resize job:', job)
    try {
      // Convert Blob to ArrayBuffer for IPC transmission
      let processedJob = { ...job }
      if (job.originalImageBlob && job.originalImageBlob instanceof Blob) {
        const arrayBuffer = await job.originalImageBlob.arrayBuffer()
        processedJob = {
          ...job,
          originalImageBlob: arrayBuffer as any // We'll handle this in the worker
        }
      }
      
      const result = await ipcRenderer.invoke('job:image-dimensions-resize', processedJob)
      console.log('Preload: Received result from main process:', result)
      return result
    } catch (error) {
      console.error('Preload: Error processing job:', error)
      throw error
    }
  },

  // Test API for debugging
  test: () => {
    console.log('Test API called from preload')
    return 'Preload API is working!'
  }
}

// Use `contextBridge` APIs to expose Electron APIs to renderer
// only if context isolation is enabled, otherwise add to DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    console.log('APIs exposed via contextBridge')
  } catch (error) {
    console.error('Failed to expose APIs via contextBridge:', error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
  console.log('APIs exposed via window global')
}
