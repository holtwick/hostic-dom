'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var parse = require('css-what');
var htmlparser2 = require('htmlparser2');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var parse__default = /*#__PURE__*/_interopDefaultLegacy(parse);

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

/*
 * Abstraction for h/jsx like DOM descriptions.
 * It is used in DOM, VDOM
 *
 */

function _h(context, tag, attrs, children) {
  if (typeof tag === 'function') {
    return tag.call(null, {
      props: { ...attrs, children },
      attrs,
      children,
      h: context.h,
      context,
    })
  } else {
    let el;
    if (tag) {
      if (tag.toLowerCase() === 'fragment') {
        el = context.document.createDocumentFragment();
      } else {
        el = context.document.createElement(tag);
      }
    } else {
      el = context.document.createElement('div');
    }
    if (attrs) {
      for (let [key, value] of Object.entries(attrs)) {
        if (key && typeof key === 'string') {
          key = key.toLowerCase();
        }
        if (key === 'classname') {
          el.className = value;
        } else if (key === 'on') {
          Object.entries(value).forEach(([name, value]) => {
            el.setAttribute('on' + name, value);
          });
          // else if (key.indexOf('on') === 0) {
          //   if (el.addEventListener) {
          //     el.addEventListener(key.substring(2), value)
          //     continue
          //   }
        } else if (value !== false && value != null) {
          if (value === true) {
            el.setAttribute(key, key);
          } else {
            el.setAttribute(key, value.toString());
          }
        }
      }
    }
    if (children) {
      for (const childOuter of children) {
        let cc = Array.isArray(childOuter) ? [...childOuter] : [childOuter];
        for (let child of cc) {
          if (child) {
            if (child !== false && child != null) {
              if (typeof child !== 'object') {
                el.appendChild(context.document.createTextNode(child.toString()));
              } else {
                el.appendChild(child);
              }
            }
          }
        }
      }
    }
    return el
  }
}

function hArgumentParser(tag, attrs, ...children) {
  if (typeof tag === 'object') {
    tag = 'fragment';
    children = tag.children;
    attrs = tag.attrs;
  }
  if (Array.isArray(attrs)) {
    children = attrs;
    attrs = {};
  } else if (attrs) {
    if (attrs.attrs) {
      attrs = { ...attrs.attrs, ...attrs };
      delete attrs.attrs;
    }
  } else {
    attrs = {};
  }
  return {
    tag,
    attrs,
    children: children.flat(Infinity),
  }
}

// global.hh = function (...args) {
//   console.log('hh', args)
// }

function hFactory(context) {
  // let context = { document }
  context.h = function h(itag, iattrs, ...ichildren) {
    let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
    return _h(context, tag, attrs, children)
  };
  return context.h
}

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

const rxEscape = /[\-\[\]\/{}()*+?.^$|]/g;

function escapeRegExp(value) {
  if (!value) return ''
  if (value instanceof RegExp) {
    return value.source
  }
  return value.replace(rxEscape, '\\$&')
}

// export {
//   escape as escapeHTML,
//   unescape as unescapeHTML,
// } from 'he'

function escapeHTML(s) {
  if (!s) return s
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
}

function unescapeHTML(s) {
  if (!s) return s
  return s
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, '\'')
    .replace(/&amp;/gi, '&')
}

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

let USED_JSX = []; // HACK:dholtwick:2016-08-23

function CDATA(s) {
  s = '<![CDATA[' + s + ']]>';
  USED_JSX.push(s);
  return s
}

// export function prependXMLIdentifier(s) {
//   return '<?xml version="1.0" encoding="utf-8"?>\n' + s
// }

