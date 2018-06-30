import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';

/**
 * `xtal-cascade`
 * View Model for a tree with selectable nodes
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class XtalCascade extends PolymerElement {
  static get template() {
    return html`
      <style>
        :host {
          display: block;
        }
      </style>
      <h2>Hello [[prop1]]!</h2>
    `;
  }
  static get properties() {
    return {
      prop1: {
        type: String,
        value: 'xtal-cascade',
      },
    };
  }
}

window.customElements.define('xtal-cascade', XtalCascade);
