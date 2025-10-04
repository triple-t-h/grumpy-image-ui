import { createSnackbarStore, SnackbarStoreController } from '@stores/snackbar-store'
import { gsap } from 'gsap'
import { SplitText } from 'gsap/SplitText'
import { css, html, LitElement, PropertyValues } from 'lit'
import { customElement, query } from 'lit/decorators.js'
import log from 'loglevel'

@customElement('snackbar-component')
export class Snackbar extends LitElement {
    static styles = css`

        :host {
            --ok-background-color: hsl(186 100% 60%);
            --failure-background-color: hsl(345 100% 60%);
            --triangle-metrics: 1.25rem;

            position: fixed;
            bottom: 2rem;
            left: 50%;
            max-height: calc(var(--triangle-metrics) * 4);
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 0.5rem;
            pointer-events: none;
            z-index: 10000;
            /* border: 1px solid white; */
        }        

        .snackbar {  
            color: var(--color-stone-900);
            padding: 0.75rem 1.5rem;
            border-radius: 0.375rem;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3);  
            display: flex;
            align-items: center;
            justify-content: space-between;
            pointer-events: auto;
            opacity: 0;
            animation: fadein 0.5s cubic-bezier(.4,0,.2,1) forwards;
            border: 1px solid transparent;
            position: relative;
        }
        .message {
            flex: 1;
            padding: 0 1rem;
            border: 1px solid transparent;
        }
        .action-button {
            background: none;
            border: none;
            color: var(--color-indigo-900);
            cursor: pointer;
            font-weight: 600;
            margin-left: 1rem;
        }
        @keyframes fadein {
            from { bottom: 0; opacity: 0; }
            to { bottom: 1rem; opacity: 1; }
        }
        @keyframes fadeout {
            from { bottom: 1rem; opacity: 1; }
            to { bottom: 0; opacity: 0; }
        }
        .snackbar.show {
            opacity: 1;
            animation: fadein 0.5s cubic-bezier(.4,0,.2,1) forwards;
        }
        .snackbar.hide {
            opacity: 0;
            animation: fadeout 0.5s cubic-bezier(.4,0,.2,1) forwards;
        }

        .triangle-top {
            display: block;
            width: var(--triangle-metrics);
            height: var(--triangle-metrics);
            background-color: var(--failure-background-color);
            border: 1px solid var(--failure-background-color);
            clip-path: polygon(50% 0%, 0% 100%, 100% 100%);
        }

        .triangle-bottom {
            display: block;
            width: var(--triangle-metrics);
            height: var(--triangle-metrics);
            background-color: var(--failure-background-color);
            border: 1px solid var(--failure-background-color);
            clip-path: polygon(50% 100%, 0% 0%, 100% 0%);
        }

        #background-effect {
            position: absolute;
            top: 50%;
            left: 50%;            
            min-width: 100%;
            height: 100%;
            transform: translate(-55%, -50%);
            z-index: -1;
            pointer-events: none;
            /* border: 1px solid white; */
        }
    `;

    render() {
        return html`
            <div class="snackbar show" id="snackbar">
                <div id="background-effect"></div>
                <div class="message">
                    <p>Text</p>
                </div>
                <button class="action-button" id="actionButton" @pointerdown=${this._removeBackgroundEffect.bind(this)}>Close</button>
            </div>
        `
    }

    @query('#background-effect')
    private _backgroundEffect!: HTMLDivElement

    @query('.message > p')
    private _messageTextElement!: HTMLParagraphElement

    private _timeline?: gsap.core.Timeline
    private _triangles = [] as HTMLDivElement[]
    private _snackbarStore: SnackbarStoreController = createSnackbarStore(this)

    connectedCallback(): void {
        super.connectedCallback()
        log.info('Snackbar connected to DOM')
        gsap.registerPlugin(SplitText)
        this._snackbarStore.setMessage(false, 'Welcome to the Application!')
    }

    firstUpdated(_changedProperties: PropertyValues): void {
        log.info('Snackbar firstUpdated', _changedProperties)
        gsap.set(this, { display: 'none' })
        super.firstUpdated(_changedProperties)
    }

