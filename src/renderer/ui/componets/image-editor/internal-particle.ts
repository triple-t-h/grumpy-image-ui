import { LitElement, css, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'
import log from "loglevel"

@customElement('particle-element')
export class Particle extends LitElement {
    @property({ type: Number }) x: number = 0.0
    @property({ type: Number }) y: number = 0.0
    @property({ type: Number }) hue: number = 184
    @property({ type: Number }) velocity: number = 0.0
    @property({ type: Number }) angle: number = 0.0
    @property({ type: Number }) gravity: number = 0.0
    @property({ type: Number }) velocityHue: number = 0.0
    @property({ type: Number }) life: number = 0.0

    private _size: number = 0

    constructor() {
        super()
        this._size = this._getRandomInt(2, 8)
    }

    private _getRandomInt(min: number, max: number): number {
        min = Math.ceil(min)
        max = Math.floor(max)
        return Math.floor(Math.random() * (max - min + 1)) + min
    }

    static styles = css`
        :host {
            position: absolute;
            pointer-events: none;
            will-change: transform, opacity;
            mix-blend-mode: color-dodge;
            z-index: 9999;
        }
        
        div {
            border-radius: 50%;
        }
    `

    render() {
        this._logDebugInfo(false)

        return html`
            <div style="
                width: ${this._size}px;
                height: ${this._size}px;
                background-color: hsla(${this.hue}, 76%, 62%, 1);
            "></div>
        `
    }

    updated(changedProperties: Map<string, any>) {
        super.updated(changedProperties)

        // Update position whenever x or y changes
        if (changedProperties.has('x') || changedProperties.has('y')) {
            this.style.left = `${this.x}px`
            this.style.top = `${this.y}px`
        }
    }

    public setStyle() {
        this.style.left = `${this.x}px`
        this.style.top = `${this.y}px`

        this._logDebugInfo(false)

        return this.style
        }

        public getParticle(): HTMLElement {
        return this
    }

    private _logDebugInfo(logFlag: boolean): void {
        if (!logFlag) return
        log.debug('Particle:', {
            x: this.x,
            y: this.y,
            size: this._size,
            hue: this.hue,
            cssText: this.style.cssText
        })
    }
}