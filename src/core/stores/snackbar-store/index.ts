
import { ReactiveControllerHost } from 'lit'
import { SnackbarStore } from './snackbar-store'
import { SnackbarStoreController } from './snackbar-store-controller'

// Export types
export type { SnackbarMessage, SnackbarState } from './types'

// Export classes
export { SnackbarStore } from './snackbar-store'
export { SnackbarStoreController } from './snackbar-store-controller'

// Singleton store instance
let _singletonStoreInstance: SnackbarStore | null = null

function getOrCreateStoreInstance(): SnackbarStore {
    if (!_singletonStoreInstance) {
        _singletonStoreInstance = new SnackbarStore()
    }
    return _singletonStoreInstance
}

// Create singleton store factory
export const createSnackbarStore = (() => {
    return (host: ReactiveControllerHost): SnackbarStoreController => {
        const store = getOrCreateStoreInstance()
        return new SnackbarStoreController(host, store)
    }
})()

// Get the singleton store instance directly (without reactive controller)
export const snackbarStore = getOrCreateStoreInstance()
