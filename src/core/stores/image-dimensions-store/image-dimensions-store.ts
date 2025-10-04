import log from 'loglevel'
import { BaseStore } from '../store'
import { ImageDimension, ImageDimensionsState } from './types'

// ImageDimensionsStore class extending BaseStore
export class ImageDimensionsStore extends BaseStore<ImageDimensionsState> {
    private _originPromiseResolvers: ((origin: ImageDimension) => void)[] = []
    private _resizeSubscribers = new Set<(dimension: ImageDimension | null) => void>()
    private _dimensionSubscribers = new Set<(dimension: ImageDimension | null) => void>()
    private _resizeState: ImageDimension | null = null
    private _originSubscribers = new Set<(origin: ImageDimension) => void>()

    constructor() {
        super({
            dimensions: [],
            origin: null,
            isLoading: false,
            error: null
        })
    }

    private _generateId(isOrigin: boolean = false): string {
        return `dimension-${isOrigin ? 'origin-' : ''}${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
    }

    // Add a new dimension
    add(dimension: Omit<ImageDimension, 'id'>): ImageDimension {
        try {
            this.setLoading(true)
            const newDimension: ImageDimension = {
                ...dimension,
                id: this._generateId(),
                quality: 80
            }

            const updatedDimensions = [...this.state.dimensions, newDimension]
            this.updateState({
                dimensions: updatedDimensions,
                error: null
            })

            log.debug('ImageDimensionsStore: Added dimension', newDimension)
            this.setLoading(false)
            return newDimension
        } catch (error) {
            this.setError(`Failed to add dimension: ${error}`)
            this.setLoading(false)
            throw error
        }
    }

    // Remove dimension by ID
    remove(id: string): boolean {
        try {
            this.setLoading(true)
            const currentDimensions = [...this.state.dimensions]
            const index = currentDimensions.findIndex(dim => dim.id === id)

            if (index === -1) {
                log.warn('ImageDimensionsStore: Dimension not found', id)
                this.setLoading(false)
                return false
            }

            currentDimensions.splice(index, 1)
            this.updateState({
                dimensions: currentDimensions,
                error: null
            })

            log.debug('ImageDimensionsStore: Removed dimension', id)
            this.setLoading(false)
            return true
        } catch (error) {
            this.setError(`Failed to remove dimension: ${error}`)
            this.setLoading(false)
            return false
        }
    }

    // Remove dimension by index
    removeAt(index: number): boolean {
        try {
            this.setLoading(true)
            const currentDimensions = [...this.state.dimensions]

            if (index < 0 || index >= currentDimensions.length) {
                log.warn('ImageDimensionsStore: Invalid index', index)
                this.setLoading(false)
                return false
            }

            currentDimensions.splice(index, 1)
            this.updateState({
                dimensions: currentDimensions,
                error: null
            })

            log.debug('ImageDimensionsStore: Removed dimension at index', index)
            this.setLoading(false)
            return true
        } catch (error) {
            this.setError(`Failed to remove dimension at index: ${error}`)
            this.setLoading(false)
            return false
        }
    }

    // Get dimension by ID
    get(id: string): ImageDimension | undefined {
        return this.state.dimensions.find(dim => dim.id === id)
    }

    // Get dimension by index
    getAt(index: number): ImageDimension | undefined {
        if (index < 0 || index >= this.state.dimensions.length) {
            return undefined
        }
        return this.state.dimensions[index]
    }

    // Get all dimensions
    getAll(): readonly ImageDimension[] {
        return this.state.dimensions
    }

    getFirst(): ImageDimension | undefined {
        return this.state.dimensions[0]
    }   
    
    getLast(): ImageDimension | undefined {
        const dimensions = this.state.dimensions
        return dimensions.length > 0 ? dimensions[dimensions.length - 1] : undefined
    }

    getOriginAndAll(): { origin: ImageDimension | null, dimensions: readonly ImageDimension[] } {
        return {
            origin: this.state.origin,
            dimensions: this.state.dimensions
        }
    }

    // Update dimension
    update(id: string, updates: Partial<Omit<ImageDimension, 'id'>>): boolean {
        try {
            this.setLoading(true)
            const currentDimensions = [...this.state.dimensions]
            const index = currentDimensions.findIndex(dim => dim.id === id)

            if (index === -1) {
                log.warn('ImageDimensionsStore: Dimension not found for update', id)
                this.setLoading(false)
                return false
            }

            currentDimensions[index] = {
                ...currentDimensions[index],
                ...updates
            }

            this.updateState({
                dimensions: currentDimensions,
                error: null
            })

            log.debug('ImageDimensionsStore: Updated dimension', id, updates)
            this.setLoading(false)
            return true
        } catch (error) {
            this.setError(`Failed to update dimension: ${error}`)
            this.setLoading(false)
            return false
        }
    }

    // Update dimension by index
    updateAt(index: number, updates: Partial<Omit<ImageDimension, 'id'>>): boolean {
        try {
            this.setLoading(true)
            const currentDimensions = [...this.state.dimensions]

            if (index < 0 || index >= currentDimensions.length) {
                log.warn('ImageDimensionsStore: Invalid index for update', index)
                this.setLoading(false)
                return false
            }

            currentDimensions[index] = {
                ...currentDimensions[index],
                ...updates
            }

            this.updateState({
                dimensions: currentDimensions,
                error: null
            })

            log.debug('ImageDimensionsStore: Updated dimension at index', index, updates)
            this.setLoading(false)
            return true
        } catch (error) {
            this.setError(`Failed to update dimension at index: ${error}`)
            this.setLoading(false)
            return false
        }
    }

    // Set origin dimension
    setOrigin(dimension: ImageDimension): void {
        try {
            this.setLoading(true)
            const originDimension: ImageDimension = {
                ...dimension,
                id: dimension.id || this._generateId(true)
            }

            this.updateState({
                origin: originDimension,
                error: null
            })

            // Resolve any pending origin promises
            this._originPromiseResolvers.forEach(resolve => resolve(originDimension))
            this._originPromiseResolvers.length = 0 // Clear the array

            // Notify all origin subscribers about the new origin
            this._originSubscribers.forEach(callback => callback(originDimension))

            log.debug('ImageDimensionsStore: Set origin dimension', originDimension)
            this.setLoading(false)
        } catch (error) {
            this.setError(`Failed to set origin dimension: ${error}`)
            this.setLoading(false)
            throw error
        }
    }

    // Get origin dimension
    getOrigin(): ImageDimension | null {
        return this.state.origin
    }

    // Get origin dimension as promise - resolves immediately if available, waits if not
    // Optionally subscribe to future origin changes
    getOriginAsync(subscribeToChanges: boolean = false): Promise<ImageDimension> {
        const currentOrigin = this.state.origin

        // If origin is already set, resolve immediately
        if (currentOrigin) {
            // If subscribing to changes, also set up future notifications
            if (subscribeToChanges) {
                return new Promise<ImageDimension>((resolve) => {
                    // Resolve immediately with current origin
                    resolve(currentOrigin)
                    
                    // Also subscribe to future origin changes
                    this._originSubscribers.add(resolve)
                })
            }
            return Promise.resolve(currentOrigin)
        }

        // If not set, return a promise that will resolve when origin is set
        return new Promise<ImageDimension>((resolve) => {
            this._originPromiseResolvers.push(resolve)
            
            // If subscribing to changes, also add to subscribers for future changes
            if (subscribeToChanges) {
                this._originSubscribers.add(resolve)
            }
        })
    }

    // Subscribe to origin changes
    subscribeToOriginChanges(callback: (origin: ImageDimension) => void): void {
        this._originSubscribers.add(callback)
        
        // If there's already an origin, call the callback immediately
        const currentOrigin = this.state.origin
        if (currentOrigin) {
            callback(currentOrigin)
        }
    }

    // Unsubscribe from origin changes
    unsubscribeFromOriginChanges(callback: (origin: ImageDimension) => void): boolean {
        return this._originSubscribers.delete(callback)
    }

    // Sync origin with first dimension
    syncOriginWithFirst(): void {
        const firstDimension = this.getAt(0)
        if (firstDimension) {
            this.setOrigin(firstDimension)
        }
    }

    // Clear dimensions without reactivity (direct state manipulation)
    clearDimensionsSilent(): void {
        try {
            // Directly modify the internal state without triggering reactive updates
            const currentState = { ...this.state }
            currentState.dimensions = []

            // Use Object.assign to modify state directly without triggering observers
            Object.assign(this.state, currentState)

            log.debug('ImageDimensionsStore: Cleared dimensions silently (no reactivity)')
        } catch (error) {
            log.error('ImageDimensionsStore: Failed to clear dimensions silently', error)
        }
    }

    // Clear all dimensions
    clear(): void {
        try {
            this.setLoading(true)
            this.updateState({
                dimensions: [],
                error: null
            })
            log.debug('ImageDimensionsStore: Cleared all dimensions')
            this.setLoading(false)
        } catch (error) {
            this.setError(`Failed to clear dimensions: ${error}`)
            this.setLoading(false)
        }
    }

    // Utility methods for state management
    setLoading(isLoading: boolean): void {
        this.updateState({ isLoading })
    }

    setError(error: string | null): void {
        this.updateState({ error })
        if (error) {
            log.error('ImageDimensionsStore Error:', error)
        }
    }

    clearError(): void {
        this.setError(null)
    }

    subscribeFromDimension(callback: (dimension: ImageDimension | null) => void): void {
        this._dimensionSubscribers.add(callback)
        callback(this._resizeState)
    }

    subscribeFromResize(callback: (dimension: ImageDimension | null) => void): void {
        this._resizeSubscribers.add(callback)
        callback(this._resizeState)
    }

    setResizeState(dimension: ImageDimension | null): void {
        this._resizeState = dimension
        this._resizeSubscribers.forEach((callback) => callback(dimension))
    }

    setDimensionState(dimension: ImageDimension | null): void {
        this._resizeState = dimension
        this._dimensionSubscribers.forEach((callback) => callback(dimension))
    }

    // Array-like methods
    get length(): number {
        return this.state.dimensions.length
    }

    forEach(callback: (dimension: ImageDimension, index: number) => void): void {
        this.state.dimensions.forEach(callback)
    }

    map<T>(callback: (dimension: ImageDimension, index: number) => T): T[] {
        return this.state.dimensions.map(callback)
    }

    filter(callback: (dimension: ImageDimension, index: number) => boolean): ImageDimension[] {
        return this.state.dimensions.filter(callback)
    }

    find(callback: (dimension: ImageDimension, index: number) => boolean): ImageDimension | undefined {
        return this.state.dimensions.find(callback)
    }

    findIndex(callback: (dimension: ImageDimension, index: number) => boolean): number {
        return this.state.dimensions.findIndex(callback)
    }

    // Required by BaseStore
    reset(): void {
        // Clear any pending promise resolvers
        this._originPromiseResolvers.length = 0
        
        // Clear origin subscribers
        this._originSubscribers.clear()

        this.updateState({
            dimensions: [],
            origin: null,
            isLoading: false,
            error: null
        })
        log.debug('ImageDimensionsStore: Reset')
    }
}
