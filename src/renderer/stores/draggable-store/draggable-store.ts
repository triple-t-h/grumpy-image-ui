import { BaseStore } from '@core/stores/store'
import { DraggableState } from './types'

export class DraggableStore extends BaseStore<DraggableState> {
    constructor() {
        super({
            draggable: null
        })
    }

    // Implement required abstract method
    reset() {
        this.updateState({ draggable: null })
    }

    // Method to set the draggable instance
    setDraggableInstance(instance: Draggable | null) {
        this.updateState({ draggable: instance })
    }

    // Getter for easy access
    get draggable() {
        return this.state.draggable
    }
}
