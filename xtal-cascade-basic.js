import { XtalTreeBasic } from 'xtal-tree/xtal-tree-basic.js';
import { init } from 'trans-render/init.js';
import { define } from 'xtal-element/define.js';
import { createTemplate } from 'xtal-element/utils.js';
import { decorate } from 'trans-render/decorate.js';
import { XtalCascade } from './xtal-cascade.js';
import '@material/mwc-checkbox/mwc-checkbox.js';
const selectors = createTemplate(/* html */ `
  <span class="toggler" select-node="[[item]]" p-d-if="p-d-r">
    <mwc-checkbox checked="[[item.isSelected]]" indeterminate="[[item.isIndeterminate]]"></mwc-checkbox>
    <xtal-split search="[[search]]" text-content="[[item.name]]"></xtal-split>
  </span>
`);
const selectedNodeEvent = 'selectedNodeEvent';
export class XtalCascadeBasic extends XtalTreeBasic {
    constructor() {
        super(...arguments);
        this._renderOptions = {
            initializedCallback: (ctx, target) => {
                console.log(target);
                init(target, {
                    Transform: {
                        'p-d[prop="items"]': ({ target }) => {
                            const cascade = document.createElement('xtal-cascade');
                            cascade.id = 'myCascade';
                            // target.insertAdjacentHTML('afterend', /* html */`
                            //   <xtal-cascade id="myCascade"></xtal-cascade>
                            //   <p-d on="selected-root-nodes-changed" to="iron-list" prop="hasNewNodeSelection" val="target.id" m="1" skip-init></p-d>
                            // `);
                            target.insertAdjacentElement('afterend', cascade);
                            const pd = document.createElement('p-d');
                            decorate(pd, {
                                attribs: {
                                    on: 'selected-root-nodes-changed',
                                    to: 'iron-list',
                                    prop: 'hasNewNodeSelection',
                                    val: 'target.id',
                                    m: '1',
                                    'skip-init': true
                                }
                            });
                            cascade.insertAdjacentElement('afterend', pd);
                        },
                        'iron-list': {
                            template: ({ target }) => {
                                const content = target.content;
                                const xtalSplit = content.querySelector('xtal-split');
                                xtalSplit.remove();
                                const span = content.querySelector('span');
                                const selClone = selectors.content.cloneNode(true);
                                span.insertAdjacentElement('afterend', selClone.firstElementChild);
                            }
                        },
                        'iron-list[id]': ({ target }) => {
                            decorate(target, {}, {
                                on: {
                                    'click': e => {
                                        if (e.target.localName !== 'mwc-checkbox')
                                            return;
                                        e.target.dispatchEvent(new CustomEvent(selectedNodeEvent, {
                                            bubbles: true,
                                            detail: {
                                                selectedNode: e.target.parentNode.selectNode
                                            }
                                        }));
                                    }
                                }
                            });
                        }
                    }
                });
            }
        };
    }
    static get is() { return 'xtal-cascade-basic'; }
    get renderOptions() {
        return this._renderOptions;
    }
    // nodeClickEvent:{
    //   action: e =>{
    //     (this.root.querySelector(XtalTree.is) as XtalTree).toggledNode = (<any>e).detail.toggledNode;
    //   }
    // }
    get eventContext() {
        const s = super.eventContext;
        s.eventRules[selectedNodeEvent] = {
            action: e => {
                this.root.querySelector(XtalCascade.is).toggledNodeSelection = e.detail.selectedNode;
            }
        };
        return s;
    }
}
define(XtalCascadeBasic);
