import { snackbarStore } from '@core/stores/snackbar-store'
import { addSizeSuffixToFilename, removeSizeSuffixFromFilename } from '@core/utils'
import { createImageDimensionsStore, ImageDimension as ImageDimensionType } from '@stores/image-dimensions-store'
import tailwindStyles from '@ui/input.css?inline'
import { css, html, LitElement, PropertyValues, TemplateResult, unsafeCSS } from "lit"
import { customElement, query } from "lit/decorators.js"
import log from 'loglevel'
import { Effects } from './internal-effects'

@customElement('image-dimension')
export class ImageDimension extends LitElement {

    static styles = [css`
        :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
            /* border: 1px solid yellow !important; */
        }

        .dimension-list {
            position: relative;
            display: block;
            width: 100%;
            height: fit-content;
            padding-inline: calc(var(--spacing) * 2) /* 0.5rem = 8px */;
            overflow-x: hidden;
            overflow-y: scroll;
            /* border: 1px solid green !important; */
        }

        .fab-container {
            flex: 0 0 auto;
            display: flex;
            justify-content: flex-end;
            position: sticky;
            bottom: 0;
            margin-top: calc(var(--spacing) * 4); /* 1rem = 16px */
            margin-right: calc(var(--spacing) * 4); /* 1rem = 16px */
            /* border: 1px solid purple !important; */
        }

        @keyframes fadein {
            from {
                transform: scale(0.9);
                opacity: 0;
            }
            to {
                transform: scale(1);
                opacity: 1;
            }
        }

        @keyframes fadeout {
            from {
                transform: scale(1);
                opacity: 1;
            }
            to {
                transform: scale(0);
                opacity: 0;
                height: 0;
                margin: -1px;
                padding: 0;
                display: none;
            }
        }

        .item-fadein {
            animation: fadein .5s cubic-bezier(.4,0,.2,1) forwards;
        }

        .item-fadeout {
            animation: fadeout 1s cubic-bezier(.4,0,.2,1) forwards;
        }

        .item {
            border-color: var(--color-stone-700);
            transition: border-color 350ms ease;
            position: relative;
        }

        .item:hover, .item:focus-within, .item-focused {
            border-color: var(--color-stone-50);
        }

        .scroll {
            scrollbar-width: thin;
            scrollbar-color: var(--color-stone-700) transparent;
        }

        md-outlined-text-field {
            --md-outlined-text-field-input-text-color: var(--color-stone-50);
            --md-outlined-text-field-label-text-color: var(--color-stone-50);
            --md-outlined-text-field-outline-color: var(--color-stone-700);
            --md-outlined-text-field-hover-outline-color: var(--color-stone-50);
            --md-outlined-text-field-hover-label-text-color: var(--color-white);
            --md-outlined-text-field-hover-input-text-color: var(--color-white);
            --md-outlined-text-field-focus-outline-color: var(--color-emerald-400);
            --md-outlined-text-field-focus-outline-width: 2px;
            --md-outlined-text-field-focus-label-text-color: var(--color-emerald-400);
            --md-outlined-text-field-focus-input-text-color: var(--color-white);
            --md-outlined-text-field-focus-caret-color: var(--color-emerald-400);
        }

        md-filled-text-field {
            --md-filled-text-field-container-color: transparent;
            --md-filled-text-field-input-text-color: var(--color-stone-50);
            --md-filled-text-field-label-text-color: var(--color-stone-50);
            --md-filled-text-field-focus-active-indicator-color: var(--color-emerald-400);
            --md-filled-text-field-focus-label-text-color: var(--color-emerald-400);
            --md-filled-text-field-focus-input-text-color: var(--color-white);
            --md-filled-text-field-focus-supporting-text-color: var(--color-stone-50);
            --md-filled-text-field-focus-caret-color: var(--color-emerald-400);
            --md-filled-text-field-hover-outline-color: var(--color-white);
            --md-filled-text-field-hover-label-text-color: var(--color-white);
            --md-filled-text-field-hover-input-text-color: var(--color-white);
        }

        label {
            display: block;
            color: var(--color-stone-50);
            font-size: .9rem;
        }

        md-checkbox {
            --md-checkbox-focus-state-layer-color: var(--color-emerald-400);
            --md-checkbox-hover-state-layer-color: var(--color-emerald-400);

            --md-checkbox-unselected-outline-color: var(--color-stone-50);
            --md-checkbox-unselected-hover-outline-color: var(--color-emerald-500);
            --md-checkbox-unselected-focus-outline-color: var(--color-emerald-300);
            --md-checkbox-unselected-pressed-outline-color: var(--color-emerald-400);

            --md-checkbox-selected-container-color: var(--color-emerald-400);
            --md-checkbox-selected-icon-color: var(--color-stone-900);
            --md-checkbox-selected-hover-container-color: var(--color-emerald-500);
            --md-checkbox-selected-focus-container-color: var(--color-emerald-500);
            --md-checkbox-selected-pressed-container-color: var(--color-emerald-600);
        }

        md-slider {
            --md-slider-handle-color: var(--color-emerald-400);
            --md-slider-focus-handle-color: var(--color-emerald-400);
            --md-slider-hover-handle-color: var(--color-emerald-400);
            --md-slider-pressed-handle-color: var(--color-emerald-400);
            --md-slider-label-container-color: var(--color-emerald-400);
            --md-slider-active-track-color: var(--color-emerald-400);
            --md-slider-inactive-track-color: var(--color-stone-700);            
        }
        `,
    unsafeCSS(tailwindStyles)]

