import { createSingletonStore } from '../../../core/stores/store'
import { DraggableStore } from './draggable-store'
import { DraggableStoreController } from './draggable-store-controller'

// Export types
export type { DraggableState } from './types'

// Export classes
export { DraggableStore } from './draggable-store'
export { DraggableStoreController } from './draggable-store-controller'

// Export the factory function for creating draggable store instances
export const createDraggableStore = createSingletonStore(
    DraggableStore,
    DraggableStoreController
)
