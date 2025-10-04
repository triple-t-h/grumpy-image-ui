import { css, html, LitElement } from 'lit'
import { customElement } from 'lit/decorators.js'
import { createSnackbarStore, snackbarStore, SnackbarStoreController } from './index'

/**
 * Example usage of SnackbarStore
 * 
 * There are two ways to use the snackbar store:
 * 
 * 1. With reactive controller (recommended for components)
 * 2. Direct store access (for non-component code)
 */

// Example 1: Using reactive controller in a LitElement component
@customElement('example-snackbar-usage')
export class ExampleSnackbarUsage extends LitElement {
    static styles = css`
        :host {
            display: block;
            padding: 1rem;
        }
        
        button {
            margin: 0.5rem;
            padding: 0.5rem 1rem;
        }
    `

    // Create reactive controller instance
    private snackbarController: SnackbarStoreController = createSnackbarStore(this)

    render() {
        const { message, isVisible, error } = this.snackbarController.state

        return html`
            <h2>Snackbar Store Example</h2>
            
            <div>
                <button @click=${() => this.showSuccess()}>Show Success</button>
                <button @click=${() => this.showError()}>Show Error</button>
                <button @click=${() => this.snackbarController.clearMessage()}>Clear</button>
                <button @click=${() => this.snackbarController.hide()}>Hide</button>
                <button @click=${() => this.snackbarController.show()}>Show</button>
            </div>

            ${isVisible && message ? html`
                <div class="snackbar ${message.isError ? 'error' : 'success'}">
                    <p>${message.message}</p>
                    <small>Timestamp: ${message.timestamp}</small>
                </div>
            ` : ''}

            ${error ? html`<div class="error">Store Error: ${error}</div>` : ''}
        `
    }

    private showSuccess(): void {
        this.snackbarController.setMessage(false, 'Operation completed successfully!')
    }

    private showError(): void {
        this.snackbarController.setMessage(true, 'Something went wrong!')
    }
}

// Example 2: Direct store access (for non-component code)
export function showGlobalSuccessMessage(message: string): void {
    snackbarStore.setMessage(false, message)
}

export function showGlobalErrorMessage(message: string): void {
    snackbarStore.setMessage(true, message)
}

// Example 3: Usage in a service or utility function
export class ApiService {
    static async performOperation(): Promise<void> {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            // Show success message
            snackbarStore.setMessage(false, 'API operation completed!')
        } catch (error) {
            // Show error message
            snackbarStore.setMessage(true, `API error: ${error}`)
        }
    }
}

/**
 * Usage Summary:
 * 
 * For LitElement components:
 * - Use createSnackbarStore(this) to get a reactive controller
 * - Access state via controller.state
 * - Component will automatically re-render when state changes
 * 
 * For non-component code:
 * - Use snackbarStore directly
 * - Call setMessage(isError, message) to show messages
 * - Call clearMessage() to clear
 * 
 * Key Features:
 * - Singleton pattern ensures same state across app
 * - Reactive updates via Lit's controller system
 * - Type-safe with TypeScript interfaces
 * - Error handling and logging built-in
 * - Follows established store patterns in the codebase
 */