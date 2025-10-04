import { BaseStore } from '../store'
import { ImageState } from './types'

// Image store implementation
export class ImageStore extends BaseStore<ImageState> {
    constructor() {
        super({
            selectedImage: null,
            name: null,
            isProcessing: false,
            error: null
        })
    }

    // Implement required abstract method
    reset(): void {
        this.updateState({
            selectedImage: null,
            name: null,
            isProcessing: false,
            error: null
        })
    }

    // Image-specific methods
    setSelectedImage(image: Blob | null, name?: string | null): void {
        this.updateState({
            selectedImage: image,
            name: name || null,
            error: null
        })
    }

    setProcessing(processing: boolean): boolean {
        this.updateState({ isProcessing: processing })
        return this.isProcessing
    }

    setError(error: string | null): void {
        this.updateState({ error })
    }

    // Getters for easy access
    get selectedImage(): Blob | null { return this.state.selectedImage }
    get name(): string | null { return this.state.name }
    get isProcessing(): boolean { return this.state.isProcessing }
    get error(): string | null { return this.state.error }
}
