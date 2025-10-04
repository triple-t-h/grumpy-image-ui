import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('image-info')
export class ImageInfo extends LitElement {
    createRenderRoot(): this {
        return this
    }

    static properties = {
        name: { type: String },
        size: { type: Number },
        type: { type: String },
    } as const

    name: string
    size: string
    type: string

    constructor() {
        super()
        this.name = ''
        this.size = ''
        this.type = ''
    }

    render() {
        return html`
            <div class="animate-fade-in info p-3 rounded-lg shadow-md bg-(--color-background-image-info) text-xs/5">
                <h2>${this.name}</h2>
                <p>Type: ${this.type}</p>
                <p>Size: ${this.size} bytes</p>
            </div>
        `
    }
}