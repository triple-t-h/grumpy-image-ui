import { ImageDimension } from "."

interface ImageDimensionsResizeJob {
    originalImageBlob: Blob | ArrayBuffer | null
    origin: ImageDimension | null
    dimensions: readonly ImageDimension[]
}
export type { ImageDimensionsResizeJob }
