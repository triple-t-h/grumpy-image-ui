import { selectImage } from '@core/image-processing'
import { ClientSecurityValidator, getBlobFromFile } from '@core/image-processing/client'
import { getImageDimensionsStoreInstance } from '@core/stores'
import { ImageDimensionsResizeJob } from '@core/types'
import '@core/types/api'
import { DownloadState } from '@core/types/download-state'
import { MdFilledButton } from '@material/web/all'
import { createImageStore } from '@stores/image-store'
import tailwindStyles from '@ui/input.css?inline'
import { css, html, LitElement, unsafeCSS } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import log from 'loglevel'
import './internal-image-dimension'

@customElement('image-editor')
export class ImageEditor extends LitElement {
    static styles = [css`
        :host {
            display: flex;
            flex-direction: column;
            min-width: 29rem /* 464px */;                  
            align-items: center;
            font-size: var(--text-base) /* 1rem = 16px */;
            line-height: calc(var(--spacing) * 8) /* 2rem = 32px */;
            overflow: visible;
        }

        :host:has(.expanded-box.visible) {
            height: 100%;
        }

        :host::before {
            content: '';
            position: absolute;
            display: block;
            top: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
            height: calc(100% - (var(--spacing) * 4)) /* 100% - 1rem = 16px */;
            width: 100%;
            background-color: var(--color-background-image-controls);
            float: left; /* Clearfix */
            shape-outside: inset(20px round 0 50px 0 50px);
            shape-margin: 15px;
            border-radius: var(--radius-lg) /* 0.5rem = 8px */;
            z-index: -1;
            pointer-events: none;
        }

        .box {
            /* Do not grow or shrink, base size is determined by height */
            flex: 0 0 auto;            
            width: 100%;
            padding: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
            margin: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
            /* border: 1px solid red; */
        }

        .expanded-box {
            /* Grow to fill available space */
            flex: 1;
            width: 100%;
            overflow: hidden;            
            /* border: 2px solid blue; */
        }

        md-filled-button {
            --md-filled-button-container-shape: .2rem;
            --md-filled-button-container-color: var(--color-stone-500);
            --md-filled-button-label-text-color: var(--color-white);
            --md-filled-button-icon-color: var(--color-white);
            flex-shrink: 0; /* Prevent buttons from shrinking */
        }

        /* 🎨 Drag & Drop Styling */
        .drop-zone {
            position: relative;
            transition: all 0.3s ease;
            border: 2px dashed transparent;
            border-radius: var(--radius-lg);
            background: rgba(var(--color-stone-500-rgb), 0.05);
        }

        .drop-zone.drag-over {
            border-color: var(--color-blue-500);
            background: rgba(var(--color-blue-500-rgb), 0.1);
            transform: scale(1.02);
            box-shadow: 0 8px 25px rgba(var(--color-blue-500-rgb), 0.2);
        }

        .drop-zone.drag-error {
            border-color: var(--color-red-500);
            background: rgba(var(--color-red-500-rgb), 0.1);
            animation: shake 0.5s ease-in-out;
        }

        .drop-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            display: none;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: rgba(var(--color-blue-500-rgb), 0.9);
            color: white;
            border-radius: var(--radius-lg);
            z-index: 100;
            backdrop-filter: blur(4px);
        }

        .drop-zone.drag-over .drop-overlay {
            display: flex;
        }

        .drop-text {
            font-size: 1.5rem;
            font-weight: 600;
            margin-bottom: 0.5rem;
            text-align: center;
        }

        .drop-subtext {
            font-size: 1rem;
            opacity: 0.8;
            text-align: center;
        }

        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-5px); }
            75% { transform: translateX(5px); }
        }
    `, unsafeCSS(tailwindStyles)]

    render() {
        const { selectedImage } = this._imageStore
            , visibility = (visibilitySwitchFlag: boolean = false) => {
                let hasImage = selectedImage && selectedImage.size > 0
                if (visibilitySwitchFlag) {
                    hasImage = !hasImage
                }
                log.debug('Determining visibility, hasImage:', hasImage, 'visibilitySwitchFlag:', visibilitySwitchFlag)
                return hasImage ? 'visible' : 'hidden'
            }

        log.debug('Rendering ImageEditor, hasImage:', visibility(), 'selectedImage:', selectedImage)

        return html`
            <!-- Hidden anchor for download functionality -->
            <a id="download-link" class="hidden"></a>

            <div class="box ${visibility()}">

                <md-filled-button
                    aria-label="Download Image"
                    class="w-full"
                    @pointerdown="${this._handleDownloadZip}">
                    <md-icon slot="icon">download</md-icon>
                    <span>Download Image</span>
                </md-filled-button>                    

            </div>

            <div class="expanded-box ${visibility()}">

                <image-dimension></image-dimension>

            </div>

            <div class="box drop-zone visible" id="drop-zone">
                <!-- 🎯 Drag & Drop Overlay -->
                <div class="drop-overlay">
                    <div class="drop-text">
                        <md-icon>upload</md-icon>
                        Drop Image Here
                    </div>
                    <div class="drop-subtext">
                        Supports JPEG, PNG, WebP, AVIF, TIFF, GIF
                    </div>
                </div>

                <div class="text-center my-3 flex-shrink-0 ${visibility(true)}">
                    <h1 class="m-3 text-2xl">GRUMPY IMAGE UI</h1>
                    <p>Here, you can easily resize your image.</p>
                    <p>This App uses <a class="text-[hsl(186,100%,60%)]" href="https://sharp.pixelplumbing.com/">sharp.js</a> for image processing.</p>
                    <p><strong>Drag & drop an image</strong> or click the button below to select one.</p>
                </div>            

                <md-filled-button
                    aria-label="Select Image"
                    class="w-full"
                    @click="${this._handleSelectImage}">
                    <md-icon slot="icon">upload</md-icon>
                    <span>Select Image</span>
                </md-filled-button>

            </div>
        `
    }