// https://reactjs.org/docs/jsx-in-depth.html
function markup(xmlMode, tag, attrs, children) {
  // console.log('markup', xmlMode, tag, attrs, children)
  const hasChildren = children && children.length > 0;
  let s = '';
  tag = tag.replace(/__/g, ':');
  if (tag !== 'noop') {
    if (tag !== 'cdata') {
      s += `<${tag}`;
    } else {
      s += '<![CDATA[';
    }

    // Add attributes
    for (let name in attrs) {
      if (name && attrs.hasOwnProperty(name)) {
        let v = attrs[name];
        if (name === 'html') {
          continue
        }
        if (name.toLowerCase() === 'classname') {
          name = 'class';
        }
        name = name.replace(/__/g, ':');
        if (v === true) {
          s += ` ${name}="${name}"`;
        } else if (name === 'style' && typeof v === 'object') {
          s += ` ${name}="${
            Object.keys(v).filter(
              k => v[k] != null,
            ).map(
              k => {
                let vv = v[k];
                vv = typeof vv === 'number' ? vv + 'px' : vv;
                return `${k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()}:${vv}`
              }).join(';')
          }"`;
        } else if (v !== false && v != null) {
          s += ` ${name}="${escapeHTML(v.toString())}"`;
        }
      }
    }
    if (tag !== 'cdata') {
      if (xmlMode && !hasChildren) {
        s += ' />';
        USED_JSX.push(s);
        return s
      } else {
        s += `>`;
      }
    }

    if (!xmlMode) {
      if (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(tag) !== -1) {
        USED_JSX.push(s);
        return s
      }
    }
  }

  // Append children
  if (hasChildren) {
    for (let child of children) {
      if (child != null && child !== false) {
        if (!Array.isArray(child)) {
          child = [child];
        }
        for (let c of child) {
          if (USED_JSX.indexOf(c) !== -1 || tag === 'script' || tag === 'style') {
            s += c;
          } else {
            s += escapeHTML(c.toString());
          }
        }
      }
    }
  }

  if (attrs.html) {
    s += attrs.html;
  }

  if (tag !== 'noop') {
    if (tag !== 'cdata') {
      s += `</${tag}>`;
    } else {
      s += ']]>';
    }
  }
  USED_JSX.push(s);
  return s
}

function html(itag, iattrs, ...ichildren) {
  let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
  return markup(false, tag, attrs, children)
}

html.firstLine = '<!DOCTYPE html>';
html.html = true;

let cache = {};

function parseSelector(selector) {
  let ast = cache[selector];
  if (ast == null) {
    ast = parse__default['default'](selector);
    cache[selector] = ast;
  }
  return ast
}

// Just a very small subset for now: https://github.com/fb55/css-what#api

function matchSelector(selector, element, { debug = false } = {}) {
  for (let rules of parseSelector(selector)) {
    if (debug) {
      console.log('Selector:', selector);
      console.log('Rules:', rules);
      console.log('Element:', element);
    }

    function handleRules(element, rules) {
      let success = false;
      for (let part of rules) {
        const { type, name, action, value, ignoreCase = true, data } = part;
        if (type === 'attribute') {
          if (action === 'equals') {
            success = element.getAttribute(name) === value;
            if (debug) console.log('Attribute equals', success);
          } else if (action === 'start') {
            success = element.getAttribute(name)?.startsWith(value);
            if (debug) console.log('Attribute start', success);
          } else if (action === 'end') {
            success = element.getAttribute(name)?.endsWith(value);
            if (debug) console.log('Attribute start', success);
          } else if (action === 'element') {
            if (name === 'class') {
              success = element.classList.contains(value);
              if (debug) console.log('Attribute class', success);
            } else {
              success = element.getAttribute(name)?.includes(value);
              if (debug) console.log('Attribute element', success);
            }
          } else if (action === 'exists') {
            success = element.hasAttribute(name);
            if (debug) console.log('Attribute exists', success);
          } else {
            console.warn('Unknown CSS selector action', action);
          }
        } else if (type === 'tag') {
          success = element.tagName === name.toUpperCase();
          if (debug) console.log('Is tag', success);
        } else if (type === 'universal') {
          success = true;
          if (debug) console.log('Is universal', success);
        } else if (type === 'pseudo') {
          if (name === 'not') {
            let ok = true;
            data.forEach(rules => {
              if (!handleRules(element, rules)) {
                ok = false;
              }
            });
            success = !ok;
          }
          if (debug) console.log('Is :not', success);
          // } else if (type === 'descendant') {
          //   element = element.
        } else {
          console.warn('Unknown CSS selector type', type, selector, rules);
        }
        // console.log(success, selector, part, element)
        if (!success) break
      }
      return success
    }

    if (handleRules(element, rules)) {
      return true
    }
  }
  return false
}

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

// For node debugging
const inspect = Symbol.for('nodejs.util.inspect.custom');

let B = { 'fontWeight': 'bold' };
let I = { 'fontStyle': 'italic' };
let M = { 'backgroundColor': 'rgb(255, 250, 165)' };
let U = { 'textDecorations': 'underline' };
let S = { 'textDecorations': 'line-through' };
// let C = {}

