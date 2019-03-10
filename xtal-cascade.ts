import { XtallatX } from 'xtal-element/xtal-latx';

export interface ITreeNode {
}

export interface ITree {
    nodes: ITreeNode[];
    childrenFn: (tn: ITreeNode) => ITreeNode[];

}
/**
 * `xtal-cascade`
 *  Cascade node selection up and down a tree collection 
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
export class XtalCascade extends XtallatX(HTMLElement) {
    static get is(){return 'xtal-cascade';}

    _childrenFn: (tn: ITreeNode) => ITreeNode[];
    get childrenFn() {
        return this._childrenFn;
    }
    set childrenFn(nodeFn) {
        this._childrenFn = nodeFn;
        this.onPropsChange();
    }

    _keyFn: (tn: ITreeNode) => string;
    get keyFn() {
        return this._keyFn;
    }
    set keyFn(nodeFn) {
        this._keyFn = nodeFn;
        this.onPropsChange();
    }

    _isSelectedFn: (tn: ITreeNode) => boolean;
    get isSelectedFn() {
        return this._isSelectedFn;
    }
    set isSelectedFn(nodeFn) {
        this._isSelectedFn = nodeFn;
        this.onPropsChange();
    }

    _isIndeterminateFn: (tn: ITreeNode) => boolean;
    get isIndeterminateFn() {
        return this._isIndeterminateFn;
    }
    set isIndeterminateFn(nodeFn) {
        this._isIndeterminateFn = nodeFn;
        this.onPropsChange();
    }

    _toggleNodeSelectionFn: (tn: ITreeNode) => boolean;
    get toggleNodeSelectionFn() {
        return this._toggleNodeSelectionFn;
    }
    set toggleNodeSelectionFn(nodeFn) {
        this._toggleNodeSelectionFn = nodeFn;
        this.onPropsChange();
    }

    _toggleInterminateFn: (tn: ITreeNode) => void;
    get toggleIndeterminateFn() {
        return this._toggleInterminateFn;
    }
    set toggleIndeterminateFn(nodeFn) {
        this._toggleInterminateFn = nodeFn;
        this.onPropsChange();
    }

    _toggledNodeSelection;
    get toggledNodeSelection(){
        return this._toggledNodeSelection;
    }
    set toggledNodeSelection(tn: ITreeNode) {
        this._toggledNodeSelection = tn;
        if (!this._isSelectedFn(tn)) {
            this.selectNodeAndCascade(tn);
        } else {
            this.unselectNodeAndCascade(tn);
        }
        //this._toggleNodeSelectionFn(tn);
        this.updateSelectedRootNodes();
    }



    connectedCallback() {
        this._upgradeProperties(['childrenFn', 'nodes', 'keyFn', 'isSelectedFn', 'isIndeterminateFn', 'selectedRootNodes', 'toggleIndeterminateFn', 'toggleNodeSelectionFn'])

    }

    selectNodeShallow(tn: ITreeNode) {
        if (!this._isSelectedFn(tn)) this._toggleNodeSelectionFn(tn);
        if (this._isIndeterminateFn(tn)) this._toggleInterminateFn(tn);
    }

    unselectNodeShallow(tn: ITreeNode) {
        if (this._isSelectedFn(tn)) this._toggleNodeSelectionFn(tn);
        if (this._isIndeterminateFn(tn)) this._toggleInterminateFn(tn);
    }

    setNodeIndeterminate(tn: ITreeNode) {
        if (!this._isIndeterminateFn(tn)) this._toggleInterminateFn(tn);
    }

    selectNodeAndCascade(tn: ITreeNode) {
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
                if(increaseParentSelectedChildScore){
                    this._selectedChildScore[parentId]++;
                }
                if(increaseParentIndeterminateChildScore){
                    this._indeterminateChildScore[parentId]++;
                }
                if(reduceParentIndeterminateChildScore){
                    this._indeterminateChildScore[parentId]--;
                }
                const children = this._childrenFn(parentNd);
                if (this._selectedChildScore[parentId] === children.length) {
                    increaseParentSelectedChildScore = !this._isSelectedFn(parentNd);
                    increaseParentIndeterminateChildScore = !this._isIndeterminateFn(parentNd);
                    reduceParentIndeterminateChildScore = this._isIndeterminateFn(parentNd);
                    //this._indeterminateChildScore[parentId] = 0;
                    this.selectNodeShallow(parentNd);
                } else {
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

    unselectNodeAndCascade(tn: ITreeNode) {
        let reduceParentSelectedChildScore = this._isSelectedFn(tn);
        let increaseParentIndeterminateChildScore = false;
        let reduceParentIndeterminateChildScore = false;
        this.unselectNodeRecursive(tn); //downward
        let currentNode = tn;
        
        do {
            const thisID = this._keyFn(currentNode);
            const parentNd = this._childToParentLookup[thisID];
            if (parentNd) {
                const parentId = this._keyFn(parentNd);
                const allChildrenOfParentSelected = this._selectedChildScore[parentId] === this._childrenFn(parentNd).length;
                if(reduceParentSelectedChildScore){
                    this._selectedChildScore[parentId]--;
                }
                if(increaseParentIndeterminateChildScore){
                    this._indeterminateChildScore[parentId]++;
                }
                if(reduceParentIndeterminateChildScore){
                    this._indeterminateChildScore[parentId]--;
                }                
                //const children = this._childrenFn(parentNd);
                if (this._selectedChildScore[parentId] === 0) {
                    //No more selected children
                    if(this._isSelectedFn(parentNd)){
                        if(this._indeterminateChildScore[parentId] === 0){
                            //ready to unselect parent
                            reduceParentIndeterminateChildScore = false;
                            increaseParentIndeterminateChildScore = false;//?
                        }else{
                            //Still have some indeterminate
                            reduceParentIndeterminateChildScore = true;
                            if(!this._isIndeterminateFn(parentNd)) {  //do we need this?
                                this._toggleInterminateFn(parentNd);
                            }
                        }
                        this.unselectNodeShallow(parentNd);
                        reduceParentSelectedChildScore = true;
                    }else if(this._isIndeterminateFn(parentNd)){
                        //this._indeterminateChildScore[parentId]--;
                        if(this._indeterminateChildScore[parentId] === 0){
                            this._toggleInterminateFn(parentNd);
                            reduceParentIndeterminateChildScore = true;
                        }
                    }else if(this._indeterminateChildScore[parentId] === 0){
                        if(this._isIndeterminateFn(parentNd)){
                            this._toggleInterminateFn(parentNd);
                            reduceParentIndeterminateChildScore = true;
                        }
                    }
                } else {
                    if(allChildrenOfParentSelected){
                        this.unselectNodeShallow(parentNd);
                        //need to sent parent to interminant
                        this._toggleInterminateFn(parentNd);
                        increaseParentIndeterminateChildScore = true;
                        reduceParentIndeterminateChildScore = false;
                    }else{
                        // //no change to intermediate
                        // if (this._isSelectedFn(parentNd)) {
                        //     this._toggleNodeSelectionFn(parentNd);
                        //     reduceParentSelectedChildScore = true;
                        // }else{
                        //     reduceParentSelectedChildScore = false;
                        // }
                        increaseParentIndeterminateChildScore = false;
                        reduceParentIndeterminateChildScore = false;
                    }

                    
                }
            }
            currentNode = parentNd;
        } while (currentNode);
    }



    selectNodeRecursive(tn: ITreeNode) {
        this.selectNodeShallow(tn);
        const children = this._childrenFn(tn);
        if (children) {
            this._selectedChildScore[this._keyFn(tn)] = children.length;
            this._indeterminateChildScore[this._keyFn(tn)] = 0;
            children.forEach(child => this.selectNodeRecursive(child));
        }
    }

    unselectNodeRecursive(tn: ITreeNode) {
        this.unselectNodeShallow(tn);
        const children = this._childrenFn(tn);
        if (children) {
            this._selectedChildScore[this._keyFn(tn)] = 0;
            this._indeterminateChildScore[this._keyFn(tn)] = 0;
            children.forEach(child => this.unselectNodeRecursive(child));
        }
    }

    _nodes: ITreeNode[];
    get nodes() {
        return this._nodes;
    }

    set nodes(nodes) {
        this._nodes = nodes;
        this.onPropsChange();
    }

    onPropsChange() {
        if (!this._keyFn || !this._childrenFn || !this._nodes ||
            !this._isSelectedFn || !this._toggleNodeSelectionFn || !this._toggleInterminateFn) return;
        this.startCreatingChildToParentLookup();
    }
    _selectedChildScore: { [key: string]: number };
    _indeterminateChildScore: {[key: string]: number};
    _childToParentLookup: { [key: string]: ITreeNode };
    startCreatingChildToParentLookup() {
        this._childToParentLookup = {};
        this._selectedChildScore = {};
        this._indeterminateChildScore = {};
        this.createChildToParentLookup(this._nodes, this._childToParentLookup);
        this.updateSelectedRootNodes();
    }

    createChildToParentLookup(nodes: ITreeNode[], lookup: { [key: string]: ITreeNode }) {
        nodes.forEach(node => {
            const nodeKey = this._keyFn(node);
            const scs = this._selectedChildScore;
            const ind = this._indeterminateChildScore;
            scs[nodeKey] = 0;
            ind[nodeKey] = 0;
            const children = this._childrenFn(node);
            if (children) {
                children.forEach(child => {
                    if (this._isSelectedFn(child)) scs[nodeKey]++;
                    if(this._isIndeterminateFn(child)) ind[nodeKey]++;
                    const childId = this._keyFn(child);
                    lookup[childId] = node;
                });
                if (scs[nodeKey] === children.length) {
                    this.selectNodeShallow(node);
                } else if (scs[nodeKey] > 0) {
                    this._toggleInterminateFn(node);
                }
                this.createChildToParentLookup(children, lookup);
            }
        })
        
    }
    updateSelectedRootNodes() {
        this._selectedRootNodes = this._calculateSelectedRootNodes(this._nodes, []);
        this.notifySelectedRootNodesChanged();
    }
    notifySelectedRootNodesChanged() {
        this.de('selected-root-nodes',{
            value: this._selectedRootNodes,
        })
    }
    _calculateSelectedRootNodes(nodes: ITreeNode[], acc: ITreeNode[]) {
        nodes.forEach(node => {
            if (this._isSelectedFn(node)) {
                acc.push(node);
            } else if (this._isIndeterminateFn(node)) {
                const children = this._childrenFn(node);
                if (children) {
                    this._calculateSelectedRootNodes(children, acc);
                }
            }
        })
        return acc;
    }

    _selectedRootNodes: ITreeNode[];
    get selectedRootNodes() {
        return this._selectedRootNodes;
    }
    set selectedRootNodes(nodes: ITreeNode[]) {
        this._selectedRootNodes = nodes;
    }

}
customElements.define(XtalCascade.is, XtalCascade)
