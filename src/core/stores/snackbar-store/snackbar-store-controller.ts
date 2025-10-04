import { ReactiveController, ReactiveControllerHost } from 'lit'
import { SnackbarStore } from './snackbar-store'
import { SnackbarMessage, SnackbarState } from './types'

export class SnackbarStoreController implements ReactiveController {
    private host: ReactiveControllerHost
    private store: SnackbarStore

    constructor(host: ReactiveControllerHost, store: SnackbarStore) {
        this.host = host
        this.store = store
        host.addController(this)
    }

    hostConnected(): void {
        this.store.addHost(this.host)
    }

    hostDisconnected(): void {
        this.store.removeHost(this.host)
    }

    // Delegate methods to the store
    setMessage(isError: boolean, message: string): void {
        this.store.setMessage(isError, message)
    }

    clearMessage(): void {
        this.store.clearMessage()
    }

    hide(): void {
        this.store.hide()
    }

    show(): void {
        this.store.show()
    }

    reset(): void {
        this.store.reset()
    }

    // Getters for reactive access to store state
    get state(): SnackbarState {
        return this.store.getState()
    }

    get currentMessage(): SnackbarMessage | null {
        return this.store.currentMessage
    }

    get isVisible(): boolean {
        return this.store.isVisible
    }

    get error(): string | null {
        return this.store.getState().error
    }
}