const log = require('debug')('hostic:vdom');

let DEFAULTS = {
  'b': B,
  'strong': B,
  'em': I,
  'i': I,
  'mark': M,
  'u': U,
  'a': U,
  's': S,
  'del': S,
  'ins': M,
  'strike': S,
  // 'code': C,
  // 'tt': C
};

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj))
}

class VNode {

  static ELEMENT_NODE = 1
  static TEXT_NODE = 3
  static CDATA_SECTION_NODE = 4
  static PROCESSING_INSTRUCTION_NODE = 7
  static COMMENT_NODE = 8
  static DOCUMENT_NODE = 9
  static DOCUMENT_TYPE_NODE = 10
  static DOCUMENT_FRAGMENT_NODE = 11

  get nodeType() {
    console.error('Subclasses should define nodeType!');
    return 0
  }

  get nodeName() {
    console.error('Subclasses should define nodeName!');
    return ''
  }

  get nodeValue() {
    return null
  }

  constructor() {
    this._parentNode = null;
    this._childNodes = [];
  }

  _fixChildNodesParent() {
    this._childNodes.forEach(node => node._parentNode = this);
  }

  insertBefore(newNode, node = null) {
    if (newNode !== node) {
      let index = node ? this._childNodes.indexOf(node) : 0;
      if (index < 0) index = 0;
      this._childNodes.splice(index, 0, newNode);
      this._fixChildNodesParent();
    }
  }

  appendChild(node) {
    if (node === this) {
      console.warn('Cannot appendChild to self');
      return
    }
    // log('appendChild', node, this)

    if (node instanceof VDocument) {
      console.warn('No defined how to append a document to a node!', node);
    }

    if (node instanceof VDocumentFragment) {
      for (let c of [...node._childNodes]) { // Don't iterate over the original! Do [...el]
        this.appendChild(c);
      }
    }
    else if (node instanceof VNode) {
      node.remove();
      this._childNodes.push(node);
    } else {
      // Fallback for unknown data
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
    this?.parentNode?.removeChild(this);
    return this
  }

  replaceChildren(...nodes) {
    this._childNodes = nodes.map(n => typeof n === 'string' ? new VTextNode(n) : n.remove());
    this._fixChildNodesParent();
  }

  replaceWith(...nodes) {
    let p = this._parentNode;
    if (p) {
      let index = this._indexInParent();
      if (index >= 0) {
        nodes = nodes.map(n => typeof n === 'string' ? new VTextNode(n) : n.remove());
        p._childNodes.splice(index, 1, ...nodes);
        this._parentNode = null;
        p._fixChildNodesParent();
      }
    }
  }

  _indexInParent() {
    if (this._parentNode) {
      return this._parentNode.childNodes.indexOf(this)
    }
    return -1
  }

  get parentNode() {
    return this._parentNode
  }

  get childNodes() {
    return this._childNodes || []
  }

  get firstChild() {
    return this._childNodes[0]
  }

  get lastChild() {
    return this._childNodes[this._childNodes.length - 1]
  }

  get nextSibling() {
    let i = this._indexInParent();
    if (i != null) {
      return this.parentNode.childNodes[i + 1] || null
    }
    return null
  }

  get previousSibling() {
    let i = this._indexInParent();
    if (i > 0) {
      return this.parentNode.childNodes[i - 1] || null
    }
    return null
  }

  flatten({ condition = node => node instanceof VElement } = {}) {
    let elements = [];
    if (condition(this)) {
      elements.push(this);
    }
    for (let child of this._childNodes) {
      elements.push(...child.flatten({ condition }));
    }
    return elements
  }

  render() {
    return ''
  }

  get textContent() {
    return this._childNodes.map(c => c.textContent).join('')
  }

  set textContent(text) {
    this._childNodes = [];
    if (text) {
      this.appendChild(new VTextNode(text.toString()));
    }
  }

  contains(otherNode) {
    if (otherNode === this) return true
    // if (this._childNodes.includes(otherNode)) return true
    return this._childNodes.some(n => n.contains(otherNode))
  }

  get ownerDocument() {
    if (this.nodeType === VNode.DOCUMENT_NODE || this.nodeType === VNode.DOCUMENT_FRAGMENT_NODE) {
      return this
    }
    return this?._parentNode?.ownerDocument
  }

  // cloneNode(deep) {
  //   return _.cloneDeep(this)
  // }

  toString() {
    return `${this.nodeName}`
    // return `${this.nodeName}: ${JSON.stringify(this.nodeValue)}`
  }

  [inspect]() {
    return `${this.constructor.name} "${this.render()}"`;
  }
}

class VTextNode extends VNode {

