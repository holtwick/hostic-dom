import {VDocumentFragment, VElement, VTextNode, document} from "./vdom";
import {VNode} from "./vdom";
import {Parser} from "htmlparser2";
export function vdom(obj = null) {
  if (obj instanceof VNode) {
    return obj;
  }
  if (obj instanceof Buffer) {
    obj = obj.toString("utf-8");
  }
  if (typeof obj === "string") {
    return parseHTML(obj);
  }
  return new VElement("div");
}
export function parseHTML(html) {
  let frag = new VDocumentFragment();
  let stack = [frag];
  let currentElement = frag;
  let parser = new Parser({
    onopentag: (name, attrs) => {
      let element = document.createElement(name, attrs);
      stack.push(element);
      currentElement.appendChild(element);
      currentElement = element;
    },
    ontext: function(text) {
      var _a;
      if (((_a = currentElement == null ? void 0 : currentElement.lastChild) == null ? void 0 : _a.nodeType) === VNode.TEXT_NODE) {
        currentElement.lastChild._text += text;
      } else {
        currentElement.appendChild(new VTextNode(text));
      }
    },
    onclosetag: function(name) {
      let element = stack.pop();
      currentElement = stack[stack.length - 1];
    }
  }, {decodeEntities: true});
  parser.write(html);
  parser.end();
  return frag;
}
VElement.prototype.setInnerHTML = function(html) {
  let frag = parseHTML(html);
  this._childNodes = frag._childNodes;
  this._fixChildNodesParent();
};
//# sourceMappingURL=vdomparser.js.map