    render() {
        return html`
            <div
                class="dimension-list scroll"
                @change="${this._handleInputChange}"
                @focusin="${this._handleFocus}"
                @pointerdown="${(e: PointerEvent) => { this._removeImageDimension(e); this._handleFocus(e) }}">
                ${this._dimensionsStore.dimensions.map((_, i) => this._renderImageDimensionFields(i))}
            </div>

            <div class="fab-container">
                <md-fab
                    aria-label="Add next dimension"
                    size="small"
                    @pointerdown="${this._addImageDimension}">
                    <md-icon slot="icon">add</md-icon>
                </md-fab>
            </div>
        `
    }

    private _renderImageDimensionFields(index: number): TemplateResult {
        const dimension = this._dimensionsStore.getAt(index)
        if (!dimension) {
            return html``
        }

        log.debug('Rendering dimension fields for index', { index, dimension })

        return html`
            <div 
                class="item item-fadein border-1 mb-3 rounded-md px-3 bg-stone-900 overflow-hidden"
                data-index="${index}"
                data-id="${dimension.id!}">
                <md-filled-tonal-icon-button
                    aria-label="Delete dimension"
                    class="scale-75 float-right -mx-3"
                    data-key="${index}"                   
                    ?disabled="${index === 0}">
                    <md-icon>delete</md-icon>
                </md-filled-tonal-icon-button>
                <md-filled-text-field
                    class="w-full"
                    aria-label="Filename"
                    label="filename"
                    required
                    type="text"
                    data-field="filename"
                    value="${dimension.filename || ''}">
                </md-filled-text-field>
                <div
                    class="flex items-center justify-center py-3 gap-x-3">
                    <md-outlined-text-field
                        aria-label="Width"
                        label="width"
                        type="number"
                        data-field="width"
                        value="${dimension.width}">
                    </md-outlined-text-field>
                    <md-outlined-text-field
                        aria-label="Height"
                        label="height"
                        type="number"
                        data-field="height"
                        value="${dimension.height}">
                    </md-outlined-text-field>
                </div>
                <div class="py-3">
                    <label>
                        Aspect Ratio
                        <md-checkbox
                            aria-label="Aspect Ratio"
                            checked
                            class="float-right"
                            data-field="aspect-ratio"
                            touch-target="wrapper">
                        </md-checkbox>                        
                    </label>
                </div>
                <div>
                    <label>
                        Image Quality                    
                        <md-slider
                            aria-label="Quality"
                            class="w-full"
                            data-field="quality"
                            labeled
                            min="0"
                            max="100"
                            value="${dimension.quality || 50}">
                        </md-slider>
                    </label>
                </div>
            </div>
            `
    }

    constructor() {
        super()
    }

    @query('.dimension-list')
    private _dimensionList!: HTMLDivElement

    @query('.item[data-index="0"]')
    private _firstItem!: HTMLDivElement

    private _dimensionsStore = createImageDimensionsStore(this)
    private _effects = new Effects();
    private _focusedDimension: HTMLDivElement | null = null
    private _originChangeCallback: ((origin: ImageDimensionType) => void) | null = null

    connectedCallback() {
        super.connectedCallback()
    }

    override disconnectedCallback(): void {
        // Clean up subscription when component is removed
        if (this._originChangeCallback) {
            this._dimensionsStore.unsubscribeFromOriginChanges(this._originChangeCallback)
            this._originChangeCallback = null
        }

        super.disconnectedCallback()
    }

