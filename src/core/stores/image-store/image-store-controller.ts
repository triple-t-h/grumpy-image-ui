import { StoreController } from '../store'
import { ImageStore } from './image-store'
import { ImageState } from './types'

// Image store controller with proper typing
export class ImageStoreController extends StoreController<ImageState, ImageStore> {
    // Expose store methods to components
    get selectedImage() {
        return this.getStore().selectedImage
    }

    get name() {
        return this.getStore().name
    }

    get isProcessing() {
        return this.getStore().isProcessing
    }

    get error() {
        return this.getStore().error
    }

    setSelectedImage(image: Blob | null, name?: string | null) {
        this.getStore().setSelectedImage(image, name)
    }

    setProcessing(processing: boolean) {
        return this.getStore().setProcessing(processing)
    }

    setError(error: string | null) {
        this.getStore().setError(error)
    }

    reset() {
        this.getStore().reset()
    }
}
