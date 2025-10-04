import { getContentType, getFileSize } from '@core/image-processing/client'
import { createImageStore } from '@stores/image-store'
import tailwindStyles from '@ui/input.css?inline'
import { css, html, LitElement, unsafeCSS } from 'lit'
import { customElement } from 'lit/decorators.js'
import log from 'loglevel'
import './internal-drag-image-container'
import './internal-image-info'
import './internal-resizeable-box'

@customElement('image-preview')
export class ImagePreview extends LitElement {

    static styles = [css`
        :host {
            width: 100%;
            height: 100%;
        }
    `, unsafeCSS(tailwindStyles)]

    private _currentObjectURL: string | null = null
    private _imageStore = createImageStore(this)

    connectedCallback(): void {
        super.connectedCallback()
        log.debug('ImagePreview connected')
    }

    updated(changedProperties: Map<string | number | symbol, unknown>) {
        super.updated(changedProperties)
        if (changedProperties.size > 0) {
            log.log('ImagePreview updated, changed properties:', changedProperties)
        } else {
            log.debug('ImagePreview updated by reactive controller (store change)')
        }
    }

    render() {
        const { selectedImage, name, isProcessing, error } = this._imageStore
            , imagePreviewCSS = 'flex flex-col gap-3 py-2 text-xs/5 size-full'

        // log.debug('Store values:', { selectedImage, isProcessing, error })

        // Update host class based on whether image is selected
        const hasImage = selectedImage && selectedImage.size > 0
        this.className = hasImage ? 'visible' : 'hidden'

        // Show loading state
        if (isProcessing) {
            return html`
                <div class="${imagePreviewCSS}">
                    <p class="text-blue-500">Processing image...</p>
                </div>
            `
        }

        // Show error state
        if (error) {
            log.error('Rendering error state:', error)
            return html`
                <div class="${imagePreviewCSS}">
                    <p class="text-red-500">Error: ${error}</p>
                </div>
            `
        }

        // Check if we have a valid image (not null and has size > 0)
        if (!selectedImage || selectedImage.size === 0) {
            log.info('Rendering no image state')
            return html`
                <div class="${imagePreviewCSS}">
                    <p class="text-gray-500">No image selected</p>
                </div>
            `
        }

        // Clean up previous URL and create new one
        if (this._currentObjectURL) {
            URL.revokeObjectURL(this._currentObjectURL)
        }
        this._currentObjectURL = URL.createObjectURL(selectedImage)

        return html`
            <div class="${imagePreviewCSS}">
                <image-info
                    .name="${name || 'Untitled Image'}"
                    .size="${getFileSize(selectedImage)}"
                    .type="${getContentType(selectedImage)}">
                </image-info>
                <drag-image-container>
                    <resizable-box></resizable-box>
                </drag-image-container>
            </div>
        `
    }
}

