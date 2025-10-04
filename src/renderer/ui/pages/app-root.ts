import '@components/image-editor'
import '@components/image-preview'
import '@components/snackbar'
import '@components/spinner-preloader'
import '@material/web/all'
import { LitElement, html } from 'lit'
import { customElement } from 'lit/decorators.js'

@customElement('app-root')
export class AppRoot extends LitElement {
  // Remove Shadow DOM to use global styles from main.css
  // This allows both Tailwind CSS classes AND custom animations to work
  createRenderRoot(): this {
    return this
  }

  render() {
    return html`
      <main class="animate-fade-in flex flex-row h-screen w-screen px-2 justify-center items-center gap-x-2">
        <spinner-preloader></spinner-preloader>
        ${this._imagePreview()}
        ${this._imageEditor()}      
        ${this._snackbar()}
      </main>
    `
  }

  private _imagePreview() {
    return html`<image-preview class="animate-fade-in"></image-preview>`
  }

  private _imageEditor() {
    return html`<image-editor class="animate-fade-in"></image-editor>`
  }

  private _snackbar() {
    return html`<snackbar-component></snackbar-component>`
  }
}