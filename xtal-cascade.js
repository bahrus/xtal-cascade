import { XtallatX } from 'xtal-element/xtal-latx';
/**
 * `xtal-cascade`
 *  Cascade node selection up and down a tree collection
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class XtalCascade extends XtallatX(HTMLElement) {
    static get is() { return 'xtal-cascade'; }
    get childrenFn() {
        return this._childrenFn;
    }
    set childrenFn(nodeFn) {
        this._childrenFn = nodeFn;
        this.onPropsChange();
    }
    get keyFn() {
        return this._keyFn;
    }
    set keyFn(nodeFn) {
        this._keyFn = nodeFn;
        this.onPropsChange();
    }
    get isSelectedFn() {
        return this._isSelectedFn;
    }
    set isSelectedFn(nodeFn) {
        this._isSelectedFn = nodeFn;
        this.onPropsChange();
    }
    get isIndeterminateFn() {
        return this._isIndeterminateFn;
    }
    set isIndeterminateFn(nodeFn) {
        this._isIndeterminateFn = nodeFn;
        this.onPropsChange();
    }
    get toggleNodeSelectionFn() {
        return this._toggleNodeSelectionFn;
    }
    set toggleNodeSelectionFn(nodeFn) {
        this._toggleNodeSelectionFn = nodeFn;
        this.onPropsChange();
    }
    get toggleIndeterminateFn() {
        return this._toggleInterminateFn;
    }
    set toggleIndeterminateFn(nodeFn) {
        this._toggleInterminateFn = nodeFn;
        this.onPropsChange();
    }
    get toggledNodeSelection() {
        return this._toggledNodeSelection;
    }
    set toggledNodeSelection(tn) {
        this._toggledNodeSelection = tn;
        if (!this._isSelectedFn(tn)) {
            this.selectNodeAndCascade(tn);
        }
        else {
            this.unselectNodeAndCascade(tn);
        }
        //this._toggleNodeSelectionFn(tn);
        this.updateSelectedRootNodes();
    }
    connectedCallback() {
        this._upgradeProperties(['childrenFn', 'nodes', 'keyFn', 'isSelectedFn', 'isIndeterminateFn', 'selectedRootNodes', 'toggleIndeterminateFn', 'toggleNodeSelectionFn']);
    }
    selectNodeShallow(tn) {
        if (!this._isSelectedFn(tn))
            this._toggleNodeSelectionFn(tn);
        if (this._isIndeterminateFn(tn))
            this._toggleInterminateFn(tn);
    }
    unselectNodeShallow(tn) {
        if (this._isSelectedFn(tn))
            this._toggleNodeSelectionFn(tn);
        if (this._isIndeterminateFn(tn))
            this._toggleInterminateFn(tn);
    }
    setNodeIndeterminate(tn) {
        if (!this._isIndeterminateFn(tn))
            this._toggleInterminateFn(tn);
    }
    selectNodeAndCascade(tn) {
        let increaseParentSelectedChildScore = !this._isSelectedFn(tn);
        let increaseParentIndeterminateChildScore = false;
        let reduceParentIndeterminateChildScore = this._isIndeterminateFn(tn);
        this.selectNodeRecursive(tn);
        let currentNode = tn;
        do {
            const thisID = this._keyFn(currentNode);
            const parentNd = this._childToParentLookup[thisID];
            if (parentNd) {
                const parentId = this._keyFn(parentNd);
                if (increaseParentSelectedChildScore) {
                    this._selectedChildScore[parentId]++;
                }
                if (increaseParentIndeterminateChildScore) {
                    this._indeterminateChildScore[parentId]++;
                }
                if (reduceParentIndeterminateChildScore) {
                    this._indeterminateChildScore[parentId]--;
                }
                const children = this._childrenFn(parentNd);
                if (this._selectedChildScore[parentId] === children.length) {
                    increaseParentSelectedChildScore = !this._isSelectedFn(parentNd);
                    increaseParentIndeterminateChildScore = !this._isIndeterminateFn(parentNd);
                    reduceParentIndeterminateChildScore = this._isIndeterminateFn(parentNd);
                    //this._indeterminateChildScore[parentId] = 0;
                    this.selectNodeShallow(parentNd);
                }
                else {
                    //this._toggleInterminateFn(parentNd);
                    increaseParentIndeterminateChildScore = !this._isIndeterminateFn(parentNd);
                    reduceParentIndeterminateChildScore = false;
                    this.setNodeIndeterminate(parentNd);
                    increaseParentSelectedChildScore = false;
                }
            }
            currentNode = parentNd;
        } while (currentNode);
    }
    unselectNodeAndCascade(tn) {
        let reduceParentSelectedChildScore = this._isSelectedFn(tn);
        let increaseParentIndeterminateChildScore = false;
        let reduceParentIndeterminateChildScore = false;
        this.unselectNodeRecursive(tn);
        let currentNode = tn;
        do {
            const thisID = this._keyFn(currentNode);
            const parentNd = this._childToParentLookup[thisID];
            if (parentNd) {
                const parentId = this._keyFn(parentNd);
                if (reduceParentSelectedChildScore) {
                    this._selectedChildScore[parentId]--;
                }
                if (increaseParentIndeterminateChildScore) {
                    this._indeterminateChildScore[parentId]++;
                }
                if (reduceParentIndeterminateChildScore) {
                    this._indeterminateChildScore[parentId]--;
                }
                //const children = this._childrenFn(parentNd);
                if (this._selectedChildScore[parentId] === 0) {
                    if (this._indeterminateChildScore[parentId] === 0) {
                        reduceParentSelectedChildScore = this._isSelectedFn(parentNd);
                        this.unselectNodeShallow(parentNd);
                        reduceParentIndeterminateChildScore = false;
                        increaseParentIndeterminateChildScore = false; //?
                    }
                    else {
                        reduceParentIndeterminateChildScore = true; //?
                    }
                    //if(this._unse)
                }
                else {
                    if (this._isSelectedFn(parentNd)) {
                        this._toggleNodeSelectionFn(parentNd);
                        reduceParentSelectedChildScore = true;
                    }
                    else {
                        reduceParentSelectedChildScore = false;
                    }
                    if (!this._isIndeterminateFn(parentNd)) {
                        increaseParentIndeterminateChildScore = true;
                        this._toggleInterminateFn(parentNd);
                    }
                    else {
                        increaseParentIndeterminateChildScore = false;
                    }
                }
            }
            currentNode = parentNd;
        } while (currentNode);
    }
    selectNodeRecursive(tn) {
        this.selectNodeShallow(tn);
        const children = this._childrenFn(tn);
        if (children) {
            this._selectedChildScore[this._keyFn(tn)] = children.length;
            children.forEach(child => this.selectNodeRecursive(child));
        }
    }
    unselectNodeRecursive(tn) {
        this.unselectNodeShallow(tn);
        const children = this._childrenFn(tn);
        if (children) {
            this._selectedChildScore[this._keyFn(tn)] = 0;
            children.forEach(child => this.unselectNodeRecursive(child));
        }
    }
    get nodes() {
        return this._nodes;
    }
    set nodes(nodes) {
        this._nodes = nodes;
        this.onPropsChange();
    }
    onPropsChange() {
        if (!this._keyFn || !this._childrenFn || !this._nodes ||
            !this._isSelectedFn || !this._toggleNodeSelectionFn || !this._toggleInterminateFn)
            return;
        this.startCreatingChildToParentLookup();
    }
    startCreatingChildToParentLookup() {
        this._childToParentLookup = {};
        this._selectedChildScore = {};
        this._indeterminateChildScore = {};
        this.createChildToParentLookup(this._nodes, this._childToParentLookup);
        this.updateSelectedRootNodes();
    }
    createChildToParentLookup(nodes, lookup) {
        nodes.forEach(node => {
            const nodeKey = this._keyFn(node);
            const scs = this._selectedChildScore;
            scs[nodeKey] = 0;
            const children = this._childrenFn(node);
            if (children) {
                children.forEach(child => {
                    if (this._isSelectedFn(child))
                        scs[nodeKey]++;
                    const childId = this._keyFn(child);
                    lookup[childId] = node;
                });
                if (scs[nodeKey] === children.length) {
                    this.selectNodeShallow(node);
                }
                else if (scs[nodeKey] > 0) {
                    this._toggleInterminateFn(node);
                }
                this.createChildToParentLookup(children, lookup);
            }
        });
    }
    updateSelectedRootNodes() {
        this._selectedRootNodes = this._calculateSelectedRootNodes(this._nodes, []);
        this.notifySelectedRootNodesChanged();
    }
    notifySelectedRootNodesChanged() {
        this.de('selected-root-nodes', {
            value: this._selectedRootNodes,
        });
    }
    _calculateSelectedRootNodes(nodes, acc) {
        nodes.forEach(node => {
            if (this._isSelectedFn(node)) {
                acc.push(node);
            }
            else if (this._isIndeterminateFn(node)) {
                const children = this._childrenFn(node);
                if (children) {
                    this._calculateSelectedRootNodes(children, acc);
                }
            }
        });
        return acc;
    }
    get selectedRootNodes() {
        return this._selectedRootNodes;
    }
    set selectedRootNodes(nodes) {
        this._selectedRootNodes = nodes;
    }
}
customElements.define(XtalCascade.is, XtalCascade);
