import { XtalTreeBasic } from 'xtal-tree/xtal-tree-basic.js';
import { init } from 'trans-render/init.js';
import { define } from 'xtal-element/define.js';
export class XtalCascadeBasic extends XtalTreeBasic {
    constructor() {
        super(...arguments);
        this._renderOptions = {
            initializedCallback: (ctx, target) => {
                init(target, {});
            }
        };
    }
    static get is() { return 'xtal-cascade-basic'; }
    get renderOptions() {
        return this._renderOptions;
    }
}
define(XtalCascadeBasic);
