import { css, html, LitElement } from "lit"
import { customElement } from "lit/decorators.js"
import log from "loglevel";

@customElement('spinner-preloader')
export class SpinnerPreloader extends LitElement {
    static styles = css`
        :host {
            --spinner-background-color: hsl(186 100% 60%);

            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.1);
            backdrop-filter: blur(2px);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        }
        .spinner {
            animation: spin 1s linear infinite;
            background: transparent;
            border: .5rem solid var(--spinner-background-color);
            border-top: .5rem solid hsl(from var(--spinner-background-color) h s calc(l - 25));
            border-radius: 50%;
            width: 2.5rem;
            height: 2.5rem;
            
        }

        @keyframes spin {
            0% {
                transform: rotate(0deg);
            }
            100% {
                transform: rotate(360deg);
            }
        }        
    `;

    render() {
        return html`
            <div class="spinner">
                <svg width="40" height="40" viewBox="0 0 40 40">
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="var(--spinner-background-color)"
                        stroke-width="4"
                        stroke-linecap="round"
                        stroke-dasharray="80"
                        stroke-dashoffset="60"
                        opacity="0.8">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="0 20 20;360 20 20"
                            dur="1s"
                            repeatCount="indefinite"/>
                    </circle>
                    <circle
                        cx="20"
                        cy="20"
                        r="16"
                        fill="none"
                        stroke="hsl(from var(--spinner-background-color) h s calc(l + 10))"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-dasharray="50"
                        stroke-dashoffset="25"
                        opacity="0.6">
                        <animateTransform
                            attributeName="transform"
                            type="rotate"
                            values="360 20 20;0 20 20"
                            dur="1.5s"
                            repeatCount="indefinite"/>
                    </circle>
                </svg>
            </div>
        `
    }

    connectedCallback(): void {
        super.connectedCallback()
        this.style.display = 'none' // Hide by default
        this._handleSpinnerPreloaderEvent = this._handleSpinnerPreloaderEvent.bind(this)
        window.addEventListener('spinner-preloader', this._handleSpinnerPreloaderEvent as EventListener)
    }

    private _handleSpinnerPreloaderEvent(event: CustomEvent) {
        const { show } = event.detail
        log.info('Spinner Preloader Event:', show)
        this.style.display = show ? 'flex' : 'none'
    }
}