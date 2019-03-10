import { XtalTreeBasic } from 'xtal-tree/xtal-tree-basic.js';
import {RenderOptions, RenderContext} from 'trans-render/init.d.js';
import {init} from 'trans-render/init.js';
import {define} from 'xtal-element/define.js';

export class XtalCascadeBasic extends XtalTreeBasic {
  static get is(){return 'xtal-cascade-basic';}
  _renderOptions = {
    initializedCallback: (ctx: RenderContext, target: HTMLElement | DocumentFragment) => {
        init(target, {

        });
    }
  } as RenderOptions;
  get renderOptions(): RenderOptions {
    return this._renderOptions;
  }
}
define(XtalCascadeBasic);

