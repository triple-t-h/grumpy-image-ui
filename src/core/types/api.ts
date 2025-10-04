import { DownloadState, ImageDimensionsResizeJob } from '@core/types'

declare global {
    interface Window {
        api: {
            handleImageDimensionsResizeJob: (imageDimensionsResizeJob: ImageDimensionsResizeJob) => Promise<DownloadState>
            test: () => string
        }
    }
}

// Export empty object to make this a module
export { }