    @query('md-filled-button[aria-label="Download Image"]')
    _downloadButton!: MdFilledButton

    @query('#download-link')
    _downloadLink!: HTMLAnchorElement

    @query('#drop-zone')
    _dropZone!: HTMLDivElement

    // private _devDB = new FileDatabase()
    private _dimensionStore = getImageDimensionsStoreInstance()
    private _imageStore = createImageStore(this)

    constructor() {
        super()
    }

    connectedCallback() {
        super.connectedCallback()

        // Debug: Check if API is available
        log.debug('window.api:', window.api)
        log.debug('window.api.handleImageDimensionsResizeJob:', window.api?.handleImageDimensionsResizeJob)
        log.debug('ImageEditor connected')

        // 🔒 SECURITY: Set up secure drag and drop handlers
        this._setupDragAndDropHandlers()
    }

    disconnectedCallback() {
        super.disconnectedCallback()
        this._removeDragAndDropHandlers()
    }

    private _setupDragAndDropHandlers() {
        // Add event listeners for drag and drop
        this.addEventListener('dragover', this._handleDragOver)
        this.addEventListener('dragenter', this._handleDragEnter)
        this.addEventListener('dragleave', this._handleDragLeave)
        this.addEventListener('drop', this._handleDrop)
        
        // Prevent default drag behaviors on the document
        document.addEventListener('dragover', this._preventDefaults)
        document.addEventListener('drop', this._preventDefaults)
    }

    private _removeDragAndDropHandlers() {
        this.removeEventListener('dragover', this._handleDragOver)
        this.removeEventListener('dragenter', this._handleDragEnter)
        this.removeEventListener('dragleave', this._handleDragLeave)
        this.removeEventListener('drop', this._handleDrop)
        
        document.removeEventListener('dragover', this._preventDefaults)
        document.removeEventListener('drop', this._preventDefaults)
    }