  get nodeType() {
    return VNode.TEXT_NODE
  }

  get nodeName() {
    return '#text'
  }

  get nodeValue() {
    return this._text || ''
  }

  get textContent() {
    return this.nodeValue
  }

  constructor(text = '') {
    super();
    this._text = text;
  }

  render() {
    return this._text
  }

}

class VNodeQuery extends VNode {

  getElementById(name) {
    return this.flatten().find(e => e._attributes['id'] === name)
  }

  getElementsByClassName(name) {
    return this.flatten().filter(e => e.classList.contains(name))
  }

  matches(selector) {
    return matchSelector(selector, this)
  }

  querySelectorAll(selector) {
    return this.flatten().filter(e => e.matches(selector))
  }

  querySelector(selector) {
    return this.flatten().find(e => e.matches(selector))
  }

  //

  parent(selector) {
    if (this.matches(selector)) {
      return this
    }
    if (this.parentNode == null) {
      return null
    }
    return this.parentNode?.parent(selector)
  }

  handle(selector, handler) {
    let i = 0;
    for (let el of this.querySelectorAll(selector)) {
      handler(el, i++);
    }
  }

}


class VElement extends VNodeQuery {

  get nodeType() {
    return VNode.ELEMENT_NODE
  }

  get nodeName() {
    return this._nodeName
  }

  constructor(name = 'div', attrs = {}) {
    super();
    this._nodeName = (name || '').toUpperCase();
    this._attributes = attrs || {};
    this._styles = null;
  }

  get attributes() {
    return this._attributes
  }

  setAttribute(name, value) {
    this._attributes[name] = value;
    this._styles = null;
  }

  getAttribute(name) {
    return this._attributes[name]
  }

  removeAttribute(name) {
    delete this._attributes[name];
  }

  hasAttribute(name) {
    return this._attributes[name] != null
  }

  get style() {
    if (this._styles == null) {
      let styles = cloneObject(DEFAULTS[this.tagName.toLowerCase()]) || {};
      let styleString = this.getAttribute('style');
      if (styleString) {
        let m;
        let re = /\s*([\w-]+)\s*:\s*([^;]+)/g;
        while ((m = re.exec(styleString))) {
          let name = m[1];
          let value = m[2].trim();
          styles[name] = value;
          let camel = (s) => s.replace(/[A-Z]/g, '-$&').toLowerCase();
          styles[camel] = value;
        }
      }
      this._styles = styles;
    }
    return this._styles
  }

  get tagName() {
    return this._nodeName
  }

  get id() {
    return this._attributes.id
  }

  set id(value) {
    this._attributes.id = value;
  }

  get src() {
    return this._attributes.src
  }

  set src(value) {
    this._attributes.src = value;
  }

  //

  getElementsByTagName(name) {
    name = name.toUpperCase();
    let elements = this.flatten();
    if (name !== '*') {
      return elements.filter(e => e.tagName === name)
    }
    return elements
  }

  // html

  get innerHTML() {
    return this._childNodes.map(c => c.render(html)).join('')
  }

  set innerHTML(html) {
    if (this.setInnerHTML) {
      this.setInnerHTML(html);
    } else {
      throw 'set innerHTML not implemented'
    }
  }

  get outerHTML() {
    return this.render(html)
  }

  // class

  get className() {
    return this._attributes['class'] || ''
  }

  set className(name) {
    if (Array.isArray(name)) {
      name = name.filter(n => !!n).join(' ');
    } else if (typeof name === 'object') {
      name = (Object.entries(name)
        .filter(([k, v]) => !!v)
        .map(([k, v]) => k)
        .join(' '));
    }
    this._attributes['class'] = name;
  }

  get classList() {
    let self = this;
    let classNames = (this.className || '').trim().split(/\s+/g) || [];
    // log('classList', classNames)
    return {
      contains(s) {
        return classNames.includes(s)
      },
      add(s) {
        if (!(classNames.includes(s))) {
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
      },
    }
  }

  //

  render(h = html) {
    return h(
      this.tagName.toLowerCase(),
      this.attributes,
      this.childNodes.map(c => c.render(h)),
    )
  }

}

class VDocumentFragment extends VNodeQuery {

