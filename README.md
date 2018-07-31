# \<xtal-cascade\>

View Model for a tree with selectable nodes

<!--
```
<custom-element-demo>
  <template>
  <div>
    <h3>Basic xtal-cascade demo</h3>
    <!--Polyfill support for retro browsers -->
    <script src="https://unpkg.com/@webcomponents/webcomponentsjs/webcomponents-loader.js"></script>
    <!--Polymer (non minified, uses bare import specifiers, which only works in Chrome thus far. This is just an example of a
      list generator which xtal-cascade can interface with. -->
    <script type="module" src="https://unpkg.com/@polymer/polymer@3.0.5/lib/elements/dom-if.js?module"></script>
    <script type="module" src="https://unpkg.com/@polymer/iron-list@3.0.0-pre.21/iron-list.js?module"></script>
    <!-- End Polymer refs -->
    <script src="https://unpkg.com/xtal-splitting@0.0.1/xtal-splitting.js"></script>
    <script src="https://unpkg.com/p-d.p-u@0.0.56/p-all.iife.js"></script>
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
    </script>
    <script type="module">
        import {PDQ} from 'https://unpkg.com/p-d.p-u@0.0.56/PDQ.js?module';
        PDQ.define('selected-nodes-change-action', t => {
          if ((typeof (nodeList) === 'undefined') || !nodeList.items) return;
          //Restore scroll position
          const idx = nodeList.firstVisibleIndex;
          nodeList.items = nodeList.items.slice();
          //nodeList.scrollToIndex(idx);
          setTimeout(() =>{
              nodeList.scrollToIndex(idx);
          }, 1);
          return nodeList.items.slice();
        })
        PDQ.define('view-nodes-action', () =>{
          //Restore scroll position
          //Not sure why delay is needed now
          if (nodeList && fvi > -1) {
            setTimeout(() =>{
              nodeList.scrollToIndex(fvi);
            }, 1)
            
          }
        }) 
        PDQ.define('toggled-node-action', () =>{
          //Need to remember where the scrollbar was before toggling nodes open and shut
          fvi = nodeList.firstVisibleIndex;
        })
        PDQ.define('expand-all-action', input =>{
          if(!input || !input.type) return;
          myTree.allExpandedNodes = myTree.viewableNodes;
        })
        PDQ.define('collapse-all-action', input =>{
          if(!input || !input.type) return;
          myTree.allCollapsedNodes = myTree.viewableNodes;
        })
    </script>

    <!-- ================== Buttons / Search field ========================== -->
    <button>Expand All</button>
    <p-d on="click" if="button" to="{input:.}"></p-d>
    <expand-all-action></expand-all-action>
    <button>Collapse All</button>
    <p-d on="click" to="{input:.}"></p-d>
    <collapse-all-action></collapse-all-action>

    <!-- =================== Sort Buttons ================================= -->
    <span>
      <button data-dir="asc">Sort Asc</button>
      <button data-dir="desc">Sort Desc</button>
    </span>
    <p-d on="click" if="button" to="xtal-tree{sorted:target.dataset.dir}" m="1"></p-d>
    <input type="text" placeholder="Search">
    <p-d id="searchInput" on="input" to="xtal-split{search}"></p-d>
    <p-d on="input" to="xtal-tree{searchString}" m="1"></p-d>

    <!-- ================== Retrieve sample json file that has a dump of a bower file directory ============ -->
    <xtal-fetch fetch href="https://unpkg.com/xtal-tree@0.0.22/directory.json" as="json"></xtal-fetch>
    <p-d on="result-changed" to="xtal-tree,xtal-cascade{nodes}" m="2"></p-d>

    <!-- ================== Train xtal-tree how to intepret / manipulate the json data ===================================== -->
    <script nomodule>
      ({
        childrenFn: node => node.children,
        isOpenFn: node => node.expanded,
        levelSetterFn: levelSetter,
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
        }
      })
    </script>
    <p-d-x on="eval" to="{.:.}"></p-d-x>
    <!-- Use xtal-tree view model component to provide snapshots of flat data to iron-list -->
    <xtal-tree id="myTree" ></xtal-tree>
    <p-d on="toggled-node-changed" to="toggled-node-action{input:.}"></p-d>
    <p-d on="viewable-nodes-changed" to="iron-list{items};view-nodes-action{input}"></p-d>
    
    <toggled-node-action></toggled-node-action>
    <view-nodes-action></view-nodes-action>


    <!-- =============== Train xtal-cascade how to interpret / manipulate json data ============================= -->
    <script nomodule>
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
    <p-d-x on="eval" to="{.:.}"></p-d-x>
    <!--  ============== Use xtal-cascade to manage node selection with checkboxes. ============= -->
    <xtal-cascade id="myCascade"></xtal-cascade>
    <p-d on="selected-root-nodes-changed" to="{input:target}" m="1"></p-d>
    <selected-nodes-change-action></selected-nodes-change-action>
    <p-d on="value-changed" to="iron-list{items}"></p-d>
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

    <!-- =================== Configure the flat list generator (iron-list) -->
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
