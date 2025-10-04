import { ImageDimension } from '@core/types'
import { createDraggableStore } from '@renderer-stores/draggable-store'
import { getImageDimensionsStoreInstance } from '@stores/image-dimensions-store'
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { LitElement } from "lit"
import { query } from "lit/decorators.js"
import log from 'loglevel'

export class Resizable extends LitElement {
    constructor() {
        super()
        gsap.registerPlugin(Draggable)
    }

    protected aspectRatio: number = 1
    protected startHeight: number = 0
    protected startWidth: number = 0
    protected dimensionsStore = getImageDimensionsStoreInstance()

    private _isResizing: boolean = false
    private _imageDimension: ImageDimension | null = null
    private _draggable: Draggable | null = null
    private _draggableStore = createDraggableStore(this as any)
    private _startLeft: number = 0
    private _startTop: number = 0
    private _startX: number = 0
    private _startY: number = 0

    @query('#resizable-box')
    private _resizableBox!: HTMLDivElement

    connectedCallback() {
        super.connectedCallback()
        this.dimensionsStore.subscribeFromDimension(this._updateResize.bind(this))
        log.debug('Resizable connected, draggable:', this._draggable)
    }

    disconnectedCallback(): void {
        super.disconnectedCallback()
        log.debug('Resizable disconnected')
    }

    protected initializeResizeHandles() {
        const q = gsap.utils.selector(this.shadowRoot)
            , handles = q('.resize-handle') as HTMLDivElement[]

        handles.forEach((handle) => {
            const direction = handle.dataset.direction
            if (!direction) return

            Draggable.create(handle as Element, {
                type: ['n', 's'].includes(direction) ? 'y' : ['e', 'w'].includes(direction) ? 'x' : 'x,y',
                trigger: handle as Element,
                onDragStart: (e: PointerEvent) => {
                    this._isResizing = true

                    // Try to get draggable instance and disable it
                    this._draggable = this._getDraggable()
                    if (this._draggable) {
                        this._draggable.disable()
                        log.log('Draggable disabled for resize')
                    } else {
                        log.warn('draggable not available during resize start')
                    }

                    const metrics = this._getElementMetrics(this._resizableBox)
                    this._startX = e.x
                    this._startY = e.y
                    this.startWidth = metrics.width
                    this.startHeight = metrics.height
                    this._startLeft = metrics.left
                    this._startTop = metrics.top

                    // Don't set aspect ratio here - it should be set only once when image loads
                },
                onDrag: (e: PointerEvent) => {
                    this._handleResize(e, direction)
                },
                onDragEnd: () => {
                    this._isResizing = false

                    // Try to get draggable instance and re-enable it
                    this._draggable = this._getDraggable()
                    if (this._draggable) {
                        this._draggable.enable()
                        log.log('Draggable re-enabled after resize')
                    } else {
                        log.warn('draggable not available during resize end')
                    }
                },
                cursor: getComputedStyle(handle as Element).cursor
            })
        })
    }

    private _applyAspectRatioConstraints(
        direction: string,
        width: number,
        height: number,
        left: number,
        top: number
    ) {
        // Use the ORIGINAL start dimensions to maintain the initial aspect ratio
        // Don't recalculate - use the aspect ratio that was set when the image loaded
        const aspectRatio = this.aspectRatio

        console.log('Aspect ratio constraint input:', {
            direction,
            inputWidth: width,
            inputHeight: height,
            startWidth: this.startWidth,
            startHeight: this.startHeight,
            aspectRatio: aspectRatio
        })

        // Calculate constrained dimensions based on direction and start aspect ratio
        let constrainedWidth: number
        let constrainedHeight: number

        if (['n', 's'].includes(direction)) {
            // Vertical resize - prioritize height, calculate width from start aspect ratio
            constrainedHeight = height
            constrainedWidth = height * aspectRatio
            console.log('Vertical resize: height =', height, '→ width =', constrainedWidth)
        } else if (['e', 'w'].includes(direction)) {
            // Horizontal resize - prioritize width, calculate height from start aspect ratio
            constrainedWidth = width
            constrainedHeight = width / aspectRatio
            console.log('Horizontal resize: width =', width, '→ height =', constrainedHeight)
        } else {
            // Corner resize - use the dimension that changed the most
            const widthChange = Math.abs(width - this.startWidth)
            const heightChange = Math.abs(height - this.startHeight)

            console.log('Corner resize changes:', { widthChange, heightChange })

            if (widthChange > heightChange) {
                // Width changed more, prioritize width
                constrainedWidth = width
                constrainedHeight = width / aspectRatio
                console.log('Corner resize (width priority): width =', width, '→ height =', constrainedWidth)
            } else {
                // Height changed more, prioritize height
                constrainedHeight = height
                constrainedWidth = height * aspectRatio
                console.log('Corner resize (height priority): height =', height, '→ width =', constrainedWidth)
            }
        }

        const constrainedDimensions = {
            width: constrainedWidth,
            height: constrainedHeight
        }

        console.log('Final constrained dimensions:', constrainedDimensions)

        // Calculate position adjustments based on direction
        let newLeft = left
        let newTop = top

        const isVerticalHandle = ['n', 's'].includes(direction)
        const isHorizontalHandle = ['e', 'w'].includes(direction)
        const isCornerHandle = ['nw', 'ne', 'sw', 'se'].includes(direction)

        if (isVerticalHandle) {
            // Center horizontally when resizing vertically
            const widthDiff = constrainedDimensions.width - width
            newLeft = left - (widthDiff / 2)
        } else if (isHorizontalHandle) {
            // Center vertically when resizing horizontally
            const heightDiff = constrainedDimensions.height - height
            newTop = top - (heightDiff / 2)
        } else if (isCornerHandle) {
            // Adjust position based on corner direction for aspect ratio
            const positionAdjustments = this._getCornerPositionAdjustments(
                direction,
                constrainedDimensions.width,
                constrainedDimensions.height
            )
            newLeft = positionAdjustments.left
            newTop = positionAdjustments.top
        }

        return {
            width: constrainedDimensions.width,
            height: constrainedDimensions.height,
            left: newLeft,
            top: newTop
        }
    }

