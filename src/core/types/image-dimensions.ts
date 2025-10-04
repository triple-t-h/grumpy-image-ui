// Image format
type ImageFormat = 'avif' | 'gif' | 'jpeg' | 'jpg' | 'png' | 'tiff' | 'webp'

// Image dimension interface
interface ImageDimension {
    aspectRatio: number
    id?: string
    imageFormat: ImageFormat | string
    filename: string
    height: number
    width: number
    quality?: number
}

// Store state interface
interface ImageDimensionsState {
    dimensions: readonly ImageDimension[]
    origin: ImageDimension | null
    isLoading: boolean
    error: string | null
}

export type { ImageDimension, ImageDimensionsState, ImageFormat }
