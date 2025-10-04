import { createSingletonStore } from '../store'
import { ImageStore } from './image-store'
import { ImageStoreController } from './image-store-controller'

// Export types
export type { ImageState } from './types'

// Export classes
export { ImageStore } from './image-store'
export { ImageStoreController } from './image-store-controller'

// Export the factory function for creating image store instances
export const createImageStore = createSingletonStore(
    ImageStore,
    ImageStoreController
)