    firstUpdated(_changedProperties: PropertyValues): void {
        super.firstUpdated(_changedProperties)
        log.debug('First updated called', { changedProperties: _changedProperties })

        // Subscribe to origin changes
        this._subscribeToOriginChanges()
        this._dimensionsStore.subscribeFromResize(this._updateFromResize.bind(this))

        // Also get the current origin if it exists
        this._dimensionsStore.getOriginAsync().then(origin => {
            log.debug('Got initial origin dimension', { origin })
            this._handleOriginUpdate(origin)
        })
    }

    private _activateFocus(item: HTMLDivElement): void {
        if (!item) return
        item.dispatchEvent(new FocusEvent('focusin', { bubbles: true, composed: true }))
    }

    private _addImageDimension(origin: ImageDimensionType | PointerEvent): ImageDimensionType | undefined {
        log.debug('Appending new image dimension', { origin })
        if (!origin || (origin instanceof PointerEvent && !origin.detail)) {
            const lastDimension = this._dimensionsStore.getLast()
                , event = origin as PointerEvent

            this._effects.add(this._dimensionList, event)
                .then((finish) => {
                    finish()
                })
                .catch(err => {
                    log.error('Error adding effect:', err)
                })

            return this._dimensionsStore.add({
                ...lastDimension!
            })
        }

        return this._dimensionsStore.add({
            ...origin as ImageDimensionType
        })
    }

    private _checkFirstItemValues(id: string): boolean {
        if (!this._firstItem || !this._dimensionsStore.getFirst()) return false

        const firstDimension = this._dimensionsStore.getFirst() as ImageDimensionType
        if (!firstDimension || firstDimension.id !== id) return false

        const widthInput = this._firstItem.querySelector('[data-field="width"]') as HTMLInputElement
            , heightInput = this._firstItem.querySelector('[data-field="height"]') as HTMLInputElement
            , width = parseInt(widthInput.value, 10) || 0
            , height = parseInt(heightInput.value, 10) || 0

        if (firstDimension.width === width || firstDimension.height === height) return true

        widthInput.value = firstDimension.width.toString()
        heightInput.value = firstDimension.height.toString()

        return false
    }

    private _deactivateFocus(): void {
        if (!this._focusedDimension) return
        this._focusedDimension.classList.remove('item-focused')
        this._focusedDimension = null
        this._dimensionsStore.setDimensionState(null)
    }

    private _subscribeToOriginChanges(): void {
        // Create a callback that will be called every time the origin changes
        this._originChangeCallback = (origin: ImageDimensionType) => {
            log.debug('Origin changed, handling update', { origin })
            this._handleOriginUpdate(origin)
        }

        // Subscribe to origin changes using the store's subscription system
        this._dimensionsStore.subscribeToOriginChanges(this._originChangeCallback)
    }

    private _handleFocus(e: FocusEvent | PointerEvent): void {
        e.stopImmediatePropagation()
        e.stopPropagation()

        if (this._dimensionsStore.isLoading) return
        const target = e.target as HTMLDivElement
            , item = target.closest('.item') as HTMLDivElement

        if (!item || this._focusedDimension === item) return

        this._focusedDimension?.classList.remove('item-focused')
        this._focusedDimension = item

        item.classList.add('item-focused')

        const indexStr = item.dataset.index
            , index = indexStr ? parseInt(indexStr, 10) : null

        if (index === null || index < 0 || index >= this._dimensionsStore.length) {
            log.warn('Invalid index for focus event:', index)
            return
        }

        const dimension = this._dimensionsStore.getAt(index)
        if (dimension) {
            this._updateDimensionReference(dimension)
        }
    }