  get nodeType() {
    return VNode.DOCUMENT_FRAGMENT_NODE
  }

  get nodeName() {
    return '#document-fragment'
  }

  render(h = html) {
    return (this._childNodes.map(c => c.render(h) || []).join(''))
  }

  get innerHTML() { // for debug
    return this._childNodes.map(c => c.render(html)).join('')
  }

  createElement(name, attrs = {}) {
    return new VElement(name, attrs)
  }

  createDocumentFragment() {
    return new VDocumentFragment()
  }

  createTextNode(text) {
    return new VTextNode(text)
  }

}

class VDocument extends VDocumentFragment {

  get nodeType() {
    return VNode.DOCUMENT_NODE
  }

  get nodeName() {
    return '#document'
  }

  get documentElement() {
    return this.firstChild
  }

  // render(h = html) {
  //   let content =  super.render(h)
  //   if (h.firstLine) {
  //     content = h.firstLine + '\n' + content
  //   }
  //   return content
  // }

}

class VHTMLDocument extends VDocument {

  constructor() {
    super();
    let html = new VElement('html');
    let body = new VElement('body');
    let head = new VElement('head');
    let title = new VElement('title');
    html.appendChild(head);
    head.appendChild(title);
    html.appendChild(body);
    this.appendChild(html);
  }

  get body() {
    return this.querySelector('body')
  }

  get title() {
    return this.querySelector('title')?.textContent
  }

  set title(title) {
    this.querySelector('title').textContent = title;
  }

  get head() {
    return this.querySelector('head')
  }

  render(h = html) {
    let content = super.render(h);
    if (h.firstLine) {
      content = h.firstLine + '\n' + content;
    }
    return content
  }

}

function createDocument() {
  return new VDocument()
}


function createHTMLDocument() {
  return new VHTMLDocument()
}

let document = createDocument();
let h = hFactory({ document });

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

// Makes sure we operate on VNodes
function vdom(obj = null) {
  if (obj instanceof VNode) {
    return obj
  }
  if (obj instanceof Buffer) {
    obj = obj.toString('utf-8');
  }
  if (typeof obj === 'string') {
    return parseHTML(obj)
  }
  // console.warn('Cannot convert to VDOM:', obj)
  return new VElement('div')
}

function parseHTML(html) {
  let frag = new VDocumentFragment();

  let stack = [frag];
  let currentElement = frag;

  let parser = new htmlparser2.Parser({
    onopentag: (name, attrs) => {
      let element = document.createElement(name, attrs);
      stack.push(element);
      currentElement.appendChild(element);
      currentElement = element;
    },
    ontext: function (text) {
      if (currentElement?.lastChild?.nodeType === VNode.TEXT_NODE) {
        currentElement.lastChild._text += text;
      } else {
        currentElement.appendChild(new VTextNode(text));
      }
    },
    onclosetag: function (name) {
      let element = stack.pop();
      currentElement = stack[stack.length - 1];
      // if (element.nodeName !== currentElement.nodeName) {
      //   console.log('error', element, currentElement)
      // }
    },
  }, { decodeEntities: true });
  parser.write(html);
  parser.end();

  // console.log('frag', frag.innerHTML)

  return frag
}

VElement.prototype.setInnerHTML = function (html) {
  let frag = parseHTML(html);
  this._childNodes = frag._childNodes;
  this._fixChildNodesParent();
};

function xml(itag, iattrs, ...ichildren) {
  let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
  return markup(true, tag, attrs, children)
}

xml.firstLine = '<?xml version="1.0" encoding="utf-8"?>';
xml.xml = true;

exports.CDATA = CDATA;
exports.VDocument = VDocument;
exports.VDocumentFragment = VDocumentFragment;
exports.VElement = VElement;
exports.VHTMLDocument = VHTMLDocument;
exports.VNode = VNode;
exports.VNodeQuery = VNodeQuery;
exports.VTextNode = VTextNode;
exports.createDocument = createDocument;
exports.createHTMLDocument = createHTMLDocument;
exports.document = document;
exports.escapeHTML = escapeHTML;
exports.escapeRegExp = escapeRegExp;
exports.h = h;
exports.html = html;
exports.parseHTML = parseHTML;
exports.unescapeHTML = unescapeHTML;
exports.vdom = vdom;
exports.xml = xml;
