import { createDraggableStore } from '@renderer-stores/draggable-store'
import tailwindStyles from '@ui/input.css?inline'
import { gsap } from "gsap"
import { Draggable } from "gsap/Draggable"
import { css, html, LitElement, unsafeCSS } from "lit"
import { customElement } from "lit/decorators.js"
import log from 'loglevel'

@customElement('drag-image-container')
export class DragImageContainer extends LitElement {
    static styles = [
        css`
            :host {
                display: block;
                width: 100%;
                height: 100%;
            }
        `,
        unsafeCSS(tailwindStyles)
    ]

    private _draggable: Draggable | null = null
    private _draggableStore = createDraggableStore(this)

    private get _resizableBox(): HTMLElement | null {
        // Get the resizable-box child element directly
        return this.querySelector('resizable-box') as HTMLElement || null
    }

    constructor() {
        super()
        gsap.registerPlugin(Draggable)
    }

    private _initializeDraggable() {
        if (!this._resizableBox || this._draggable) return
        
        const shadowRoot = this._resizableBox.shadowRoot
        const firstChild = shadowRoot?.firstElementChild as HTMLElement

        if (firstChild) {
            this._draggable = Draggable.create(firstChild, {
                type: "x,y",
                activeCursor: "grabbing",
                cursor: "grab",
            })[0]

            this._draggableStore.setDraggableInstance(this._draggable)
        } else {
            log.warn('No first child found in shadow DOM')
        }
    }

    private _onDragStart(e: PointerEvent) {
        e.stopPropagation()
        // Make sure draggable is initialized
        if (this._draggable) return
        this._initializeDraggable()
    }

    render() {
        return html`
            <div 
                id="drag-image-container"
                class="relative size-full overflow-hidden bg-gray-500 rounded-lg shadow-md"
                @pointerenter=${this._onDragStart}>
                <slot></slot>
            </div>
        `;
    }
}