    private _preventDefaults = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
    }

    private _dispatchSpinnerPreloaderEvent(show: boolean) {
        const event = new CustomEvent('spinner-preloader', {
            detail: { show },
            bubbles: true,
            composed: true
        })

        this.dispatchEvent(event)
    }

    private _showSnackbarMessage(success: boolean, message: string) {
        const event = new CustomEvent('snackbar-message', {
            detail: { success, message },
            bubbles: true,
            composed: true
        })

        this.dispatchEvent(event)
    }

    private _handleDownloadZip(e: PointerEvent) {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()
        log.debug('Download image clicked')

        // Check if API is available
        if (!window.api || !window.api.handleImageDimensionsResizeJob) {
            log.error('window.api.handleImageDimensionsResizeJob is not available')
            console.error('window.api:', window.api)
            return
        }

        const originalImageBlob = this._imageStore.selectedImage
            , origin = this._dimensionStore.getOrigin()
            , dimensions = this._dimensionStore.getAll()

        if (!originalImageBlob || originalImageBlob.size === 0 || !origin || dimensions.length === 0) {
            log.warn('Invalid image resize job parameters')
            return
        }

        const imageDimensionsResizeJob: ImageDimensionsResizeJob = {
            originalImageBlob: originalImageBlob,
            origin,
            dimensions
        }

        log.debug('Sending image resize job to API:', window.api, imageDimensionsResizeJob)


        this._dispatchSpinnerPreloaderEvent(true)

        window.api.handleImageDimensionsResizeJob(imageDimensionsResizeJob)
            .then((downloadState: DownloadState) => {
                if (!downloadState.success || !downloadState.zipBuffer) {
                    log.error('No zip buffer received from image processing')
                    return
                }

                const blob = new Blob([downloadState.zipBuffer], { type: 'application/zip' })
                    , filename = origin.filename ? `${origin.filename}_resized_images.zip` : 'resized_images.zip'
                    , url = URL.createObjectURL(blob)

                log.debug('Prepared download URL:', url)
                log.debug('Prepared download filename:', filename)
                log.debug('Blob size:', blob.size)

                // Use the hidden anchor element for download
                this._downloadLink.href = url
                this._downloadLink.download = filename
                this._downloadLink.click()

                URL.revokeObjectURL(url)

                this._dispatchSpinnerPreloaderEvent(false)

                // TODO: Handle the download/save of the processed image
                log.debug('Image processing completed, blob size:', blob.size)
            }).catch((error) => {
                log.error('Error resizing image:', error)
            })
    }

    private _handleDragEnter = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        if (this._dropZone) {
            this._dropZone.classList.add('drag-over')
        }
    }

    private _handleDragOver = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Show copy cursor for valid drag operations
        if (e.dataTransfer) {
            e.dataTransfer.dropEffect = 'copy'
        }
    }

    private _handleDragLeave = (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Only remove the drag-over class if we're leaving the drop zone entirely
        if (this._dropZone && !this._dropZone.contains(e.relatedTarget as Node)) {
            this._dropZone.classList.remove('drag-over', 'drag-error')
        }
    }

    private _handleDrop = async (e: DragEvent) => {
        e.preventDefault()
        e.stopPropagation()
        
        // Remove drag styling
        if (this._dropZone) {
            this._dropZone.classList.remove('drag-over')
        }

        log.info('[DRAG-DROP] 🔒 Processing dropped files with security validation')

        try {
            // 🔒 SECURITY: Validate drag data and files
            const validFiles = await ClientSecurityValidator.validateDragFiles(e.dataTransfer)
            
            if (validFiles.length === 0) {
                throw new Error('No valid image files found')
            }

            if (validFiles.length > 1) {
                log.warn('[DRAG-DROP] Multiple files dropped, using first file:', validFiles[0].name)
                this._showSnackbarMessage(false, `Multiple files detected. Using: ${validFiles[0].name}`)
            }

            // Process the first valid file
            const file = validFiles[0]
            const sanitizedName = ClientSecurityValidator.sanitizeFilename(file.name)
            
            log.info('[DRAG-DROP] ✅ Processing valid file:', sanitizedName, 'Size:', Math.round(file.size / 1024), 'KB')

            // Set processing state
            this._imageStore.setProcessing(true)

            // Convert file to blob and store
            const blob = await getBlobFromFile(file)
            this._imageStore.setSelectedImage(blob, sanitizedName)
            this._imageStore.setProcessing(false)

            // Show success message
            this._showSnackbarMessage(true, `Image loaded successfully: ${sanitizedName}`)

            log.info('[DRAG-DROP] ✅ Image loaded successfully')

        } catch (error) {
            // Show error styling
            if (this._dropZone) {
                this._dropZone.classList.add('drag-error')
                setTimeout(() => {
                    this._dropZone?.classList.remove('drag-error')
                }, 2000)
            }

            const errorMessage = (error as Error).message
            log.error('[DRAG-DROP] ❌ Security validation failed:', errorMessage)
            
            // Set error state
            this._imageStore.setError(`Drag & Drop Error: ${errorMessage}`)
            this._imageStore.setProcessing(false)

            // Show user-friendly error message
            this._showSnackbarMessage(false, `Cannot load image: ${errorMessage}`)
        }
    }

    private _handleSelectImage(e: Event) {
        e.preventDefault()
        e.stopImmediatePropagation()
        e.stopPropagation()

        log.info('[FILE-SELECT] 🔒 Starting file selection with security validation')
        this._imageStore.setProcessing(true)

        selectImage().then(async (file) => {
            if (file instanceof File) {
                try {
                    // 🔒 SECURITY: Validate selected file
                    ClientSecurityValidator.validateFile(file)
                    await ClientSecurityValidator.validateFileHeader(file)
                    
                    const sanitizedName = ClientSecurityValidator.sanitizeFilename(file.name)
                    
                    log.info('[FILE-SELECT] ✅ Processing valid file:', sanitizedName, 'Size:', Math.round(file.size / 1024), 'KB')

                    // Convert file to blob and store
                    const blob = getBlobFromFile(file)
                    this._imageStore.setSelectedImage(blob, sanitizedName)
                    this._imageStore.setProcessing(false)

                    // Show success message
                    this._showSnackbarMessage(true, `Image loaded successfully: ${sanitizedName}`)

                    log.info('[FILE-SELECT] ✅ Image loaded successfully')

                } catch (error) {
                    const errorMessage = (error as Error).message
                    log.error('[FILE-SELECT] ❌ Security validation failed:', errorMessage)
                    
                    this._imageStore.setError(`File Selection Error: ${errorMessage}`)
                    this._imageStore.setProcessing(false)
                    
                    // Show user-friendly error message
                    this._showSnackbarMessage(false, `Cannot load image: ${errorMessage}`)
                }
            } else {
                this._imageStore.setProcessing(false)
                this._showSnackbarMessage(false, 'No file selected')
            }
        }).catch((error) => {
            log.error('[FILE-SELECT] ❌ File selection failed:', error)
            this._imageStore.setError(`File selection failed: ${error.message}`)
            this._imageStore.setProcessing(false)
            this._showSnackbarMessage(false, `File selection failed: ${error.message}`)
        })
    }
}