    async updated(_changedProperties: PropertyValues): Promise<void> {
        const { isVisible, message } = this._snackbarStore.state
        if (isVisible && message) {
            await document.fonts.ready
            this._addBackgroundEffect(message.isError, message.message)
        }
        super.updated(_changedProperties)
    }

    private _addBackgroundEffect(isError: boolean, message: string): void {
        if (!this._backgroundEffect) return

        if (this._timeline && this._timeline.isActive()) {
            return
        }

        gsap.set(this, { display: 'flex' })

        // Clear existing triangles
        this._backgroundEffect.innerHTML = ''

        this._messageTextElement.textContent = message

        const hostStyle = getComputedStyle(this)
            , hostRect = this.getBoundingClientRect()
            , width = hostRect.width + parseFloat(hostStyle.marginLeft) + parseFloat(hostStyle.marginRight)
            , backgroundEffectRect = this._backgroundEffect.parentElement!.getBoundingClientRect()
            , triangleSize = parseFloat(getComputedStyle(this).getPropertyValue('--triangle-metrics')) * 16
            , numCols = Math.floor(backgroundEffectRect.width / triangleSize * 2) + (triangleSize >> 2)
            , numRows = Math.floor(backgroundEffectRect.height / triangleSize)

        gsap.set(this._backgroundEffect, {
            width: width,
            maxHeight: triangleSize * numRows
        })

        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                const triangle = document.createElement('div')

                triangle.classList.add(this._getTriangleDirection(col, numCols))

                this._triangles.push(triangle)

                const isEven = row % 2 === 0
                const left = col * (triangleSize >> 1) - (isEven ? 0 : triangleSize >> 1)

                gsap.set(triangle, {
                    backgroundColor: isError ? 'var(--failure-background-color)' : 'var(--ok-background-color)',
                    borderColor: isError ? 'var(--failure-background-color)' : 'var(--ok-background-color)',
                    position: 'absolute',
                    left: left,
                    top: row * triangleSize,
                })

                this._backgroundEffect.appendChild(triangle)
            }
        }

        this._timeline?.clear()
        this._timeline = gsap.timeline()
        this._timeline.timeScale(1)

        const split = new SplitText(this._messageTextElement, { type: 'words,chars' })
            , chars = split.chars

        this._timeline
            .set(this, { autoAlpha: 1, })
            .from(this._triangles, {
                duration: .8,
                autoAlpha: 0,
                y: -20,
                stagger: {
                    each: 0.02,
                    from: 'center',
                    grid: [numCols, numRows],
                },
                ease: 'power4.out',
            })
            .from(chars, {
                duration: 0.6,
                autoAlpha: 0,
                y: 20,
                ease: 'power4.out',
                stagger: {
                    each: 0.02,
                    from: 'center',
                    grid: [numCols, numRows],
                },
            }, '-=0.5').eventCallback('onComplete', () => {
                setTimeout(() => {
                    this._removeBackgroundEffect()
                }, 3000)
            })

    }

    private _getTriangleDirection(col: number, numCols: number): string {
        const css = ['triangle-top', 'triangle-bottom']

        // Last column always gets triangle-bottom
        if (col === numCols - 1) {
            return css[1] // triangle-bottom
        }

        // Other columns alternate normally
        if (col % 2 === 0) {
            return css[0] // triangle-top
        }
        return css[1] // triangle-bottom
    }

    private _removeBackgroundEffect(): void {
        if (!this._backgroundEffect) return
        this._timeline?.to(this._triangles, {
            duration: .5,
            scale: 0,
            stagger: { each: 0.01, from: 'center' },
            onComplete: () => {
                this._backgroundEffect.innerHTML = ''
                this._triangles = []
            }
        }).to(this, {
            duration: .5,
            autoAlpha: 0,
        }).then(() => {
            this._backgroundEffect.innerHTML = ''
            this._timeline = undefined
            // hide the component
            gsap.set(this, { display: 'none' })
        })
    }
}