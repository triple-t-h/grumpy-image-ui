import { StoreController } from '@core/stores/store'
import { DraggableStore } from './draggable-store'
import { DraggableState } from './types'

export class DraggableStoreController extends StoreController<DraggableState, DraggableStore> {
    // Expose store methods to components
    get draggable() {
        return this.getStore().draggable
    }

    setDraggableInstance(instance: Draggable | null) {
        this.getStore().setDraggableInstance(instance)
    }

    reset() {
        this.getStore().reset()
    }
}
