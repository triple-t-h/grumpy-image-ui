import log from 'loglevel'
import { BaseStore } from '../store'
import { SnackbarMessage, SnackbarState } from './types'

export class SnackbarStore extends BaseStore<SnackbarState> {
    constructor() {
        super({
            message: null,
            isVisible: false,
            error: null
        })
    }

    /**
     * Set a message to display in the snackbar
     * @param isError - Whether this is an error message or success message
     * @param message - The message text to display
     */
    setMessage(isError: boolean, message: string): void {
        try {
            const snackbarMessage: SnackbarMessage = {
                isError,
                message,
                timestamp: Date.now()
            }

            this.updateState({
                message: snackbarMessage,
                isVisible: true,
                error: null
            })

            log.debug('SnackbarStore: Message set', { isError, message })
        } catch (error) {
            this.setError(`Failed to set snackbar message: ${error}`)
            log.error('SnackbarStore: Error setting message', error)
        }
    }

    /**
     * Clear the current message and hide the snackbar
     */
    clearMessage(): void {
        try {
            this.updateState({
                message: null,
                isVisible: false,
                error: null
            })

            log.debug('SnackbarStore: Message cleared')
        } catch (error) {
            this.setError(`Failed to clear snackbar message: ${error}`)
            log.error('SnackbarStore: Error clearing message', error)
        }
    }

    /**
     * Hide the snackbar without clearing the message
     */
    hide(): void {
        try {
            this.updateState({
                isVisible: false,
                error: null
            })

            log.debug('SnackbarStore: Snackbar hidden')
        } catch (error) {
            this.setError(`Failed to hide snackbar: ${error}`)
            log.error('SnackbarStore: Error hiding snackbar', error)
        }
    }

    /**
     * Show the snackbar if there's a message
     */
    show(): void {
        try {
            if (this.state.message) {
                this.updateState({
                    isVisible: true,
                    error: null
                })

                log.debug('SnackbarStore: Snackbar shown')
            }
        } catch (error) {
            this.setError(`Failed to show snackbar: ${error}`)
            log.error('SnackbarStore: Error showing snackbar', error)
        }
    }

    /**
     * Get the current message
     */
    get currentMessage(): SnackbarMessage | null {
        return this.state.message
    }

    /**
     * Check if the snackbar is currently visible
     */
    get isVisible(): boolean {
        return this.state.isVisible
    }

    // Utility methods for state management
    setError(error: string | null): void {
        this.updateState({ error })
        if (error) {
            log.error('SnackbarStore Error:', error)
        }
    }

    clearError(): void {
        this.setError(null)
    }

    // Required by BaseStore
    reset(): void {
        this.updateState({
            message: null,
            isVisible: false,
            error: null
        })
        log.debug('SnackbarStore: Reset')
    }
}