    private _getCornerPositionAdjustments(direction: string, newWidth: number, newHeight: number) {
        const adjustmentMap: Record<string, () => { left: number; top: number }> = {
            nw: () => ({
                left: this._startLeft + (this.startWidth - newWidth),
                top: this._startTop + (this.startHeight - newHeight)
            }),
            ne: () => ({
                left: this._startLeft,
                top: this._startTop + (this.startHeight - newHeight)
            }),
            sw: () => ({
                left: this._startLeft + (this.startWidth - newWidth),
                top: this._startTop
            }),
            se: () => ({
                left: this._startLeft,
                top: this._startTop
            })
        };

        return adjustmentMap[direction]?.() || { left: this._startLeft, top: this._startTop }
    }

    private _getDraggable(): Draggable | null {
        if (this._draggable) {
            return this._draggable
        }

        this._draggable = this._draggableStore.draggable
        if (this._draggable) {
            log.debug('Draggable instance retrieved from store:', this._draggable)
            return this._draggable
        }
        return null
    }

    private _getElementMetrics(element: HTMLElement) {
        const style = getComputedStyle(element)
        return {
            width: parseFloat(style.width),
            height: parseFloat(style.height),
            top: parseFloat(style.top),
            left: parseFloat(style.left),
            right: parseFloat(style.right),
            bottom: parseFloat(style.bottom)
        }
    }

    private _handleResize(event: any, direction: string) {
        if (!this._isResizing) return
        const img = this.shadowRoot?.querySelector('img') as HTMLImageElement
        if (!img) return

        const dx = event.clientX - this._startX,
            dy = event.clientY - this._startY

        let newWidth = this.startWidth,
            newHeight = this.startHeight,
            newLeft = this._startLeft,
            newTop = this._startTop

        switch (direction) {
            case 'n': // top
                newHeight = this.startHeight - dy
                newTop = this._startTop + dy
                break
            case 'ne': // top-right
                newWidth = this.startWidth + dx
                newHeight = this.startHeight - dy
                newTop = this._startTop + dy
                break
            case 'e': // right
                newWidth = this.startWidth + dx
                break
            case 'se': // bottom-right
                newWidth = this.startWidth + dx
                newHeight = this.startHeight + dy
                break
            case 's': // bottom
                newHeight = this.startHeight + dy
                break
            case 'sw': // bottom-left
                newWidth = this.startWidth - dx
                newHeight = this.startHeight + dy
                newLeft = this._startLeft + dx
                break
            case 'w': // left
                newWidth = this.startWidth - dx
                newLeft = this._startLeft + dx
                break
            case 'nw': // top-left
                newWidth = this.startWidth - dx
                newHeight = this.startHeight - dy
                newLeft = this._startLeft + dx
                newTop = this._startTop + dy
                break
        }

        // Maintain aspect ratio when holding Shift
        if (event.shiftKey) {
            log.log('Maintaining aspect ratio with Shift key pressed')
            log.log('Start dimensions:', { width: this.startWidth, height: this.startHeight, aspectRatio: this.startWidth / this.startHeight })
            log.log('New dimensions before constraint:', { width: newWidth, height: newHeight })

            const aspectRatioResult = this._applyAspectRatioConstraints(direction, newWidth, newHeight, newLeft, newTop)
            newWidth = aspectRatioResult.width
            newHeight = aspectRatioResult.height
            newLeft = aspectRatioResult.left
            newTop = aspectRatioResult.top

            log.log('New dimensions after constraint:', { width: newWidth, height: newHeight })
        }

        const minSize = 50
        newWidth = Math.max(minSize, newWidth)
        newHeight = Math.max(minSize, newHeight)

        if (this._imageDimension) {
            this._imageDimension = {
                ...this._imageDimension,
                width: newWidth,
                height: newHeight
            }
            this.dimensionsStore.setResizeState(this._imageDimension)
        }

        this._setResizeTo(direction, {
            left: newLeft,
            top: newTop,
            width: newWidth,
            height: newHeight
        })
    }



    private _setResizeTo(
        direction?: string,
        bounds: object = {
            left: this._startLeft,
            top: this._startTop,
            width: this.startWidth,
            height: this.startHeight,
        }) {
        const img = this.shadowRoot?.querySelector('img') as HTMLImageElement | null
        if (!img) return
        const handle = this.shadowRoot?.querySelector('.resize-handle.' + direction) as HTMLDivElement

        if (handle) {
            gsap.set(handle, { x: 0, y: 0 })
        }

        log.log('Setting resize to:', bounds, 'for direction:', direction)

        gsap.set(this._resizableBox, bounds)
    }

    private _updateResize(dimension: ImageDimension | null) {
        if(!dimension) return

        this._imageDimension = dimension

        this._setResizeTo('ne', {
            left: this._startLeft,
            top: this._startTop,
            width: this._imageDimension.width,
            height: this._imageDimension.height
        })

        log.debug('Updating resize with new dimensions:', dimension)
    }
}
