interface DownloadState {
    success: boolean
    zipBuffer?: ArrayBuffer
    error?: string
}

export type { DownloadState }