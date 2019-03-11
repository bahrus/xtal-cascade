import { XtalTreeBasic } from 'xtal-tree/xtal-tree-basic.js';
import {RenderOptions, RenderContext} from 'trans-render/init.d.js';
import {init} from 'trans-render/init.js';
import {define} from 'xtal-element/define.js';
import {createTemplate} from 'xtal-element/utils.js';
import {decorate, attribs} from 'trans-render/decorate.js';
import {insertAdjacentTemplate} from 'trans-render/insertAdjacentTemplate.js';
import {XtalCascade} from './xtal-cascade.js';
import 'p-d.p-u/p-unt.js';
import '@material/mwc-checkbox/mwc-checkbox.js';
const selectors = createTemplate(/* html */`
  <span class="toggler" select-node="[[item]]" p-d-if="p-d-r">
    <mwc-checkbox checked="[[item.isSelected]]" indeterminate="[[item.isIndeterminate]]"></mwc-checkbox>
    <xtal-split search="[[search]]" text-content="[[item.name]]"></xtal-split>
  </span>
`);
const style = createTemplate(/* html */`
  <style>
    .toggler{
      display:flex;
      flex-direction:row;
      align-items:center;
    }
  </style>
`);
const cascadeT = createTemplate(/* html */`
  <xtal-cascade id="myCascade"></xtal-cascade>
  <p-d on="selected-root-nodes-changed" to="iron-list" prop="hasNewNodeSelection" val="target.id" m="1" skip-init></p-d>
   <p-unt on="selected-root-nodes-changed" dispatch to="selected-nodes-changed" bubbles skip-init></p-unt>
`);
const selectedNodeEvent = 'selectedNodeEvent';
export class XtalCascadeBasic extends XtalTreeBasic {
  static get is(){return 'xtal-cascade-basic';}
  _renderOptions = {
    initializedCallback: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => {
        init(target, {
          Transform:{
            'p-d[on="fetch-complete"]': ({target}) => {
              decorate<any>(target as any, {
                [attribs]:{
                  m: '2',
                  to: 'xtal-tree,xtal-cascade'
                }
              })
            },
            'p-d[prop="items"]': ({target}) =>{
              insertAdjacentTemplate(cascadeT, target, 'afterend');
              // const clone = cascadeT.content.cloneNode(true);
              // let appendTarget = target;
              // Array.from((<any>clone).children).forEach(child =>{
              //   appendTarget = appendTarget.insertAdjacentElement('afterend', child as HTMLElement);
              // })
            },
            [XtalCascade.is]: ({target}) => decorate<XtalCascade>(target as XtalCascade, {
              childrenFn: node => (<any>node).children,
              keyFn: node => (<any>node).path,
              toggleIndeterminateFn: node => {
                (<any>node).isIndeterminate = !(<any>node).isIndeterminate;
              },
              toggleNodeSelectionFn: node => {
                (<any>node).isSelected = !(<any>node).isSelected;
              },
              isIndeterminateFn: node => (<any>node).isIndeterminate,
              isSelectedFn: node => (<any>node).isSelected,
            } as XtalCascade, {}),
            'iron-list':{
              template: ({target}) =>{
                const content = (target as HTMLTemplateElement).content;
                const xtalSplit = content.querySelector('xtal-split');
                xtalSplit.remove();
                const span = content.querySelector('span');
                const selClone = selectors.content.cloneNode(true) as HTMLSpanElement;
                span.insertAdjacentElement('afterend', selClone.firstElementChild);
              }
            },
            'iron-list[id]': ({target}) => {
              decorate<HTMLElement>(target as HTMLElement, {} as HTMLElement, {
                on:{
                  'click': e =>{
                    if((e.target as HTMLElement).localName !== 'mwc-checkbox') return;
                    e.target.dispatchEvent(new CustomEvent(selectedNodeEvent, {
                      bubbles: true,
                      detail: {
                        selectedNode: (<any>e).target.parentNode.selectNode
                      }
                    }))
                  }

                },
                props:{
                  hasNewNodeSelection: false
                },
                methods:{
                  onPropsChange: function (name, newVal) {
                    switch (name) {
                      case 'hasNewNodeSelection':
                        this._render();
                        break;
                    }
                  }
                }
              })
            }
          }
        });
        target.appendChild(style.content.cloneNode(true));
    }
  } as RenderOptions;
  get renderOptions(): RenderOptions {
    return this._renderOptions;
  }
  // nodeClickEvent:{
  //   action: e =>{
  //     (this.root.querySelector(XtalTree.is) as XtalTree).toggledNode = (<any>e).detail.toggledNode;
  //   }
  // }
  get eventContext(){
    const s = super.eventContext;
    s.eventRules[selectedNodeEvent] = {
      action: e => {
        (this.root.querySelector(XtalCascade.is) as XtalCascade).toggledNodeSelection = (<any>e).detail.selectedNode;
      }
    };
    return s;
  }
}
define(XtalCascadeBasic);

