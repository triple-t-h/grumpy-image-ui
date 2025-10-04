import { ReactiveControllerHost } from 'lit'
import { ImageDimensionsStore } from './image-dimensions-store'
import { ImageDimensionsStoreController } from './image-dimensions-store-controller'

// Export types
export type { ImageDimension, ImageDimensionsState } from './types'

// Export classes
export { ImageDimensionsStore } from './image-dimensions-store'
export { ImageDimensionsStoreController } from './image-dimensions-store-controller'

// Singleton store instance
let _singletonStoreInstance: ImageDimensionsStore | null = null

function getOrCreateStoreInstance(): ImageDimensionsStore {
    if (!_singletonStoreInstance) {
        _singletonStoreInstance = new ImageDimensionsStore()
    }
    return _singletonStoreInstance
}

// Create singleton store factory
export const createImageDimensionsStore = (() => {
    return (host: ReactiveControllerHost): ImageDimensionsStoreController => {
        const store = getOrCreateStoreInstance()
        return new ImageDimensionsStoreController(host, store)
    }
})()

// Get the singleton store instance directly (without reactive controller)
export function getImageDimensionsStoreInstance(): ImageDimensionsStore {
    return getOrCreateStoreInstance()
}
