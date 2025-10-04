// Image-specific state interface
export interface ImageState {
    selectedImage: Blob | null
    name: string | null
    isProcessing: boolean
    error: string | null
}
