import {hFactory} from "./h";
import {html as html2} from "./html";
import {matchSelector} from "./vcss.js";
const inspect = Symbol.for("nodejs.util.inspect.custom");
let B = {fontWeight: "bold"};
let I = {fontStyle: "italic"};
let M = {backgroundColor: "rgb(255, 250, 165)"};
let U = {textDecorations: "underline"};
let S = {textDecorations: "line-through"};
const log = require("debug")("hostic:vdom");
let DEFAULTS = {
  b: B,
  strong: B,
  em: I,
  i: I,
  mark: M,
  u: U,
  a: U,
  s: S,
  del: S,
  ins: M,
  strike: S
};
function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}
export class VNode {
  get nodeType() {
    console.error("Subclasses should define nodeType!");
    return 0;
  }
  get nodeName() {
    console.error("Subclasses should define nodeName!");
    return "";
  }
  get nodeValue() {
    return null;
  }
  constructor() {
    this._parentNode = null;
    this._childNodes = [];
  }
  _fixChildNodesParent() {
    this._childNodes.forEach((node) => node._parentNode = this);
  }
  insertBefore(newNode, node = null) {
    if (newNode !== node) {
      let index = node ? this._childNodes.indexOf(node) : 0;
      if (index < 0)
        index = 0;
      this._childNodes.splice(index, 0, newNode);
      this._fixChildNodesParent();
    }
  }
  appendChild(node) {
    if (node === this) {
      console.warn("Cannot appendChild to self");
      return;
    }
    if (node instanceof VDocument) {
      console.warn("No defined how to append a document to a node!", node);
    }
    if (node instanceof VDocumentFragment) {
      for (let c of [...node._childNodes]) {
        this.appendChild(c);
      }
    } else if (node instanceof VNode) {
      node.remove();
      this._childNodes.push(node);
    } else {
      try {
        this._childNodes.push(new VTextNode(JSON.stringify(node, null, 2)));
      } catch (err) {
        console.error(`The data ${node} to be added to ${this.render()} is problematic: ${err}`);
      }
    }
    this._fixChildNodesParent();
  }
  removeChild(node) {
    let i = this._childNodes.indexOf(node);
    if (i >= 0) {
      node._parentNode = null;
      this._childNodes.splice(i, 1);
      this._fixChildNodesParent();
    }
  }
  remove() {
    var _a;
    (_a = this == null ? void 0 : this.parentNode) == null ? void 0 : _a.removeChild(this);
    return this;
  }
  replaceChildren(...nodes) {
    this._childNodes = nodes.map((n) => typeof n === "string" ? new VTextNode(n) : n.remove());
    this._fixChildNodesParent();
  }
  replaceWith(...nodes) {
    let p = this._parentNode;
    if (p) {
      let index = this._indexInParent();
      if (index >= 0) {
        nodes = nodes.map((n) => typeof n === "string" ? new VTextNode(n) : n.remove());
        p._childNodes.splice(index, 1, ...nodes);
        this._parentNode = null;
        p._fixChildNodesParent();
      }
    }
  }
  _indexInParent() {
    if (this._parentNode) {
      return this._parentNode.childNodes.indexOf(this);
    }
    return -1;
  }
  get parentNode() {
    return this._parentNode;
  }
  get childNodes() {
    return this._childNodes || [];
  }
  get firstChild() {
    return this._childNodes[0];
  }
  get lastChild() {
    return this._childNodes[this._childNodes.length - 1];
  }
  get nextSibling() {
    let i = this._indexInParent();
    if (i != null) {
      return this.parentNode.childNodes[i + 1] || null;
    }
    return null;
  }
  get previousSibling() {
    let i = this._indexInParent();
    if (i > 0) {
      return this.parentNode.childNodes[i - 1] || null;
    }
    return null;
  }
  flatten({condition = (node) => node instanceof VElement} = {}) {
    let elements = [];
    if (condition(this)) {
      elements.push(this);
    }
    for (let child of this._childNodes) {
      elements.push(...child.flatten({condition}));
    }
    return elements;
  }
  render() {
    return "";
  }
  get textContent() {
    return this._childNodes.map((c) => c.textContent).join("");
  }
  set textContent(text) {
    this._childNodes = [];
    if (text) {
      this.appendChild(new VTextNode(text.toString()));
    }
  }
  contains(otherNode) {
    if (otherNode === this)
      return true;
    return this._childNodes.some((n) => n.contains(otherNode));
  }
  get ownerDocument() {
    var _a;
    if (this.nodeType === VNode.DOCUMENT_NODE || this.nodeType === VNode.DOCUMENT_FRAGMENT_NODE) {
      return this;
    }
    return (_a = this == null ? void 0 : this._parentNode) == null ? void 0 : _a.ownerDocument;
  }
  toString() {
    return `${this.nodeName}`;
  }
  [inspect]() {
    return `${this.constructor.name} "${this.render()}"`;
  }
}
VNode.ELEMENT_NODE = 1;
VNode.TEXT_NODE = 3;
VNode.CDATA_SECTION_NODE = 4;
VNode.PROCESSING_INSTRUCTION_NODE = 7;
VNode.COMMENT_NODE = 8;
VNode.DOCUMENT_NODE = 9;
VNode.DOCUMENT_TYPE_NODE = 10;
VNode.DOCUMENT_FRAGMENT_NODE = 11;
export class VTextNode extends VNode {
  get nodeType() {
    return VNode.TEXT_NODE;
  }
  get nodeName() {
    return "#text";
  }
  get nodeValue() {
    return this._text || "";
  }
  get textContent() {
    return this.nodeValue;
  }
  constructor(text = "") {
    super();
    this._text = text;
  }
  render() {
    return this._text;
  }
}
export class VNodeQuery extends VNode {
  getElementById(name) {
    return this.flatten().find((e) => e._attributes["id"] === name);
  }
  getElementsByClassName(name) {
    return this.flatten().filter((e) => e.classList.contains(name));
  }
  matches(selector) {
    return matchSelector(selector, this);
  }
  querySelectorAll(selector) {
    return this.flatten().filter((e) => e.matches(selector));
  }
  querySelector(selector) {
    return this.flatten().find((e) => e.matches(selector));
  }
  parent(selector) {
    var _a;
    if (this.matches(selector)) {
      return this;
    }
    if (this.parentNode == null) {
      return null;
    }
    return (_a = this.parentNode) == null ? void 0 : _a.parent(selector);
  }
  handle(selector, handler) {
    let i = 0;
    for (let el of this.querySelectorAll(selector)) {
      handler(el, i++);
    }
  }
}
export class VElement extends VNodeQuery {
  get nodeType() {
    return VNode.ELEMENT_NODE;
  }
  get nodeName() {
    return this._nodeName;
  }
  constructor(name = "div", attrs = {}) {
    super();
    this._nodeName = (name || "").toUpperCase();
    this._attributes = attrs || {};
    this._styles = null;
  }
  get attributes() {
    return this._attributes;
  }
  setAttribute(name, value) {
    this._attributes[name] = value;
    this._styles = null;
  }
  getAttribute(name) {
    return this._attributes[name];
  }
  removeAttribute(name) {
    delete this._attributes[name];
  }
  hasAttribute(name) {
    return this._attributes[name] != null;
  }
  get style() {
    if (this._styles == null) {
      let styles = cloneObject(DEFAULTS[this.tagName.toLowerCase()]) || {};
      let styleString = this.getAttribute("style");
      if (styleString) {
        let m;
        let re = /\s*([\w-]+)\s*:\s*([^;]+)/g;
        while (m = re.exec(styleString)) {
          let name = m[1];
          let value = m[2].trim();
          styles[name] = value;
          let camel = (s) => s.replace(/[A-Z]/g, "-$&").toLowerCase();
          styles[camel] = value;
        }
      }
      this._styles = styles;
    }
    return this._styles;
  }
  get tagName() {
    return this._nodeName;
  }
  get id() {
    return this._attributes.id;
  }
  set id(value) {
    this._attributes.id = value;
  }
  get src() {
    return this._attributes.src;
  }
  set src(value) {
    this._attributes.src = value;
  }
  getElementsByTagName(name) {
    name = name.toUpperCase();
    let elements = this.flatten();
    if (name !== "*") {
      return elements.filter((e) => e.tagName === name);
    }
    return elements;
  }
  get innerHTML() {
    return this._childNodes.map((c) => c.render(html2)).join("");
  }
  set innerHTML(html3) {
    if (this.setInnerHTML) {
      this.setInnerHTML(html3);
    } else {
      throw "set innerHTML not implemented";
    }
  }
  get outerHTML() {
    return this.render(html2);
  }
  get className() {
    return this._attributes["class"] || "";
  }
  set className(name) {
    if (Array.isArray(name)) {
      name = name.filter((n) => !!n).join(" ");
    } else if (typeof name === "object") {
      name = Object.entries(name).filter(([k, v]) => !!v).map(([k, v]) => k).join(" ");
    }
    this._attributes["class"] = name;
  }
  get classList() {
    let self = this;
    let classNames = (this.className || "").trim().split(/\s+/g) || [];
    return {
      contains(s) {
        return classNames.includes(s);
      },
      add(s) {
        if (!classNames.includes(s)) {
          classNames.push(s);
          self.className = classNames;
        }
      },
      remove(s) {
        let index = classNames.indexOf(s);
        if (index >= 0) {
          classNames.splice(index, 1);
          self.className = classNames;
        }
      }
    };
  }
  render(h3 = html2) {
    return h3(this.tagName.toLowerCase(), this.attributes, this.childNodes.map((c) => c.render(h3)));
  }
}
export class VDocumentFragment extends VNodeQuery {
  get nodeType() {
    return VNode.DOCUMENT_FRAGMENT_NODE;
  }
  get nodeName() {
    return "#document-fragment";
  }
  render(h3 = html2) {
    return this._childNodes.map((c) => c.render(h3) || []).join("");
  }
  get innerHTML() {
    return this._childNodes.map((c) => c.render(html2)).join("");
  }
  createElement(name, attrs = {}) {
    return new VElement(name, attrs);
  }
  createDocumentFragment() {
    return new VDocumentFragment();
  }
  createTextNode(text) {
    return new VTextNode(text);
  }
}
export class VDocument extends VDocumentFragment {
  get nodeType() {
    return VNode.DOCUMENT_NODE;
  }
  get nodeName() {
    return "#document";
  }
  get documentElement() {
    return this.firstChild;
  }
}
export class VHTMLDocument extends VDocument {
  constructor() {
    super();
    let html3 = new VElement("html");
    let body = new VElement("body");
    let head = new VElement("head");
    let title = new VElement("title");
    html3.appendChild(head);
    head.appendChild(title);
    html3.appendChild(body);
    this.appendChild(html3);
  }
  get body() {
    return this.querySelector("body");
  }
  get title() {
    var _a;
    return (_a = this.querySelector("title")) == null ? void 0 : _a.textContent;
  }
  set title(title) {
    this.querySelector("title").textContent = title;
  }
  get head() {
    return this.querySelector("head");
  }
  render(h3 = html2) {
    let content = super.render(h3);
    if (h3.firstLine) {
      content = h3.firstLine + "\n" + content;
    }
    return content;
  }
}
export function createDocument() {
  return new VDocument();
}
export function createHTMLDocument() {
  return new VHTMLDocument();
}
export let document = createDocument();
export let h = hFactory({document});
//# sourceMappingURL=vdom.js.map
