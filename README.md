# \<xtal-cascade\>

View Model for a tree with selectable nodes

<!--
```
<custom-element-demo>
  <template>
  <div>
    <xtal-state-watch watch level="local"></xtal-state-watch>
    <p-d on="history-changed" to="#handleViewableNodesChanged{firstVisibleIndex:target.history};#selectedRootNodesChangedHandler{firstVisibleIndex:target.history}"
      m="1"></p-d>
    <h3>Basic xtal-cascade demo</h3>


    <!-- ================== Buttons / Search field ========================== -->
    <button data-expand-cmd="all">Expand All</button>
    <p-d on="click" to="xtal-tree{expandCmd:target.dataset.expandCmd}" skip-init></p-d>

    <button data-expand-cmd="none">Collapse All</button>
    <p-d on="click" to="xtal-tree{expandCmd:target.dataset.expandCmd}" skip-init></p-d>

    <!-- =================== Sort Buttons ================================= -->
    <span>
      <button data-dir="asc">Sort Asc</button>
      <button data-dir="desc">Sort Desc</button>
    </span>
    <p-d on="click" to="xtal-tree{sorted:target.dataset.dir}" skip-init m="1"></p-d>
    <input type="text" placeholder="Search">
    <p-d id="searchInput" on="input" to="xtal-split{search}"></p-d>
    <p-d on="input" to="xtal-tree{searchString}" m="1"></p-d>

    <!-- ================== Retrieve sample json file that has a dump of a bower file directory ============ -->
    <xtal-fetch fetch href="https://unpkg.com/xtal-tree@0.0.22/directory.json" as="json"></xtal-fetch>
    <p-d on="result-changed" to="xtal-tree,xtal-cascade{nodes}" m="2"></p-d>

    <!-- ================== Train xtal-tree how to intepret / manipulate the json data ===================================== -->
    <xtal-deco>
      <script nomodule>
          ({
            childrenFn: node => node.children,
            isOpenFn: node => node.expanded,
            levelSetterFn: function (nodes, level) {
              nodes.forEach(node => {
                node.style = 'margin-left:' + (level * 24) + 'px';
                if (node.children) this.levelSetterFn(node.children, level + 1)
              })
            },
            toggleNodeFn: node => {
              node.expanded = !node.expanded;
            },
            testNodeFn: (node, search) => {
              if (!search) return true;
              if (!node.nameLC) node.nameLC = node.name.toLowerCase();
              return node.nameLC.indexOf(search.toLowerCase()) > -1;
            },
            compareFn: (lhs, rhs) => {
              if (lhs.name < rhs.name) return -1;
              if (lhs.name > rhs.name) return 1;
              return 0;
            },
            props:{
              expandCmd: ''
            },
            onPropsChange(name, newVal){
              switch(name){
                case 'expandCmd':
                  switch(newVal){
                    case 'all':
                      this.allExpandedNodes = this.viewableNodes;
                      break;
                    case 'none':
                      this.allCollapsedNodes = this.viewableNodes;
                      break;
                  }
                  
              }
            }
          })
      </script>
    </xtal-deco>
    <!-- Use xtal-tree view model component to provide snapshots of flat data to iron-list -->
    <xtal-tree id="myTree"></xtal-tree>
    <p-d on="viewable-nodes-changed" to="iron-list{items}"></p-d>
    <p-d on="viewable-nodes-changed" to="#handleViewableNodesChanged{nodes}" skip-init m="1"></p-d>
    <aggregator-fn id="handleViewableNodesChanged">
      <script nomodule>
        ({ nodes, __this }) => {
          setTimeout(() => {
            nodeList.scrollToIndex(__this.firstVisibleIndex);
          }, 1)
        }
      </script>
    </aggregator-fn>

    <!-- =============== Train xtal-cascade how to interpret / manipulate json data ============================= -->
    <xtal-deco>
      <script nomodule>
        ({
          childrenFn: node => node.children,
          keyFn: node => node.path,
          toggleIndeterminateFn: node => {
            node.isIndeterminate = !node.isIndeterminate;
          },
          toggleNodeSelectionFn: node => {
            node.isSelected = !node.isSelected;
          },
          isIndeterminateFn: node => node.isIndeterminate,
          isSelectedFn: node => node.isSelected,
        })
      </script>
    </xtal-deco>
    <!--  ============== Use xtal-cascade to manage node selection with checkboxes. ============= -->
    <xtal-cascade id="myCascade"></xtal-cascade>
    <p-d on="selected-root-nodes-changed" to="iron-list{hasNewNodeSelection:target.id}" m="1" skip-init></p-d>

    <!-- =============== Style the tree UI elements -->
    <style>
      div.row {
        cursor: pointer;
        height: 40px;
        display: flex;
        flex-direction: row;

      }

      span.match {
        font-weight: bold;
        background-color: yellowgreen;
      }

      span.expander {
        margin-top: 7px;
      }

      span.toggler {
        display: flex;
        flex-direction: row;
        align-items: center;
      }
    </style>

    <!-- =========== Configure the flat list generator (iron-list) ========= -->
    <xtal-deco>
      <script nomodule>
        ({
          props: {
            hasNewNodeSelection: false
          },
          onPropsChange: function (name, newVal) {
            switch (name) {
              case 'hasNewNodeSelection':
                if(!this.items) return;
                const idx = this.firstVisibleIndex;
                this.items = this.items.slice();
                setTimeout(() => {
                  this.scrollToIndex(idx);
                }, 1);
                return this.items.slice();
            }
          }
        })
      </script>
    </xtal-deco>
    <iron-list style="height:400px" id="nodeList" mutable-data p-d-if="#searchInput">
      <template>
        <div class="node" style$="[[item.style]]" p-d-if="#searchInput">
          <div class="row" p-d-if="#searchInput">
            <span class="expander" node="[[item]]">
              <template is="dom-if" if="[[item.children]]">
                <template is="dom-if" if="[[item.expanded]]">📖</template>
                <template is="dom-if" if="[[!item.expanded]]">📕</template>
              </template>
              <template is="dom-if" if="[[!item.children]]">📝</template>
            </span>
            <p-u on="click" if="span" to="/myTree{toggledNode:target.node}"></p-u>
            <span class="toggler" select-node="[[item]]" p-d-if="#searchInput">
              <mwc-checkbox checked="[[item.isSelected]]" indeterminate="[[item.isIndeterminate]]"></mwc-checkbox>
              <xtal-split search="[[search]]" text-content="[[item.name]]"></xtal-split>
            </span>
            <p-u on="click" if="mwc-checkbox,xtal-split" to="/myCascade{toggledNodeSelection:target.parentElement.selectNode}"></p-u>
          </div>
        </div>
      </template>
    </iron-list>
    <p-d on="scroll" to="{ironList:target}"></p-d>
    <aggregator-fn>
      <script nomodule>
          ({ ironList }) => ironList.firstVisibleIndex;
      </script>
    </aggregator-fn>
    <p-d on="value-changed" to="{history}"></p-d>
    <xtal-state-commit level="local" rewrite href="/scroll"></xtal-state-commit>
    <!--Polyfill support for re(dge)tro browsers -->
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
    <!--Polymer (non minified, uses bare import specifiers, which only works in Chrome and Firefox Nightly thus far. This is just an example of a
      list generator which xtal-cascade can interface with. -->
    <script type="module" src="https://unpkg.com/@polymer/polymer@3.0.5/lib/elements/dom-if.js?module"></script>
    <script type="module" src="https://unpkg.com/@polymer/iron-list@3.0.0-pre.21/iron-list.js?module"></script>
    <!-- End Polymer refs -->
    <script type="module" src="https://unpkg.com/xtal-splitting@0.0.8/xtal-splitting.js"></script>
    <script src="https://unpkg.com/p-d.p-u@0.0.67/p-all.iife.js"></script>
    <script src="https://unpkg.com/xtal-fetch@0.0.40/xtal-fetch.js"></script>

    <script type="module" src="https://unpkg.com/xtal-tree@0.0.40/xtal-tree.js?module"></script>
    <script src="https://unpkg.com/xtal-decorator@0.0.27/xtal-decorator.iife.js"></script>
    <script type="module" src="https://unpkg.com/xtal-cascade@0.0.2/xtal-cascade.js?module"></script>
    <script type="module" src="https://unpkg.com/@material/mwc-checkbox@0.1.2/mwc-checkbox.js?module"></script>
    <script type="module" src="https://unpkg.com/aggregator-fn@0.0.10/aggregator-fn.iife.js"></script>
    <script type="module" src="https://unpkg.com/xtal-state@0.0.13/xtal-state.js"></script>
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
