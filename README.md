# \<xtal-cascade\>

View Model for a tree with selectable nodes

<!--
```
<custom-element-demo>
  <template>
    <div class="vertical-section-container centered">
    <h3>Basic xtal-cascade demo</h3>
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
  <script type="module">
    import "https://unpkg.com/@polymer/polymer@3.0.2/lib/elements/dom-if.js?module";
  </script>
  <script type="module" src="https://unpkg.com/@polymer/iron-list@3.0.0-pre.21/iron-list.js?module"></script>
  <script src="https://unpkg.com/xtal-splitting@0.0.1/xtal-splitting.js"></script>
  <script src="https://unpkg.com/p-d.p-u@0.0.32/p-d.p-d-x.p-u.js"></script>
  <script src="https://unpkg.com/xtal-fetch@0.0.35/xtal-fetch.js"></script>

  <script type="module" src="https://unpkg.com/xtal-tree@0.0.28/xtal-tree.js?module"></script>
  <script type="module" src="https://unpkg.com/xtal-cascade@0.0.2/xtal-cascade.js?module"></script>
  <script type="module" src="https://unpkg.com/@material/mwc-checkbox@0.1.2/mwc-checkbox.js?module"></script>
    <script>
       var fvi = -1;
      function levelSetter(nodes, level) {
        nodes.forEach(node => {
          node.style = 'margin-left:' + (level * 12) + 'px';
          if (node.children) levelSetter(node.children, level + 1)
        })
      }
      function expandAll(e){
        myTree.allExpandedNodes = myTree.viewableNodes;
      }
      function collapseAll(e){
        myTree.allCollapsedNodes = myTree.viewableNodes;
      }

    </script>
    <style>
      div.row {
        cursor: pointer;
        height:40px;
        display:flex;
        flex-direction: row;

      }

      span.match {
        font-weight: bold;
        background-color: yellowgreen;
      }
      span.expander{
        margin-top:7px;
      }
      span.toggler{
        display:flex;
        flex-direction: row;
        align-items: center;
      }
    </style>
    <button onclick="expandAll()">Expand All</button>
    <button onclick="collapseAll()">Collapse All</button>
    <span>
      <button data-dir="asc">Sort Asc</button>
      <button data-dir="desc">Sort Desc</button>
    </span>
    <p-d on="click" if="button" to="xtal-tree{sorted:target.dataset.dir}" m="1"></p-d>
    <input type="text" placeholder="Search">
    <p-d id="searchInput" on="input" to="xtal-split{search}"></p-d>
    <p-d on="input" to="xtal-tree{searchString}" m="1"></p-d>
    <xtal-fetch fetch href="https://unpkg.com/xtal-tree@0.0.22/directory.json" as="json"></xtal-fetch>
    <p-d on="result-changed" to="xtal-tree,xtal-cascade{nodes}" m="2"></p-d>
    <script type="module ish">
      ({
        childrenFn: node => node.children,
        isOpenFn: node => node.expanded,
        levelSetterFn: levelSetter,
        toggleNodeFn: node => {
          node.expanded = !node.expanded;
        },
        testNodeFn: (node, search) =>{
          if(!search) return true;
          if(!node.nameLC) node.nameLC = node.name.toLowerCase();
          return node.nameLC.indexOf(search.toLowerCase()) > -1;
        },
        compareFn: (lhs, rhs) =>{
          if(lhs.name < rhs.name) return -1 ;
          if(lhs.name > rhs.name) return 1;
          return 0;
        }
      })
    </script>
    <p-d-x on="eval" to="{childrenFn:childrenFn;isOpenFn:isOpenFn;levelSetterFn:levelSetterFn;toggleNodeFn:toggleNodeFn;testNodeFn:testNodeFn;compareFn:compareFn}"></p-d-x>
    <xtal-tree id="myTree"></xtal-tree>
    <p-d on="viewable-nodes-changed" to="iron-list{items};#viewNodesChangeHandler{input}"></p-d>
    <p-d on="toggled-node-changed" to="#toggledNodeChangeHandler{input}"></p-d>
    <script type="module ish">
      ({
        childrenFn: node => node.children,
        keyFn: node => node.path,
        toggleIndeterminateFn: node => {
          node.isIndeterminate = !node.isIndeterminate;
        },
        toggleNodeSelectionFn: node =>{
          node.isSelected = !node.isSelected;
        },
        isIndeterminateFn: node => node.isIndeterminate,
        isSelectedFn: node => node.isSelected,
      })
    </script>
    <p-d-x on="eval" to="{isSelectedFn:isSelectedFn;keyFn:keyFn;childrenFn:childrenFn;toggleIndeterminateFn:toggleIndeterminateFn;toggleNodeSelectionFn:toggleNodeSelectionFn;isIndeterminateFn:isIndeterminateFn}"></p-d-x>
    <xtal-cascade id="myCascade"></xtal-cascade>
    <p-d on="selected-root-nodes-changed" to="#selectedNodeChangeHandler{input:target}" m="1"></p-d>
    <iron-list style="height:400px" id="nodeList" mutable-data p-d-if="#searchInput">
        <template>
          <div class="node"  style$="[[item.style]]"  p-d-if="#searchInput">
            <div class="row" p-d-if="#searchInput">
                <span class="expander" node="[[item]]">
                    <template is="dom-if" if="[[item.children]]">
                        <template is="dom-if" if="[[item.expanded]]">📖</template>
                        <template is="dom-if" if="[[!item.expanded]]">📕</template>
                      </template>
                      <template is="dom-if" if="[[!item.children]]">📝</template>
                </span>
                <p-u on="click" if="span" to="/myTree{toggledNode:target.node}"></p-u>
                <span class="toggler" on-click="toggleSelectedNode"  select-node="[[item]]" p-d-if="#searchInput">
                    <mwc-checkbox checked="[[item.isSelected]]" indeterminate="[[item.isIndeterminate]]"></mwc-checkbox>
                    <xtal-split search="[[search]]" text-content="[[item.name]]"></xtal-split>
                </span>
                <p-u on="click" if="mwc-checkbox,xtal-split" to="/myCascade{toggledNodeSelection:target.parentElement.selectNode}"></p-u>
            </div>
          </div>
        </template>
      </iron-list>
      <script type="module ish">
        inp => {
          if(typeof(fvi) !== 'undefined' && fvi > -1){
            nodeList.scrollToIndex(fvi);
          }
        }
      </script>
      <p-d id="viewNodesChangeHandler" on="eval" to="{NA}"></p-d>
      <script type="module ish">
        inp =>{
          fvi = nodeList.firstVisibleIndex;
        }
      </script>
      <p-d id="toggledNodeChangeHandler" on="eval" to="{NA}"></p-d>
      <script type="module ish">
        inp =>{
          if(!nodeList.items) return;
            const idx = nodeList.firstVisibleIndex;
            nodeList.items = nodeList.items.slice();
            nodeList.scrollToIndex(idx);
        }
      </script>
      <p-d id="selectedNodeChangeHandler" on="eval" to="{NA}"></p-d>
  </div>
    </template>
</custom-element-demo>
```
-->

## Install the Polymer-CLI

First, make sure you have the [Polymer CLI](https://www.npmjs.com/package/polymer-cli) and npm (packaged with [Node.js](https://nodejs.org)) installed. Run `npm install` to install your element's dependencies, then run `polymer serve` to serve your element locally.

## Viewing Your Element

```
$ polymer serve
```

## Running Tests

```
$ polymer test
```

Your application is already set up to be tested via [web-component-tester](https://github.com/Polymer/web-component-tester). Run `polymer test` to run your application's test suite locally.