    private _handleInputChange(e: Event): void {
        e.stopImmediatePropagation()
        e.stopPropagation()
        const target = e.target as HTMLInputElement
            , item = target.closest('.item') as HTMLDivElement

        if (!item) {
            log.warn('Could not find parent .item element for input change')
            return
        }

        const aspectRatioInput = item.querySelector('[data-field="aspect-ratio"]') as HTMLInputElement
            , isAspectRatioLocked = aspectRatioInput?.checked || false
            , indexStr = item.dataset.index
            , index = indexStr ? parseInt(indexStr, 10) : null

        if (index === null || index < 0 || index >= this._dimensionsStore.length) {
            log.warn('Invalid index for input change:', index)
            return
        }

        const inputType = target.dataset.field
            , value = target.value

        log.debug(`Updating field "${inputType}" at index ${index} with value "${value}"`)

        switch (inputType) {
            case 'filename':
                this._dimensionsStore.updateAt(index, { filename: value })
                break
            case 'width':
                const width = parseInt(value, 10) || 0
                    , updatedWidth = this._dimensionsStore.updateAt(index, { width })

                if (updatedWidth && isAspectRatioLocked) {

                    const dimension = this._dimensionsStore.getAt(index)
                    if (dimension) {
                        const aspectRatio = dimension.aspectRatio
                            , heightInput = item.querySelector('[data-field="height"]') as HTMLInputElement
                            , height = Math.round(width / aspectRatio)

                        heightInput.value = height.toString()
                        this._dimensionsStore.updateAt(index, { height })
                    }
                }
                log.debug('Width updated, triggering filename update', { index, width })
                break
            case 'height':
                const height = parseInt(value, 10) || 0
                const updatedHeight = this._dimensionsStore.updateAt(index, { height })

                if (updatedHeight && isAspectRatioLocked) {

                    const dimension = this._dimensionsStore.getAt(index)
                    if (dimension) {
                        const aspectRatio = dimension.aspectRatio
                            , widthInput = item.querySelector('[data-field="width"]') as HTMLInputElement
                            , width = Math.round(height * aspectRatio)

                        widthInput.value = width.toString()
                        this._dimensionsStore.updateAt(index, { width })
                    }
                }
                log.debug('Height updated, triggering filename update', { index, height })
                break
            case 'quality':
                const quality = parseInt(value, 10) || 0
                this._dimensionsStore.updateAt(index, { quality })
                break
            default:
                log.warn('Unknown input type for change event:', inputType)
        }

        // Update filename after change
        const dimension = this._dimensionsStore.getAt(index)
        if (dimension) {
            this._updateDimensionReference(dimension)
        }
    }

    private _handleOriginUpdate(origin: ImageDimensionType): void {
        this._dimensionsStore.clear()
        const firstDimension = this._addImageDimension(origin)
        if (!firstDimension) return
        this._focusedDimension = null
        this._activateFocus(this._firstItem)
        this._checkFirstItemValues(firstDimension.id!)
        log.debug('First dimension added from origin update', { firstDimension })
    }

    private _removeImageDimension(e: PointerEvent): void {
        e.stopImmediatePropagation()
        e.stopPropagation()

        if (this._dimensionsStore.isLoading) return

        const target = e.target as HTMLElement
        const index = target?.dataset.key ? parseInt(target.dataset.key, 10) : null

        if (index === null || this._dimensionsStore.length <= index) return

        this._effects.remove(this._dimensionList, index).then((index) => {
            const isRemoved = this._dimensionsStore.removeAt(index)
            if (!isRemoved) {
                log.warn('Failed to remove dimension at index', { index })
                return
            }

            this._deactivateFocus()

            log.debug(`Updated dimension properties: ${JSON.stringify(this._dimensionsStore.getAll())}`)
        })

        this.updateComplete.then(() => {

            const item = this.renderRoot.querySelector(`.item[data-index="${index}"]`) as HTMLDivElement
            if (item) {
                this._activateFocus(item)
            } else if (this._dimensionsStore.length > 0) {
                const newIndex = Math.min(index, this._dimensionsStore.length - 1)
                    , newItem = this.renderRoot.querySelector(`.item[data-index="${newIndex}"]`) as HTMLDivElement
                if (newItem) {
                    this._activateFocus(newItem)
                }
            }
        })
    }

    private _updateDimensionReference(dimension: ImageDimensionType | null): void {
        if (!dimension || !dimension.id) return

        log.debug('Updating dimension reference and filename', { dimension })

        this._dimensionsStore.setDimensionState(dimension)
        this._updateFilename(dimension)
    }

    private _updateFilename(dimension: ImageDimensionType): void {
        if (!dimension || !dimension.id) return

        const { filename, width, height } = dimension
        let newFilename = removeSizeSuffixFromFilename(filename)

        newFilename = addSizeSuffixToFilename(newFilename, [width, height])
        this._dimensionsStore.update(dimension.id, { filename: newFilename })
    }

    private _updateFromResize(dimension: ImageDimensionType | null): void {
        if (!dimension || !dimension.id) return
        const id = dimension.id
            , isDimensionExists = this._dimensionsStore.dimensions.some(d => d.id === id)
        if (!isDimensionExists) {
            log.warn('Dimension to update from resize does not exist in store:', { id })
            snackbarStore.setMessage(true, 'Cannot update dimension from resize: Dimension is not selected.')
            return
        }

        const { width, height } = dimension

        this._dimensionsStore.update(dimension.id, { width, height })
        this._updateFilename(dimension)
        this._checkFirstItemValues(dimension.id)

        const item = this.renderRoot.querySelector(`.item[data-id="${dimension.id}"]`) as HTMLDivElement
            , checkboxInput = item?.querySelector('[data-field="aspect-ratio"]') as HTMLInputElement
        if (!checkboxInput?.checked) return
        checkboxInput.checked = false
    }
}