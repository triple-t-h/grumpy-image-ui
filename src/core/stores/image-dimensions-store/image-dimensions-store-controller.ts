import { StoreController } from '../store'
import { ImageDimensionsStore } from './image-dimensions-store'
import { ImageDimension, ImageDimensionsState } from './types'

// Store controller for reactive updates
export class ImageDimensionsStoreController extends StoreController<ImageDimensionsState, ImageDimensionsStore> {    

    // Convenience methods that delegate to the store
    add(dimension: Omit<ImageDimension, 'id'>): ImageDimension {
        return this.getStore().add(dimension)
    }

    remove(id: string): boolean {
        return this.getStore().remove(id)
    }

    removeAt(index: number): boolean {
        return this.getStore().removeAt(index)
    }

    get(id: string): ImageDimension | undefined {
        return this.getStore().get(id)
    }

    getAt(index: number): ImageDimension | undefined {
        return this.getStore().getAt(index)
    }

    getAll(): readonly ImageDimension[] {
        return this.getStore().getAll()
    }

    getFirst(): ImageDimension | undefined {
        return this.getStore().getFirst()
    }

    getLast(): ImageDimension | undefined {
        return this.getStore().getLast()
    }

    getOriginAndAll(): { origin: ImageDimension | null, dimensions: readonly ImageDimension[] } {
        return this.getStore().getOriginAndAll()
    }

    update(id: string, updates: Partial<Omit<ImageDimension, 'id'>>): boolean {
        return this.getStore().update(id, updates)
    }

    updateAt(index: number, updates: Partial<Omit<ImageDimension, 'id'>>): boolean {
        return this.getStore().updateAt(index, updates)
    }

    clear(): void {
        this.getStore().clear()
    }

    clearSilent(): void {
        this.getStore().clearDimensionsSilent()
    }

    setOrigin(dimension: ImageDimension): void {
        this.getStore().setOrigin(dimension)
    }

    getOrigin(): ImageDimension | null {
        return this.getStore().getOrigin()
    }

    getOriginAsync(subscribeToChanges: boolean = false): Promise<ImageDimension> {
        return this.getStore().getOriginAsync(subscribeToChanges)
    }

    syncOriginWithFirst(): void {
        this.getStore().syncOriginWithFirst()
    }

    subscribeFromDimension(callback: (dimension: ImageDimension | null) => void): void {
        this.getStore().subscribeFromDimension(callback)
    }

    subscribeFromResize(callback: (dimension: ImageDimension | null) => void): void {
        this.getStore().subscribeFromResize(callback)
    }

    subscribeToOriginChanges(callback: (origin: ImageDimension) => void): void {
        this.getStore().subscribeToOriginChanges(callback)
    }

    unsubscribeFromOriginChanges(callback: (origin: ImageDimension) => void): boolean {
        return this.getStore().unsubscribeFromOriginChanges(callback)
    }

    setResizeState(dimension: ImageDimension | null): void {
        this.getStore().setResizeState(dimension)
    }

    setDimensionState(dimension: ImageDimension | null): void {
        this.getStore().setDimensionState(dimension)
    }

    get length(): number {
        return this.getStore().length
    }

    get isLoading(): boolean {
        return this.getState().isLoading
    }

    get error(): string | null {
        return this.getState().error
    }

    get dimensions(): readonly ImageDimension[] {
        return this.getState().dimensions
    }

    get origin(): ImageDimension | null {
        return this.getState().origin
    }
}
