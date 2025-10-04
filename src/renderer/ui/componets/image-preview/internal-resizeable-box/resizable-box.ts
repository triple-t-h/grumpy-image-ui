import { getFileExtension } from "@core/image-processing/client/get-file-extension"
import { createImageStore } from "@stores/image-store"
import tailwindStyles from '@ui/input.css?inline'
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { css, html, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import { ifDefined } from "lit/directives/if-defined.js"
import log from 'loglevel'
import { Resizable } from "./resizable"

@customElement("resizable-box")
export class ResizableBox extends Resizable {
    constructor() {
        super()
        gsap.registerPlugin(Draggable)
    }

    private _currentObjectURL: string | null = null
    private _imageName: string = ''
    private _imageStore = createImageStore(this)
    private _lastProcessedImage: Blob | null = null

    static styles = [css`        
        :host(.hidden) {
            display: none;
        }
        
        :host(.visible) {
            display: block;
        }

        .info {
            background-color: var(--color-background-image-preview);
        }

        .resize-handle {
            position: absolute;
            background: #007acc;
            border: 1px solid #ffffff;
            width: .5rem; /* 8px */
            height: .5rem; /* 8px */
            z-index: 10;
        }

        /* Sorted by direction: n, ne, e, se, s, sw, w, nw */
        .resize-handle.n  { top: -5px; left: 50%; transform: translateX(-50%); cursor: n-resize; }
        .resize-handle.ne { top: -4px; right: -4px; cursor: ne-resize; }
        .resize-handle.e  { top: 50%; right: -4px; transform: translateY(-50%); cursor: e-resize; }
        .resize-handle.se { bottom: -4px; right: -4px; cursor: se-resize; }
        .resize-handle.s  { bottom: -4px; left: 50%; transform: translateX(-50%); cursor: s-resize; }
        .resize-handle.sw { bottom: -4px; left: -4px; cursor: sw-resize; }
        .resize-handle.w  { top: 50%; left: -4px; transform: translateY(-50%); cursor: w-resize; }
        .resize-handle.nw { top: -4px; left: -4px; cursor: nw-resize; }
    `, unsafeCSS(tailwindStyles)]

    connectedCallback() {
        super.connectedCallback()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        // Clean up object URL when component is removed
        if (this._currentObjectURL) {
            URL.revokeObjectURL(this._currentObjectURL)
        }
        // Reset tracking variables
        this._lastProcessedImageURL = null
        this._lastProcessedImage = null
    }

    private _lastProcessedImageURL: string | null = null

    private _onImageLoad(img: HTMLImageElement) {
        // Prevent multiple processing of the same image
        if (this._currentObjectURL === this._lastProcessedImageURL) {
            log.debug('Image already processed, skipping dimension update')
            return
        }

        this.startWidth = img.naturalWidth
        this.startHeight = img.naturalHeight
        this.aspectRatio = img.naturalWidth / img.naturalHeight

        // Mark this image as processed BEFORE logging and store updates
        this._lastProcessedImageURL = this._currentObjectURL

        log.log('Image loaded:', {
            width: this.startWidth,
            height: this.startHeight,
            aspectRatio: this.aspectRatio,
            filename: this._imageName
        })

        // Initialize resize handles after image loads
        this.updateComplete.then(() => {
            this.initializeResizeHandles()
        })
        
        this.dimensionsStore.setOrigin({
            aspectRatio: this.aspectRatio,
            width: this.startWidth,
            height: this.startHeight,
            filename: this._imageName,
            imageFormat: getFileExtension(img)
        })
    }

    render() {
        const { selectedImage, name, isProcessing, error } = this._imageStore
            , imagePreviewCSS = 'flex justify-center items-center text-xs/5 size-full'

        log.log('Rendering ResizableBox', {
            selectedImage: selectedImage ? selectedImage.size : 'No image',
            name: name,
            isProcessing,
            error
        })


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

        this._imageName = name ?? ''

        // Only create new URL if the image blob has actually changed
        if (selectedImage !== this._lastProcessedImage) {
            // Clean up previous URL and create new one
            if (this._currentObjectURL) {
                URL.revokeObjectURL(this._currentObjectURL)
            }
            this._currentObjectURL = URL.createObjectURL(selectedImage)
            
            // Reset processed image tracking when new image is created
            this._lastProcessedImageURL = null
            this._lastProcessedImage = selectedImage
        }


        return html`
        <div
                id="resizable-box"
                class="absolute cursor-grab border-2 border-transparent hover:border-blue-400"
                >
                    <img 
                        src="${ifDefined(this._currentObjectURL || undefined)}" 
                        alt="Selected Image" 
                        class="size-full object-fill"
                        @load=${(e: Event) => this._onImageLoad(e.target as HTMLImageElement)} />
                    
                    <!-- Resize handles sorted by direction: n, ne, e, se, s, sw, w, nw -->
                    <div class="resize-handle n" data-direction="n"></div>
                    <div class="resize-handle ne" data-direction="ne"></div>
                    <div class="resize-handle e" data-direction="e"></div>
                    <div class="resize-handle se" data-direction="se"></div>
                    <div class="resize-handle s" data-direction="s"></div>
                    <div class="resize-handle sw" data-direction="sw"></div>
                    <div class="resize-handle w" data-direction="w"></div>
                    <div class="resize-handle nw" data-direction="nw"></div>
                </div>
        
        `
    }
}