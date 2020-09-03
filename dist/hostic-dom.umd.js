(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('events'), require('stream'), require('string_decoder')) :
  typeof define === 'function' && define.amd ? define(['exports', 'events', 'stream', 'string_decoder'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global['hostic-dom'] = {}, global.events, global.stream, global.string_decoder));
}(this, (function (exports, events, stream, string_decoder) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var events__default = /*#__PURE__*/_interopDefaultLegacy(events);
  var stream__default = /*#__PURE__*/_interopDefaultLegacy(stream);
  var string_decoder__default = /*#__PURE__*/_interopDefaultLegacy(string_decoder);

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

  var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

  function unwrapExports (x) {
  	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
  }

  function createCommonjsModule(fn, module) {
  	return module = { exports: {} }, fn(module, module.exports), module.exports;
  }

  function getCjsExportFromNamespace (n) {
  	return n && n['default'] || n;
  }

  var parse_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.default = parse;
  var reName = /^[^\\]?(?:\\(?:[\da-f]{1,6}\s?|.)|[\w\-\u00b0-\uFFFF])+/;
  var reEscape = /\\([\da-f]{1,6}\s?|(\s)|.)/gi;
  //modified version of https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L87
  var reAttr = /^\s*((?:\\.|[\w\u00b0-\uFFFF-])+)\s*(?:(\S?)=\s*(?:(['"])([^]*?)\3|(#?(?:\\.|[\w\u00b0-\uFFFF-])*)|)|)\s*(i)?\]/;
  var actionTypes = {
      undefined: "exists",
      "": "equals",
      "~": "element",
      "^": "start",
      $: "end",
      "*": "any",
      "!": "not",
      "|": "hyphen",
  };
  var Traversals = {
      ">": "child",
      "<": "parent",
      "~": "sibling",
      "+": "adjacent",
  };
  var attribSelectors = {
      "#": ["id", "equals"],
      ".": ["class", "element"],
  };
  //pseudos, whose data-property is parsed as well
  var unpackPseudos = new Set(["has", "not", "matches"]);
  var stripQuotesFromPseudos = new Set(["contains", "icontains"]);
  var quotes = new Set(['"', "'"]);
  //unescape function taken from https://github.com/jquery/sizzle/blob/master/src/sizzle.js#L152
  function funescape(_, escaped, escapedWhitespace) {
      var high = parseInt(escaped, 16) - 0x10000;
      // NaN means non-codepoint
      return high !== high || escapedWhitespace
          ? escaped
          : high < 0
              ? // BMP codepoint
                  String.fromCharCode(high + 0x10000)
              : // Supplemental Plane codepoint (surrogate pair)
                  String.fromCharCode((high >> 10) | 0xd800, (high & 0x3ff) | 0xdc00);
  }
  function unescapeCSS(str) {
      return str.replace(reEscape, funescape);
  }
  function isWhitespace(c) {
      return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
  }
  function parse(selector, options) {
      var subselects = [];
      selector = parseSelector(subselects, "" + selector, options);
      if (selector !== "") {
          throw new Error("Unmatched selector: " + selector);
      }
      return subselects;
  }
  function parseSelector(subselects, selector, options) {
      var tokens = [];
      var sawWS = false;
      function getName() {
          var match = selector.match(reName);
          if (!match) {
              throw new Error("Expected name, found " + selector);
          }
          var sub = match[0];
          selector = selector.substr(sub.length);
          return unescapeCSS(sub);
      }
      function stripWhitespace(start) {
          while (isWhitespace(selector.charAt(start)))
              start++;
          selector = selector.substr(start);
      }
      function isEscaped(pos) {
          var slashCount = 0;
          while (selector.charAt(--pos) === "\\")
              slashCount++;
          return (slashCount & 1) === 1;
      }
      stripWhitespace(0);
      while (selector !== "") {
          var firstChar = selector.charAt(0);
          if (isWhitespace(firstChar)) {
              sawWS = true;
              stripWhitespace(1);
          }
          else if (firstChar in Traversals) {
              tokens.push({ type: Traversals[firstChar] });
              sawWS = false;
              stripWhitespace(1);
          }
          else if (firstChar === ",") {
              if (tokens.length === 0) {
                  throw new Error("Empty sub-selector");
              }
              subselects.push(tokens);
              tokens = [];
              sawWS = false;
              stripWhitespace(1);
          }
          else {
              if (sawWS) {
                  if (tokens.length > 0) {
                      tokens.push({ type: "descendant" });
                  }
                  sawWS = false;
              }
              if (firstChar === "*") {
                  selector = selector.substr(1);
                  tokens.push({ type: "universal" });
              }
              else if (firstChar in attribSelectors) {
                  var _a = attribSelectors[firstChar], name_1 = _a[0], action = _a[1];
                  selector = selector.substr(1);
                  tokens.push({
                      type: "attribute",
                      name: name_1,
                      action: action,
                      value: getName(),
                      ignoreCase: false,
                  });
              }
              else if (firstChar === "[") {
                  selector = selector.substr(1);
                  var data = selector.match(reAttr);
                  if (!data) {
                      throw new Error("Malformed attribute selector: " + selector);
                  }
                  selector = selector.substr(data[0].length);
                  var name_2 = unescapeCSS(data[1]);
                  if (!options ||
                      ("lowerCaseAttributeNames" in options
                          ? options.lowerCaseAttributeNames
                          : !options.xmlMode)) {
                      name_2 = name_2.toLowerCase();
                  }
                  tokens.push({
                      type: "attribute",
                      name: name_2,
                      action: actionTypes[data[2]],
                      value: unescapeCSS(data[4] || data[5] || ""),
                      ignoreCase: !!data[6],
                  });
              }
              else if (firstChar === ":") {
                  if (selector.charAt(1) === ":") {
                      selector = selector.substr(2);
                      tokens.push({
                          type: "pseudo-element",
                          name: getName().toLowerCase(),
                      });
                      continue;
                  }
                  selector = selector.substr(1);
                  var name_3 = getName().toLowerCase();
                  var data = null;
                  if (selector.charAt(0) === "(") {
                      if (unpackPseudos.has(name_3)) {
                          var quot = selector.charAt(1);
                          var quoted = quotes.has(quot);
                          selector = selector.substr(quoted ? 2 : 1);
                          data = [];
                          selector = parseSelector(data, selector, options);
                          if (quoted) {
                              if (selector.charAt(0) !== quot) {
                                  throw new Error("Unmatched quotes in :" + name_3);
                              }
                              else {
                                  selector = selector.substr(1);
                              }
                          }
                          if (selector.charAt(0) !== ")") {
                              throw new Error("Missing closing parenthesis in :" + name_3 + " (" + selector + ")");
                          }
                          selector = selector.substr(1);
                      }
                      else {
                          var pos = 1;
                          var counter = 1;
                          for (; counter > 0 && pos < selector.length; pos++) {
                              if (selector.charAt(pos) === "(" && !isEscaped(pos))
                                  counter++;
                              else if (selector.charAt(pos) === ")" &&
                                  !isEscaped(pos))
                                  counter--;
                          }
                          if (counter) {
                              throw new Error("Parenthesis not matched");
                          }
                          data = selector.substr(1, pos - 2);
                          selector = selector.substr(pos);
                          if (stripQuotesFromPseudos.has(name_3)) {
                              var quot = data.charAt(0);
                              if (quot === data.slice(-1) && quotes.has(quot)) {
                                  data = data.slice(1, -1);
                              }
                              data = unescapeCSS(data);
                          }
                      }
                  }
                  tokens.push({ type: "pseudo", name: name_3, data: data });
              }
              else if (reName.test(selector)) {
                  var name_4 = getName();
                  if (!options ||
                      ("lowerCaseTags" in options
                          ? options.lowerCaseTags
                          : !options.xmlMode)) {
                      name_4 = name_4.toLowerCase();
                  }
                  tokens.push({ type: "tag", name: name_4 });
              }
              else {
                  if (tokens.length &&
                      tokens[tokens.length - 1].type === "descendant") {
                      tokens.pop();
                  }
                  addToken(subselects, tokens);
                  return selector;
              }
          }
      }
      addToken(subselects, tokens);
      return selector;
  }
  function addToken(subselects, tokens) {
      if (subselects.length > 0 && tokens.length === 0) {
          throw new Error("Empty sub-selector");
      }
      subselects.push(tokens);
  }
  });

  unwrapExports(parse_1);

  var stringify_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  var actionTypes = {
      equals: "",
      element: "~",
      start: "^",
      end: "$",
      any: "*",
      not: "!",
      hyphen: "|",
  };
  function stringify(token) {
      return token.map(stringifySubselector).join(", ");
  }
  exports.default = stringify;
  function stringifySubselector(token) {
      return token.map(stringifyToken).join("");
  }
  function stringifyToken(token) {
      switch (token.type) {
          // Simple types
          case "child":
              return " > ";
          case "parent":
              return " < ";
          case "sibling":
              return " ~ ";
          case "adjacent":
              return " + ";
          case "descendant":
              return " ";
          case "universal":
              return "*";
          case "tag":
              return escapeName(token.name);
          case "pseudo-element":
              return "::" + escapeName(token.name);
          case "pseudo":
              if (token.data === null)
                  return ":" + escapeName(token.name);
              if (typeof token.data === "string") {
                  return ":" + escapeName(token.name) + "(" + token.data + ")";
              }
              return ":" + escapeName(token.name) + "(" + stringify(token.data) + ")";
          case "attribute":
              if (token.action === "exists") {
                  return "[" + escapeName(token.name) + "]";
              }
              if (token.name === "id" &&
                  token.action === "equals" &&
                  !token.ignoreCase) {
                  return "#" + escapeName(token.value);
              }
              if (token.name === "class" &&
                  token.action === "element" &&
                  !token.ignoreCase) {
                  return "." + escapeName(token.value);
              }
              return "[" + escapeName(token.name) + actionTypes[token.action] + "='" + escapeName(token.value) + "'" + (token.ignoreCase ? "i" : "") + "]";
          default:
              throw new Error("Unknown type");
      }
  }
  function escapeName(str) {
      //TODO
      return str;
  }
  });

  unwrapExports(stringify_1);

  var lib = createCommonjsModule(function (module, exports) {
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
      for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(parse_1, exports);
  var parse_1$1 = parse_1;
  Object.defineProperty(exports, "parse", { enumerable: true, get: function () { return parse_1$1.default; } });

  Object.defineProperty(exports, "stringify", { enumerable: true, get: function () { return stringify_1.default; } });
  });

  var parse = unwrapExports(lib);

  let cache = {};

  function parseSelector(selector) {
    let ast = cache[selector];
    if (ast == null) {
      ast = parse(selector);
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

  var decode = {
  	"0": 65533,
  	"128": 8364,
  	"130": 8218,
  	"131": 402,
  	"132": 8222,
  	"133": 8230,
  	"134": 8224,
  	"135": 8225,
  	"136": 710,
  	"137": 8240,
  	"138": 352,
  	"139": 8249,
  	"140": 338,
  	"142": 381,
  	"145": 8216,
  	"146": 8217,
  	"147": 8220,
  	"148": 8221,
  	"149": 8226,
  	"150": 8211,
  	"151": 8212,
  	"152": 732,
  	"153": 8482,
  	"154": 353,
  	"155": 8250,
  	"156": 339,
  	"158": 382,
  	"159": 376
  };

  var decode$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    'default': decode
  });

  var require$$0 = getCjsExportFromNamespace(decode$1);

  var decode_codepoint = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var decode_json_1 = __importDefault(require$$0);
  // modified version of https://github.com/mathiasbynens/he/blob/master/src/he.js#L94-L119
  function decodeCodePoint(codePoint) {
      if ((codePoint >= 0xd800 && codePoint <= 0xdfff) || codePoint > 0x10ffff) {
          return "\uFFFD";
      }
      if (codePoint in decode_json_1.default) {
          codePoint = decode_json_1.default[codePoint];
      }
      var output = "";
      if (codePoint > 0xffff) {
          codePoint -= 0x10000;
          output += String.fromCharCode(((codePoint >>> 10) & 0x3ff) | 0xd800);
          codePoint = 0xdc00 | (codePoint & 0x3ff);
      }
      output += String.fromCharCode(codePoint);
      return output;
  }
  exports.default = decodeCodePoint;
  });

  unwrapExports(decode_codepoint);

  var Aacute = "Á";
  var aacute = "á";
  var Abreve = "Ă";
  var abreve = "ă";
  var ac = "∾";
  var acd = "∿";
  var acE = "∾̳";
  var Acirc = "Â";
  var acirc = "â";
  var acute = "´";
  var Acy = "А";
  var acy = "а";
  var AElig = "Æ";
  var aelig = "æ";
  var af = "⁡";
  var Afr = "𝔄";
  var afr = "𝔞";
  var Agrave = "À";
  var agrave = "à";
  var alefsym = "ℵ";
  var aleph = "ℵ";
  var Alpha = "Α";
  var alpha = "α";
  var Amacr = "Ā";
  var amacr = "ā";
  var amalg = "⨿";
  var amp = "&";
  var AMP = "&";
  var andand = "⩕";
  var And = "⩓";
  var and = "∧";
  var andd = "⩜";
  var andslope = "⩘";
  var andv = "⩚";
  var ang = "∠";
  var ange = "⦤";
  var angle = "∠";
  var angmsdaa = "⦨";
  var angmsdab = "⦩";
  var angmsdac = "⦪";
  var angmsdad = "⦫";
  var angmsdae = "⦬";
  var angmsdaf = "⦭";
  var angmsdag = "⦮";
  var angmsdah = "⦯";
  var angmsd = "∡";
  var angrt = "∟";
  var angrtvb = "⊾";
  var angrtvbd = "⦝";
  var angsph = "∢";
  var angst = "Å";
  var angzarr = "⍼";
  var Aogon = "Ą";
  var aogon = "ą";
  var Aopf = "𝔸";
  var aopf = "𝕒";
  var apacir = "⩯";
  var ap = "≈";
  var apE = "⩰";
  var ape = "≊";
  var apid = "≋";
  var apos = "'";
  var ApplyFunction = "⁡";
  var approx = "≈";
  var approxeq = "≊";
  var Aring = "Å";
  var aring = "å";
  var Ascr = "𝒜";
  var ascr = "𝒶";
  var Assign = "≔";
  var ast = "*";
  var asymp = "≈";
  var asympeq = "≍";
  var Atilde = "Ã";
  var atilde = "ã";
  var Auml = "Ä";
  var auml = "ä";
  var awconint = "∳";
  var awint = "⨑";
  var backcong = "≌";
  var backepsilon = "϶";
  var backprime = "‵";
  var backsim = "∽";
  var backsimeq = "⋍";
  var Backslash = "∖";
  var Barv = "⫧";
  var barvee = "⊽";
  var barwed = "⌅";
  var Barwed = "⌆";
  var barwedge = "⌅";
  var bbrk = "⎵";
  var bbrktbrk = "⎶";
  var bcong = "≌";
  var Bcy = "Б";
  var bcy = "б";
  var bdquo = "„";
  var becaus = "∵";
  var because = "∵";
  var Because = "∵";
  var bemptyv = "⦰";
  var bepsi = "϶";
  var bernou = "ℬ";
  var Bernoullis = "ℬ";
  var Beta = "Β";
  var beta = "β";
  var beth = "ℶ";
  var between = "≬";
  var Bfr = "𝔅";
  var bfr = "𝔟";
  var bigcap = "⋂";
  var bigcirc = "◯";
  var bigcup = "⋃";
  var bigodot = "⨀";
  var bigoplus = "⨁";
  var bigotimes = "⨂";
  var bigsqcup = "⨆";
  var bigstar = "★";
  var bigtriangledown = "▽";
  var bigtriangleup = "△";
  var biguplus = "⨄";
  var bigvee = "⋁";
  var bigwedge = "⋀";
  var bkarow = "⤍";
  var blacklozenge = "⧫";
  var blacksquare = "▪";
  var blacktriangle = "▴";
  var blacktriangledown = "▾";
  var blacktriangleleft = "◂";
  var blacktriangleright = "▸";
  var blank = "␣";
  var blk12 = "▒";
  var blk14 = "░";
  var blk34 = "▓";
  var block = "█";
  var bne = "=⃥";
  var bnequiv = "≡⃥";
  var bNot = "⫭";
  var bnot = "⌐";
  var Bopf = "𝔹";
  var bopf = "𝕓";
  var bot = "⊥";
  var bottom = "⊥";
  var bowtie = "⋈";
  var boxbox = "⧉";
  var boxdl = "┐";
  var boxdL = "╕";
  var boxDl = "╖";
  var boxDL = "╗";
  var boxdr = "┌";
  var boxdR = "╒";
  var boxDr = "╓";
  var boxDR = "╔";
  var boxh = "─";
  var boxH = "═";
  var boxhd = "┬";
  var boxHd = "╤";
  var boxhD = "╥";
  var boxHD = "╦";
  var boxhu = "┴";
  var boxHu = "╧";
  var boxhU = "╨";
  var boxHU = "╩";
  var boxminus = "⊟";
  var boxplus = "⊞";
  var boxtimes = "⊠";
  var boxul = "┘";
  var boxuL = "╛";
  var boxUl = "╜";
  var boxUL = "╝";
  var boxur = "└";
  var boxuR = "╘";
  var boxUr = "╙";
  var boxUR = "╚";
  var boxv = "│";
  var boxV = "║";
  var boxvh = "┼";
  var boxvH = "╪";
  var boxVh = "╫";
  var boxVH = "╬";
  var boxvl = "┤";
  var boxvL = "╡";
  var boxVl = "╢";
  var boxVL = "╣";
  var boxvr = "├";
  var boxvR = "╞";
  var boxVr = "╟";
  var boxVR = "╠";
  var bprime = "‵";
  var breve = "˘";
  var Breve = "˘";
  var brvbar = "¦";
  var bscr = "𝒷";
  var Bscr = "ℬ";
  var bsemi = "⁏";
  var bsim = "∽";
  var bsime = "⋍";
  var bsolb = "⧅";
  var bsol = "\\";
  var bsolhsub = "⟈";
  var bull = "•";
  var bullet = "•";
  var bump = "≎";
  var bumpE = "⪮";
  var bumpe = "≏";
  var Bumpeq = "≎";
  var bumpeq = "≏";
  var Cacute = "Ć";
  var cacute = "ć";
  var capand = "⩄";
  var capbrcup = "⩉";
  var capcap = "⩋";
  var cap = "∩";
  var Cap = "⋒";
  var capcup = "⩇";
  var capdot = "⩀";
  var CapitalDifferentialD = "ⅅ";
  var caps = "∩︀";
  var caret = "⁁";
  var caron = "ˇ";
  var Cayleys = "ℭ";
  var ccaps = "⩍";
  var Ccaron = "Č";
  var ccaron = "č";
  var Ccedil = "Ç";
  var ccedil = "ç";
  var Ccirc = "Ĉ";
  var ccirc = "ĉ";
  var Cconint = "∰";
  var ccups = "⩌";
  var ccupssm = "⩐";
  var Cdot = "Ċ";
  var cdot = "ċ";
  var cedil = "¸";
  var Cedilla = "¸";
  var cemptyv = "⦲";
  var cent = "¢";
  var centerdot = "·";
  var CenterDot = "·";
  var cfr = "𝔠";
  var Cfr = "ℭ";
  var CHcy = "Ч";
  var chcy = "ч";
  var check = "✓";
  var checkmark = "✓";
  var Chi = "Χ";
  var chi = "χ";
  var circ = "ˆ";
  var circeq = "≗";
  var circlearrowleft = "↺";
  var circlearrowright = "↻";
  var circledast = "⊛";
  var circledcirc = "⊚";
  var circleddash = "⊝";
  var CircleDot = "⊙";
  var circledR = "®";
  var circledS = "Ⓢ";
  var CircleMinus = "⊖";
  var CirclePlus = "⊕";
  var CircleTimes = "⊗";
  var cir = "○";
  var cirE = "⧃";
  var cire = "≗";
  var cirfnint = "⨐";
  var cirmid = "⫯";
  var cirscir = "⧂";
  var ClockwiseContourIntegral = "∲";
  var CloseCurlyDoubleQuote = "”";
  var CloseCurlyQuote = "’";
  var clubs = "♣";
  var clubsuit = "♣";
  var colon = ":";
  var Colon = "∷";
  var Colone = "⩴";
  var colone = "≔";
  var coloneq = "≔";
  var comma = ",";
  var commat = "@";
  var comp = "∁";
  var compfn = "∘";
  var complement = "∁";
  var complexes = "ℂ";
  var cong = "≅";
  var congdot = "⩭";
  var Congruent = "≡";
  var conint = "∮";
  var Conint = "∯";
  var ContourIntegral = "∮";
  var copf = "𝕔";
  var Copf = "ℂ";
  var coprod = "∐";
  var Coproduct = "∐";
  var copy = "©";
  var COPY = "©";
  var copysr = "℗";
  var CounterClockwiseContourIntegral = "∳";
  var crarr = "↵";
  var cross = "✗";
  var Cross = "⨯";
  var Cscr = "𝒞";
  var cscr = "𝒸";
  var csub = "⫏";
  var csube = "⫑";
  var csup = "⫐";
  var csupe = "⫒";
  var ctdot = "⋯";
  var cudarrl = "⤸";
  var cudarrr = "⤵";
  var cuepr = "⋞";
  var cuesc = "⋟";
  var cularr = "↶";
  var cularrp = "⤽";
  var cupbrcap = "⩈";
  var cupcap = "⩆";
  var CupCap = "≍";
  var cup = "∪";
  var Cup = "⋓";
  var cupcup = "⩊";
  var cupdot = "⊍";
  var cupor = "⩅";
  var cups = "∪︀";
  var curarr = "↷";
  var curarrm = "⤼";
  var curlyeqprec = "⋞";
  var curlyeqsucc = "⋟";
  var curlyvee = "⋎";
  var curlywedge = "⋏";
  var curren = "¤";
  var curvearrowleft = "↶";
  var curvearrowright = "↷";
  var cuvee = "⋎";
  var cuwed = "⋏";
  var cwconint = "∲";
  var cwint = "∱";
  var cylcty = "⌭";
  var dagger = "†";
  var Dagger = "‡";
  var daleth = "ℸ";
  var darr = "↓";
  var Darr = "↡";
  var dArr = "⇓";
  var dash = "‐";
  var Dashv = "⫤";
  var dashv = "⊣";
  var dbkarow = "⤏";
  var dblac = "˝";
  var Dcaron = "Ď";
  var dcaron = "ď";
  var Dcy = "Д";
  var dcy = "д";
  var ddagger = "‡";
  var ddarr = "⇊";
  var DD = "ⅅ";
  var dd = "ⅆ";
  var DDotrahd = "⤑";
  var ddotseq = "⩷";
  var deg = "°";
  var Del = "∇";
  var Delta = "Δ";
  var delta = "δ";
  var demptyv = "⦱";
  var dfisht = "⥿";
  var Dfr = "𝔇";
  var dfr = "𝔡";
  var dHar = "⥥";
  var dharl = "⇃";
  var dharr = "⇂";
  var DiacriticalAcute = "´";
  var DiacriticalDot = "˙";
  var DiacriticalDoubleAcute = "˝";
  var DiacriticalGrave = "`";
  var DiacriticalTilde = "˜";
  var diam = "⋄";
  var diamond = "⋄";
  var Diamond = "⋄";
  var diamondsuit = "♦";
  var diams = "♦";
  var die = "¨";
  var DifferentialD = "ⅆ";
  var digamma = "ϝ";
  var disin = "⋲";
  var div = "÷";
  var divide = "÷";
  var divideontimes = "⋇";
  var divonx = "⋇";
  var DJcy = "Ђ";
  var djcy = "ђ";
  var dlcorn = "⌞";
  var dlcrop = "⌍";
  var dollar = "$";
  var Dopf = "𝔻";
  var dopf = "𝕕";
  var Dot = "¨";
  var dot = "˙";
  var DotDot = "⃜";
  var doteq = "≐";
  var doteqdot = "≑";
  var DotEqual = "≐";
  var dotminus = "∸";
  var dotplus = "∔";
  var dotsquare = "⊡";
  var doublebarwedge = "⌆";
  var DoubleContourIntegral = "∯";
  var DoubleDot = "¨";
  var DoubleDownArrow = "⇓";
  var DoubleLeftArrow = "⇐";
  var DoubleLeftRightArrow = "⇔";
  var DoubleLeftTee = "⫤";
  var DoubleLongLeftArrow = "⟸";
  var DoubleLongLeftRightArrow = "⟺";
  var DoubleLongRightArrow = "⟹";
  var DoubleRightArrow = "⇒";
  var DoubleRightTee = "⊨";
  var DoubleUpArrow = "⇑";
  var DoubleUpDownArrow = "⇕";
  var DoubleVerticalBar = "∥";
  var DownArrowBar = "⤓";
  var downarrow = "↓";
  var DownArrow = "↓";
  var Downarrow = "⇓";
  var DownArrowUpArrow = "⇵";
  var DownBreve = "̑";
  var downdownarrows = "⇊";
  var downharpoonleft = "⇃";
  var downharpoonright = "⇂";
  var DownLeftRightVector = "⥐";
  var DownLeftTeeVector = "⥞";
  var DownLeftVectorBar = "⥖";
  var DownLeftVector = "↽";
  var DownRightTeeVector = "⥟";
  var DownRightVectorBar = "⥗";
  var DownRightVector = "⇁";
  var DownTeeArrow = "↧";
  var DownTee = "⊤";
  var drbkarow = "⤐";
  var drcorn = "⌟";
  var drcrop = "⌌";
  var Dscr = "𝒟";
  var dscr = "𝒹";
  var DScy = "Ѕ";
  var dscy = "ѕ";
  var dsol = "⧶";
  var Dstrok = "Đ";
  var dstrok = "đ";
  var dtdot = "⋱";
  var dtri = "▿";
  var dtrif = "▾";
  var duarr = "⇵";
  var duhar = "⥯";
  var dwangle = "⦦";
  var DZcy = "Џ";
  var dzcy = "џ";
  var dzigrarr = "⟿";
  var Eacute = "É";
  var eacute = "é";
  var easter = "⩮";
  var Ecaron = "Ě";
  var ecaron = "ě";
  var Ecirc = "Ê";
  var ecirc = "ê";
  var ecir = "≖";
  var ecolon = "≕";
  var Ecy = "Э";
  var ecy = "э";
  var eDDot = "⩷";
  var Edot = "Ė";
  var edot = "ė";
  var eDot = "≑";
  var ee = "ⅇ";
  var efDot = "≒";
  var Efr = "𝔈";
  var efr = "𝔢";
  var eg = "⪚";
  var Egrave = "È";
  var egrave = "è";
  var egs = "⪖";
  var egsdot = "⪘";
  var el = "⪙";
  var Element = "∈";
  var elinters = "⏧";
  var ell = "ℓ";
  var els = "⪕";
  var elsdot = "⪗";
  var Emacr = "Ē";
  var emacr = "ē";
  var empty = "∅";
  var emptyset = "∅";
  var EmptySmallSquare = "◻";
  var emptyv = "∅";
  var EmptyVerySmallSquare = "▫";
  var emsp13 = " ";
  var emsp14 = " ";
  var emsp = " ";
  var ENG = "Ŋ";
  var eng = "ŋ";
  var ensp = " ";
  var Eogon = "Ę";
  var eogon = "ę";
  var Eopf = "𝔼";
  var eopf = "𝕖";
  var epar = "⋕";
  var eparsl = "⧣";
  var eplus = "⩱";
  var epsi = "ε";
  var Epsilon = "Ε";
  var epsilon = "ε";
  var epsiv = "ϵ";
  var eqcirc = "≖";
  var eqcolon = "≕";
  var eqsim = "≂";
  var eqslantgtr = "⪖";
  var eqslantless = "⪕";
  var Equal = "⩵";
  var equals = "=";
  var EqualTilde = "≂";
  var equest = "≟";
  var Equilibrium = "⇌";
  var equiv = "≡";
  var equivDD = "⩸";
  var eqvparsl = "⧥";
  var erarr = "⥱";
  var erDot = "≓";
  var escr = "ℯ";
  var Escr = "ℰ";
  var esdot = "≐";
  var Esim = "⩳";
  var esim = "≂";
  var Eta = "Η";
  var eta = "η";
  var ETH = "Ð";
  var eth = "ð";
  var Euml = "Ë";
  var euml = "ë";
  var euro = "€";
  var excl = "!";
  var exist = "∃";
  var Exists = "∃";
  var expectation = "ℰ";
  var exponentiale = "ⅇ";
  var ExponentialE = "ⅇ";
  var fallingdotseq = "≒";
  var Fcy = "Ф";
  var fcy = "ф";
  var female = "♀";
  var ffilig = "ﬃ";
  var fflig = "ﬀ";
  var ffllig = "ﬄ";
  var Ffr = "𝔉";
  var ffr = "𝔣";
  var filig = "ﬁ";
  var FilledSmallSquare = "◼";
  var FilledVerySmallSquare = "▪";
  var fjlig = "fj";
  var flat = "♭";
  var fllig = "ﬂ";
  var fltns = "▱";
  var fnof = "ƒ";
  var Fopf = "𝔽";
  var fopf = "𝕗";
  var forall = "∀";
  var ForAll = "∀";
  var fork = "⋔";
  var forkv = "⫙";
  var Fouriertrf = "ℱ";
  var fpartint = "⨍";
  var frac12 = "½";
  var frac13 = "⅓";
  var frac14 = "¼";
  var frac15 = "⅕";
  var frac16 = "⅙";
  var frac18 = "⅛";
  var frac23 = "⅔";
  var frac25 = "⅖";
  var frac34 = "¾";
  var frac35 = "⅗";
  var frac38 = "⅜";
  var frac45 = "⅘";
  var frac56 = "⅚";
  var frac58 = "⅝";
  var frac78 = "⅞";
  var frasl = "⁄";
  var frown = "⌢";
  var fscr = "𝒻";
  var Fscr = "ℱ";
  var gacute = "ǵ";
  var Gamma = "Γ";
  var gamma = "γ";
  var Gammad = "Ϝ";
  var gammad = "ϝ";
  var gap = "⪆";
  var Gbreve = "Ğ";
  var gbreve = "ğ";
  var Gcedil = "Ģ";
  var Gcirc = "Ĝ";
  var gcirc = "ĝ";
  var Gcy = "Г";
  var gcy = "г";
  var Gdot = "Ġ";
  var gdot = "ġ";
  var ge = "≥";
  var gE = "≧";
  var gEl = "⪌";
  var gel = "⋛";
  var geq = "≥";
  var geqq = "≧";
  var geqslant = "⩾";
  var gescc = "⪩";
  var ges = "⩾";
  var gesdot = "⪀";
  var gesdoto = "⪂";
  var gesdotol = "⪄";
  var gesl = "⋛︀";
  var gesles = "⪔";
  var Gfr = "𝔊";
  var gfr = "𝔤";
  var gg = "≫";
  var Gg = "⋙";
  var ggg = "⋙";
  var gimel = "ℷ";
  var GJcy = "Ѓ";
  var gjcy = "ѓ";
  var gla = "⪥";
  var gl = "≷";
  var glE = "⪒";
  var glj = "⪤";
  var gnap = "⪊";
  var gnapprox = "⪊";
  var gne = "⪈";
  var gnE = "≩";
  var gneq = "⪈";
  var gneqq = "≩";
  var gnsim = "⋧";
  var Gopf = "𝔾";
  var gopf = "𝕘";
  var grave = "`";
  var GreaterEqual = "≥";
  var GreaterEqualLess = "⋛";
  var GreaterFullEqual = "≧";
  var GreaterGreater = "⪢";
  var GreaterLess = "≷";
  var GreaterSlantEqual = "⩾";
  var GreaterTilde = "≳";
  var Gscr = "𝒢";
  var gscr = "ℊ";
  var gsim = "≳";
  var gsime = "⪎";
  var gsiml = "⪐";
  var gtcc = "⪧";
  var gtcir = "⩺";
  var gt = ">";
  var GT = ">";
  var Gt = "≫";
  var gtdot = "⋗";
  var gtlPar = "⦕";
  var gtquest = "⩼";
  var gtrapprox = "⪆";
  var gtrarr = "⥸";
  var gtrdot = "⋗";
  var gtreqless = "⋛";
  var gtreqqless = "⪌";
  var gtrless = "≷";
  var gtrsim = "≳";
  var gvertneqq = "≩︀";
  var gvnE = "≩︀";
  var Hacek = "ˇ";
  var hairsp = " ";
  var half = "½";
  var hamilt = "ℋ";
  var HARDcy = "Ъ";
  var hardcy = "ъ";
  var harrcir = "⥈";
  var harr = "↔";
  var hArr = "⇔";
  var harrw = "↭";
  var Hat = "^";
  var hbar = "ℏ";
  var Hcirc = "Ĥ";
  var hcirc = "ĥ";
  var hearts = "♥";
  var heartsuit = "♥";
  var hellip = "…";
  var hercon = "⊹";
  var hfr = "𝔥";
  var Hfr = "ℌ";
  var HilbertSpace = "ℋ";
  var hksearow = "⤥";
  var hkswarow = "⤦";
  var hoarr = "⇿";
  var homtht = "∻";
  var hookleftarrow = "↩";
  var hookrightarrow = "↪";
  var hopf = "𝕙";
  var Hopf = "ℍ";
  var horbar = "―";
  var HorizontalLine = "─";
  var hscr = "𝒽";
  var Hscr = "ℋ";
  var hslash = "ℏ";
  var Hstrok = "Ħ";
  var hstrok = "ħ";
  var HumpDownHump = "≎";
  var HumpEqual = "≏";
  var hybull = "⁃";
  var hyphen = "‐";
  var Iacute = "Í";
  var iacute = "í";
  var ic = "⁣";
  var Icirc = "Î";
  var icirc = "î";
  var Icy = "И";
  var icy = "и";
  var Idot = "İ";
  var IEcy = "Е";
  var iecy = "е";
  var iexcl = "¡";
  var iff = "⇔";
  var ifr = "𝔦";
  var Ifr = "ℑ";
  var Igrave = "Ì";
  var igrave = "ì";
  var ii = "ⅈ";
  var iiiint = "⨌";
  var iiint = "∭";
  var iinfin = "⧜";
  var iiota = "℩";
  var IJlig = "Ĳ";
  var ijlig = "ĳ";
  var Imacr = "Ī";
  var imacr = "ī";
  var image = "ℑ";
  var ImaginaryI = "ⅈ";
  var imagline = "ℐ";
  var imagpart = "ℑ";
  var imath = "ı";
  var Im = "ℑ";
  var imof = "⊷";
  var imped = "Ƶ";
  var Implies = "⇒";
  var incare = "℅";
  var infin = "∞";
  var infintie = "⧝";
  var inodot = "ı";
  var intcal = "⊺";
  var int = "∫";
  var Int = "∬";
  var integers = "ℤ";
  var Integral = "∫";
  var intercal = "⊺";
  var Intersection = "⋂";
  var intlarhk = "⨗";
  var intprod = "⨼";
  var InvisibleComma = "⁣";
  var InvisibleTimes = "⁢";
  var IOcy = "Ё";
  var iocy = "ё";
  var Iogon = "Į";
  var iogon = "į";
  var Iopf = "𝕀";
  var iopf = "𝕚";
  var Iota = "Ι";
  var iota = "ι";
  var iprod = "⨼";
  var iquest = "¿";
  var iscr = "𝒾";
  var Iscr = "ℐ";
  var isin = "∈";
  var isindot = "⋵";
  var isinE = "⋹";
  var isins = "⋴";
  var isinsv = "⋳";
  var isinv = "∈";
  var it = "⁢";
  var Itilde = "Ĩ";
  var itilde = "ĩ";
  var Iukcy = "І";
  var iukcy = "і";
  var Iuml = "Ï";
  var iuml = "ï";
  var Jcirc = "Ĵ";
  var jcirc = "ĵ";
  var Jcy = "Й";
  var jcy = "й";
  var Jfr = "𝔍";
  var jfr = "𝔧";
  var jmath = "ȷ";
  var Jopf = "𝕁";
  var jopf = "𝕛";
  var Jscr = "𝒥";
  var jscr = "𝒿";
  var Jsercy = "Ј";
  var jsercy = "ј";
  var Jukcy = "Є";
  var jukcy = "є";
  var Kappa = "Κ";
  var kappa = "κ";
  var kappav = "ϰ";
  var Kcedil = "Ķ";
  var kcedil = "ķ";
  var Kcy = "К";
  var kcy = "к";
  var Kfr = "𝔎";
  var kfr = "𝔨";
  var kgreen = "ĸ";
  var KHcy = "Х";
  var khcy = "х";
  var KJcy = "Ќ";
  var kjcy = "ќ";
  var Kopf = "𝕂";
  var kopf = "𝕜";
  var Kscr = "𝒦";
  var kscr = "𝓀";
  var lAarr = "⇚";
  var Lacute = "Ĺ";
  var lacute = "ĺ";
  var laemptyv = "⦴";
  var lagran = "ℒ";
  var Lambda = "Λ";
  var lambda = "λ";
  var lang = "⟨";
  var Lang = "⟪";
  var langd = "⦑";
  var langle = "⟨";
  var lap = "⪅";
  var Laplacetrf = "ℒ";
  var laquo = "«";
  var larrb = "⇤";
  var larrbfs = "⤟";
  var larr = "←";
  var Larr = "↞";
  var lArr = "⇐";
  var larrfs = "⤝";
  var larrhk = "↩";
  var larrlp = "↫";
  var larrpl = "⤹";
  var larrsim = "⥳";
  var larrtl = "↢";
  var latail = "⤙";
  var lAtail = "⤛";
  var lat = "⪫";
  var late = "⪭";
  var lates = "⪭︀";
  var lbarr = "⤌";
  var lBarr = "⤎";
  var lbbrk = "❲";
  var lbrace = "{";
  var lbrack = "[";
  var lbrke = "⦋";
  var lbrksld = "⦏";
  var lbrkslu = "⦍";
  var Lcaron = "Ľ";
  var lcaron = "ľ";
  var Lcedil = "Ļ";
  var lcedil = "ļ";
  var lceil = "⌈";
  var lcub = "{";
  var Lcy = "Л";
  var lcy = "л";
  var ldca = "⤶";
  var ldquo = "“";
  var ldquor = "„";
  var ldrdhar = "⥧";
  var ldrushar = "⥋";
  var ldsh = "↲";
  var le = "≤";
  var lE = "≦";
  var LeftAngleBracket = "⟨";
  var LeftArrowBar = "⇤";
  var leftarrow = "←";
  var LeftArrow = "←";
  var Leftarrow = "⇐";
  var LeftArrowRightArrow = "⇆";
  var leftarrowtail = "↢";
  var LeftCeiling = "⌈";
  var LeftDoubleBracket = "⟦";
  var LeftDownTeeVector = "⥡";
  var LeftDownVectorBar = "⥙";
  var LeftDownVector = "⇃";
  var LeftFloor = "⌊";
  var leftharpoondown = "↽";
  var leftharpoonup = "↼";
  var leftleftarrows = "⇇";
  var leftrightarrow = "↔";
  var LeftRightArrow = "↔";
  var Leftrightarrow = "⇔";
  var leftrightarrows = "⇆";
  var leftrightharpoons = "⇋";
  var leftrightsquigarrow = "↭";
  var LeftRightVector = "⥎";
  var LeftTeeArrow = "↤";
  var LeftTee = "⊣";
  var LeftTeeVector = "⥚";
  var leftthreetimes = "⋋";
  var LeftTriangleBar = "⧏";
  var LeftTriangle = "⊲";
  var LeftTriangleEqual = "⊴";
  var LeftUpDownVector = "⥑";
  var LeftUpTeeVector = "⥠";
  var LeftUpVectorBar = "⥘";
  var LeftUpVector = "↿";
  var LeftVectorBar = "⥒";
  var LeftVector = "↼";
  var lEg = "⪋";
  var leg = "⋚";
  var leq = "≤";
  var leqq = "≦";
  var leqslant = "⩽";
  var lescc = "⪨";
  var les = "⩽";
  var lesdot = "⩿";
  var lesdoto = "⪁";
  var lesdotor = "⪃";
  var lesg = "⋚︀";
  var lesges = "⪓";
  var lessapprox = "⪅";
  var lessdot = "⋖";
  var lesseqgtr = "⋚";
  var lesseqqgtr = "⪋";
  var LessEqualGreater = "⋚";
  var LessFullEqual = "≦";
  var LessGreater = "≶";
  var lessgtr = "≶";
  var LessLess = "⪡";
  var lesssim = "≲";
  var LessSlantEqual = "⩽";
  var LessTilde = "≲";
  var lfisht = "⥼";
  var lfloor = "⌊";
  var Lfr = "𝔏";
  var lfr = "𝔩";
  var lg = "≶";
  var lgE = "⪑";
  var lHar = "⥢";
  var lhard = "↽";
  var lharu = "↼";
  var lharul = "⥪";
  var lhblk = "▄";
  var LJcy = "Љ";
  var ljcy = "љ";
  var llarr = "⇇";
  var ll = "≪";
  var Ll = "⋘";
  var llcorner = "⌞";
  var Lleftarrow = "⇚";
  var llhard = "⥫";
  var lltri = "◺";
  var Lmidot = "Ŀ";
  var lmidot = "ŀ";
  var lmoustache = "⎰";
  var lmoust = "⎰";
  var lnap = "⪉";
  var lnapprox = "⪉";
  var lne = "⪇";
  var lnE = "≨";
  var lneq = "⪇";
  var lneqq = "≨";
  var lnsim = "⋦";
  var loang = "⟬";
  var loarr = "⇽";
  var lobrk = "⟦";
  var longleftarrow = "⟵";
  var LongLeftArrow = "⟵";
  var Longleftarrow = "⟸";
  var longleftrightarrow = "⟷";
  var LongLeftRightArrow = "⟷";
  var Longleftrightarrow = "⟺";
  var longmapsto = "⟼";
  var longrightarrow = "⟶";
  var LongRightArrow = "⟶";
  var Longrightarrow = "⟹";
  var looparrowleft = "↫";
  var looparrowright = "↬";
  var lopar = "⦅";
  var Lopf = "𝕃";
  var lopf = "𝕝";
  var loplus = "⨭";
  var lotimes = "⨴";
  var lowast = "∗";
  var lowbar = "_";
  var LowerLeftArrow = "↙";
  var LowerRightArrow = "↘";
  var loz = "◊";
  var lozenge = "◊";
  var lozf = "⧫";
  var lpar = "(";
  var lparlt = "⦓";
  var lrarr = "⇆";
  var lrcorner = "⌟";
  var lrhar = "⇋";
  var lrhard = "⥭";
  var lrm = "‎";
  var lrtri = "⊿";
  var lsaquo = "‹";
  var lscr = "𝓁";
  var Lscr = "ℒ";
  var lsh = "↰";
  var Lsh = "↰";
  var lsim = "≲";
  var lsime = "⪍";
  var lsimg = "⪏";
  var lsqb = "[";
  var lsquo = "‘";
  var lsquor = "‚";
  var Lstrok = "Ł";
  var lstrok = "ł";
  var ltcc = "⪦";
  var ltcir = "⩹";
  var lt = "<";
  var LT = "<";
  var Lt = "≪";
  var ltdot = "⋖";
  var lthree = "⋋";
  var ltimes = "⋉";
  var ltlarr = "⥶";
  var ltquest = "⩻";
  var ltri = "◃";
  var ltrie = "⊴";
  var ltrif = "◂";
  var ltrPar = "⦖";
  var lurdshar = "⥊";
  var luruhar = "⥦";
  var lvertneqq = "≨︀";
  var lvnE = "≨︀";
  var macr = "¯";
  var male = "♂";
  var malt = "✠";
  var maltese = "✠";
  var map = "↦";
  var mapsto = "↦";
  var mapstodown = "↧";
  var mapstoleft = "↤";
  var mapstoup = "↥";
  var marker = "▮";
  var mcomma = "⨩";
  var Mcy = "М";
  var mcy = "м";
  var mdash = "—";
  var mDDot = "∺";
  var measuredangle = "∡";
  var MediumSpace = " ";
  var Mellintrf = "ℳ";
  var Mfr = "𝔐";
  var mfr = "𝔪";
  var mho = "℧";
  var micro = "µ";
  var midast = "*";
  var midcir = "⫰";
  var mid = "∣";
  var middot = "·";
  var minusb = "⊟";
  var minus = "−";
  var minusd = "∸";
  var minusdu = "⨪";
  var MinusPlus = "∓";
  var mlcp = "⫛";
  var mldr = "…";
  var mnplus = "∓";
  var models = "⊧";
  var Mopf = "𝕄";
  var mopf = "𝕞";
  var mp = "∓";
  var mscr = "𝓂";
  var Mscr = "ℳ";
  var mstpos = "∾";
  var Mu = "Μ";
  var mu = "μ";
  var multimap = "⊸";
  var mumap = "⊸";
  var nabla = "∇";
  var Nacute = "Ń";
  var nacute = "ń";
  var nang = "∠⃒";
  var nap = "≉";
  var napE = "⩰̸";
  var napid = "≋̸";
  var napos = "ŉ";
  var napprox = "≉";
  var natural = "♮";
  var naturals = "ℕ";
  var natur = "♮";
  var nbsp = " ";
  var nbump = "≎̸";
  var nbumpe = "≏̸";
  var ncap = "⩃";
  var Ncaron = "Ň";
  var ncaron = "ň";
  var Ncedil = "Ņ";
  var ncedil = "ņ";
  var ncong = "≇";
  var ncongdot = "⩭̸";
  var ncup = "⩂";
  var Ncy = "Н";
  var ncy = "н";
  var ndash = "–";
  var nearhk = "⤤";
  var nearr = "↗";
  var neArr = "⇗";
  var nearrow = "↗";
  var ne = "≠";
  var nedot = "≐̸";
  var NegativeMediumSpace = "​";
  var NegativeThickSpace = "​";
  var NegativeThinSpace = "​";
  var NegativeVeryThinSpace = "​";
  var nequiv = "≢";
  var nesear = "⤨";
  var nesim = "≂̸";
  var NestedGreaterGreater = "≫";
  var NestedLessLess = "≪";
  var NewLine = "\n";
  var nexist = "∄";
  var nexists = "∄";
  var Nfr = "𝔑";
  var nfr = "𝔫";
  var ngE = "≧̸";
  var nge = "≱";
  var ngeq = "≱";
  var ngeqq = "≧̸";
  var ngeqslant = "⩾̸";
  var nges = "⩾̸";
  var nGg = "⋙̸";
  var ngsim = "≵";
  var nGt = "≫⃒";
  var ngt = "≯";
  var ngtr = "≯";
  var nGtv = "≫̸";
  var nharr = "↮";
  var nhArr = "⇎";
  var nhpar = "⫲";
  var ni = "∋";
  var nis = "⋼";
  var nisd = "⋺";
  var niv = "∋";
  var NJcy = "Њ";
  var njcy = "њ";
  var nlarr = "↚";
  var nlArr = "⇍";
  var nldr = "‥";
  var nlE = "≦̸";
  var nle = "≰";
  var nleftarrow = "↚";
  var nLeftarrow = "⇍";
  var nleftrightarrow = "↮";
  var nLeftrightarrow = "⇎";
  var nleq = "≰";
  var nleqq = "≦̸";
  var nleqslant = "⩽̸";
  var nles = "⩽̸";
  var nless = "≮";
  var nLl = "⋘̸";
  var nlsim = "≴";
  var nLt = "≪⃒";
  var nlt = "≮";
  var nltri = "⋪";
  var nltrie = "⋬";
  var nLtv = "≪̸";
  var nmid = "∤";
  var NoBreak = "⁠";
  var NonBreakingSpace = " ";
  var nopf = "𝕟";
  var Nopf = "ℕ";
  var Not = "⫬";
  var not = "¬";
  var NotCongruent = "≢";
  var NotCupCap = "≭";
  var NotDoubleVerticalBar = "∦";
  var NotElement = "∉";
  var NotEqual = "≠";
  var NotEqualTilde = "≂̸";
  var NotExists = "∄";
  var NotGreater = "≯";
  var NotGreaterEqual = "≱";
  var NotGreaterFullEqual = "≧̸";
  var NotGreaterGreater = "≫̸";
  var NotGreaterLess = "≹";
  var NotGreaterSlantEqual = "⩾̸";
  var NotGreaterTilde = "≵";
  var NotHumpDownHump = "≎̸";
  var NotHumpEqual = "≏̸";
  var notin = "∉";
  var notindot = "⋵̸";
  var notinE = "⋹̸";
  var notinva = "∉";
  var notinvb = "⋷";
  var notinvc = "⋶";
  var NotLeftTriangleBar = "⧏̸";
  var NotLeftTriangle = "⋪";
  var NotLeftTriangleEqual = "⋬";
  var NotLess = "≮";
  var NotLessEqual = "≰";
  var NotLessGreater = "≸";
  var NotLessLess = "≪̸";
  var NotLessSlantEqual = "⩽̸";
  var NotLessTilde = "≴";
  var NotNestedGreaterGreater = "⪢̸";
  var NotNestedLessLess = "⪡̸";
  var notni = "∌";
  var notniva = "∌";
  var notnivb = "⋾";
  var notnivc = "⋽";
  var NotPrecedes = "⊀";
  var NotPrecedesEqual = "⪯̸";
  var NotPrecedesSlantEqual = "⋠";
  var NotReverseElement = "∌";
  var NotRightTriangleBar = "⧐̸";
  var NotRightTriangle = "⋫";
  var NotRightTriangleEqual = "⋭";
  var NotSquareSubset = "⊏̸";
  var NotSquareSubsetEqual = "⋢";
  var NotSquareSuperset = "⊐̸";
  var NotSquareSupersetEqual = "⋣";
  var NotSubset = "⊂⃒";
  var NotSubsetEqual = "⊈";
  var NotSucceeds = "⊁";
  var NotSucceedsEqual = "⪰̸";
  var NotSucceedsSlantEqual = "⋡";
  var NotSucceedsTilde = "≿̸";
  var NotSuperset = "⊃⃒";
  var NotSupersetEqual = "⊉";
  var NotTilde = "≁";
  var NotTildeEqual = "≄";
  var NotTildeFullEqual = "≇";
  var NotTildeTilde = "≉";
  var NotVerticalBar = "∤";
  var nparallel = "∦";
  var npar = "∦";
  var nparsl = "⫽⃥";
  var npart = "∂̸";
  var npolint = "⨔";
  var npr = "⊀";
  var nprcue = "⋠";
  var nprec = "⊀";
  var npreceq = "⪯̸";
  var npre = "⪯̸";
  var nrarrc = "⤳̸";
  var nrarr = "↛";
  var nrArr = "⇏";
  var nrarrw = "↝̸";
  var nrightarrow = "↛";
  var nRightarrow = "⇏";
  var nrtri = "⋫";
  var nrtrie = "⋭";
  var nsc = "⊁";
  var nsccue = "⋡";
  var nsce = "⪰̸";
  var Nscr = "𝒩";
  var nscr = "𝓃";
  var nshortmid = "∤";
  var nshortparallel = "∦";
  var nsim = "≁";
  var nsime = "≄";
  var nsimeq = "≄";
  var nsmid = "∤";
  var nspar = "∦";
  var nsqsube = "⋢";
  var nsqsupe = "⋣";
  var nsub = "⊄";
  var nsubE = "⫅̸";
  var nsube = "⊈";
  var nsubset = "⊂⃒";
  var nsubseteq = "⊈";
  var nsubseteqq = "⫅̸";
  var nsucc = "⊁";
  var nsucceq = "⪰̸";
  var nsup = "⊅";
  var nsupE = "⫆̸";
  var nsupe = "⊉";
  var nsupset = "⊃⃒";
  var nsupseteq = "⊉";
  var nsupseteqq = "⫆̸";
  var ntgl = "≹";
  var Ntilde = "Ñ";
  var ntilde = "ñ";
  var ntlg = "≸";
  var ntriangleleft = "⋪";
  var ntrianglelefteq = "⋬";
  var ntriangleright = "⋫";
  var ntrianglerighteq = "⋭";
  var Nu = "Ν";
  var nu = "ν";
  var num = "#";
  var numero = "№";
  var numsp = " ";
  var nvap = "≍⃒";
  var nvdash = "⊬";
  var nvDash = "⊭";
  var nVdash = "⊮";
  var nVDash = "⊯";
  var nvge = "≥⃒";
  var nvgt = ">⃒";
  var nvHarr = "⤄";
  var nvinfin = "⧞";
  var nvlArr = "⤂";
  var nvle = "≤⃒";
  var nvlt = "<⃒";
  var nvltrie = "⊴⃒";
  var nvrArr = "⤃";
  var nvrtrie = "⊵⃒";
  var nvsim = "∼⃒";
  var nwarhk = "⤣";
  var nwarr = "↖";
  var nwArr = "⇖";
  var nwarrow = "↖";
  var nwnear = "⤧";
  var Oacute = "Ó";
  var oacute = "ó";
  var oast = "⊛";
  var Ocirc = "Ô";
  var ocirc = "ô";
  var ocir = "⊚";
  var Ocy = "О";
  var ocy = "о";
  var odash = "⊝";
  var Odblac = "Ő";
  var odblac = "ő";
  var odiv = "⨸";
  var odot = "⊙";
  var odsold = "⦼";
  var OElig = "Œ";
  var oelig = "œ";
  var ofcir = "⦿";
  var Ofr = "𝔒";
  var ofr = "𝔬";
  var ogon = "˛";
  var Ograve = "Ò";
  var ograve = "ò";
  var ogt = "⧁";
  var ohbar = "⦵";
  var ohm = "Ω";
  var oint = "∮";
  var olarr = "↺";
  var olcir = "⦾";
  var olcross = "⦻";
  var oline = "‾";
  var olt = "⧀";
  var Omacr = "Ō";
  var omacr = "ō";
  var Omega = "Ω";
  var omega = "ω";
  var Omicron = "Ο";
  var omicron = "ο";
  var omid = "⦶";
  var ominus = "⊖";
  var Oopf = "𝕆";
  var oopf = "𝕠";
  var opar = "⦷";
  var OpenCurlyDoubleQuote = "“";
  var OpenCurlyQuote = "‘";
  var operp = "⦹";
  var oplus = "⊕";
  var orarr = "↻";
  var Or = "⩔";
  var or = "∨";
  var ord = "⩝";
  var order = "ℴ";
  var orderof = "ℴ";
  var ordf = "ª";
  var ordm = "º";
  var origof = "⊶";
  var oror = "⩖";
  var orslope = "⩗";
  var orv = "⩛";
  var oS = "Ⓢ";
  var Oscr = "𝒪";
  var oscr = "ℴ";
  var Oslash = "Ø";
  var oslash = "ø";
  var osol = "⊘";
  var Otilde = "Õ";
  var otilde = "õ";
  var otimesas = "⨶";
  var Otimes = "⨷";
  var otimes = "⊗";
  var Ouml = "Ö";
  var ouml = "ö";
  var ovbar = "⌽";
  var OverBar = "‾";
  var OverBrace = "⏞";
  var OverBracket = "⎴";
  var OverParenthesis = "⏜";
  var para = "¶";
  var parallel = "∥";
  var par = "∥";
  var parsim = "⫳";
  var parsl = "⫽";
  var part = "∂";
  var PartialD = "∂";
  var Pcy = "П";
  var pcy = "п";
  var percnt = "%";
  var period = ".";
  var permil = "‰";
  var perp = "⊥";
  var pertenk = "‱";
  var Pfr = "𝔓";
  var pfr = "𝔭";
  var Phi = "Φ";
  var phi = "φ";
  var phiv = "ϕ";
  var phmmat = "ℳ";
  var phone = "☎";
  var Pi = "Π";
  var pi = "π";
  var pitchfork = "⋔";
  var piv = "ϖ";
  var planck = "ℏ";
  var planckh = "ℎ";
  var plankv = "ℏ";
  var plusacir = "⨣";
  var plusb = "⊞";
  var pluscir = "⨢";
  var plus = "+";
  var plusdo = "∔";
  var plusdu = "⨥";
  var pluse = "⩲";
  var PlusMinus = "±";
  var plusmn = "±";
  var plussim = "⨦";
  var plustwo = "⨧";
  var pm = "±";
  var Poincareplane = "ℌ";
  var pointint = "⨕";
  var popf = "𝕡";
  var Popf = "ℙ";
  var pound = "£";
  var prap = "⪷";
  var Pr = "⪻";
  var pr = "≺";
  var prcue = "≼";
  var precapprox = "⪷";
  var prec = "≺";
  var preccurlyeq = "≼";
  var Precedes = "≺";
  var PrecedesEqual = "⪯";
  var PrecedesSlantEqual = "≼";
  var PrecedesTilde = "≾";
  var preceq = "⪯";
  var precnapprox = "⪹";
  var precneqq = "⪵";
  var precnsim = "⋨";
  var pre = "⪯";
  var prE = "⪳";
  var precsim = "≾";
  var prime = "′";
  var Prime = "″";
  var primes = "ℙ";
  var prnap = "⪹";
  var prnE = "⪵";
  var prnsim = "⋨";
  var prod = "∏";
  var Product = "∏";
  var profalar = "⌮";
  var profline = "⌒";
  var profsurf = "⌓";
  var prop = "∝";
  var Proportional = "∝";
  var Proportion = "∷";
  var propto = "∝";
  var prsim = "≾";
  var prurel = "⊰";
  var Pscr = "𝒫";
  var pscr = "𝓅";
  var Psi = "Ψ";
  var psi = "ψ";
  var puncsp = " ";
  var Qfr = "𝔔";
  var qfr = "𝔮";
  var qint = "⨌";
  var qopf = "𝕢";
  var Qopf = "ℚ";
  var qprime = "⁗";
  var Qscr = "𝒬";
  var qscr = "𝓆";
  var quaternions = "ℍ";
  var quatint = "⨖";
  var quest = "?";
  var questeq = "≟";
  var quot = "\"";
  var QUOT = "\"";
  var rAarr = "⇛";
  var race = "∽̱";
  var Racute = "Ŕ";
  var racute = "ŕ";
  var radic = "√";
  var raemptyv = "⦳";
  var rang = "⟩";
  var Rang = "⟫";
  var rangd = "⦒";
  var range = "⦥";
  var rangle = "⟩";
  var raquo = "»";
  var rarrap = "⥵";
  var rarrb = "⇥";
  var rarrbfs = "⤠";
  var rarrc = "⤳";
  var rarr = "→";
  var Rarr = "↠";
  var rArr = "⇒";
  var rarrfs = "⤞";
  var rarrhk = "↪";
  var rarrlp = "↬";
  var rarrpl = "⥅";
  var rarrsim = "⥴";
  var Rarrtl = "⤖";
  var rarrtl = "↣";
  var rarrw = "↝";
  var ratail = "⤚";
  var rAtail = "⤜";
  var ratio = "∶";
  var rationals = "ℚ";
  var rbarr = "⤍";
  var rBarr = "⤏";
  var RBarr = "⤐";
  var rbbrk = "❳";
  var rbrace = "}";
  var rbrack = "]";
  var rbrke = "⦌";
  var rbrksld = "⦎";
  var rbrkslu = "⦐";
  var Rcaron = "Ř";
  var rcaron = "ř";
  var Rcedil = "Ŗ";
  var rcedil = "ŗ";
  var rceil = "⌉";
  var rcub = "}";
  var Rcy = "Р";
  var rcy = "р";
  var rdca = "⤷";
  var rdldhar = "⥩";
  var rdquo = "”";
  var rdquor = "”";
  var rdsh = "↳";
  var real = "ℜ";
  var realine = "ℛ";
  var realpart = "ℜ";
  var reals = "ℝ";
  var Re = "ℜ";
  var rect = "▭";
  var reg = "®";
  var REG = "®";
  var ReverseElement = "∋";
  var ReverseEquilibrium = "⇋";
  var ReverseUpEquilibrium = "⥯";
  var rfisht = "⥽";
  var rfloor = "⌋";
  var rfr = "𝔯";
  var Rfr = "ℜ";
  var rHar = "⥤";
  var rhard = "⇁";
  var rharu = "⇀";
  var rharul = "⥬";
  var Rho = "Ρ";
  var rho = "ρ";
  var rhov = "ϱ";
  var RightAngleBracket = "⟩";
  var RightArrowBar = "⇥";
  var rightarrow = "→";
  var RightArrow = "→";
  var Rightarrow = "⇒";
  var RightArrowLeftArrow = "⇄";
  var rightarrowtail = "↣";
  var RightCeiling = "⌉";
  var RightDoubleBracket = "⟧";
  var RightDownTeeVector = "⥝";
  var RightDownVectorBar = "⥕";
  var RightDownVector = "⇂";
  var RightFloor = "⌋";
  var rightharpoondown = "⇁";
  var rightharpoonup = "⇀";
  var rightleftarrows = "⇄";
  var rightleftharpoons = "⇌";
  var rightrightarrows = "⇉";
  var rightsquigarrow = "↝";
  var RightTeeArrow = "↦";
  var RightTee = "⊢";
  var RightTeeVector = "⥛";
  var rightthreetimes = "⋌";
  var RightTriangleBar = "⧐";
  var RightTriangle = "⊳";
  var RightTriangleEqual = "⊵";
  var RightUpDownVector = "⥏";
  var RightUpTeeVector = "⥜";
  var RightUpVectorBar = "⥔";
  var RightUpVector = "↾";
  var RightVectorBar = "⥓";
  var RightVector = "⇀";
  var ring = "˚";
  var risingdotseq = "≓";
  var rlarr = "⇄";
  var rlhar = "⇌";
  var rlm = "‏";
  var rmoustache = "⎱";
  var rmoust = "⎱";
  var rnmid = "⫮";
  var roang = "⟭";
  var roarr = "⇾";
  var robrk = "⟧";
  var ropar = "⦆";
  var ropf = "𝕣";
  var Ropf = "ℝ";
  var roplus = "⨮";
  var rotimes = "⨵";
  var RoundImplies = "⥰";
  var rpar = ")";
  var rpargt = "⦔";
  var rppolint = "⨒";
  var rrarr = "⇉";
  var Rrightarrow = "⇛";
  var rsaquo = "›";
  var rscr = "𝓇";
  var Rscr = "ℛ";
  var rsh = "↱";
  var Rsh = "↱";
  var rsqb = "]";
  var rsquo = "’";
  var rsquor = "’";
  var rthree = "⋌";
  var rtimes = "⋊";
  var rtri = "▹";
  var rtrie = "⊵";
  var rtrif = "▸";
  var rtriltri = "⧎";
  var RuleDelayed = "⧴";
  var ruluhar = "⥨";
  var rx = "℞";
  var Sacute = "Ś";
  var sacute = "ś";
  var sbquo = "‚";
  var scap = "⪸";
  var Scaron = "Š";
  var scaron = "š";
  var Sc = "⪼";
  var sc = "≻";
  var sccue = "≽";
  var sce = "⪰";
  var scE = "⪴";
  var Scedil = "Ş";
  var scedil = "ş";
  var Scirc = "Ŝ";
  var scirc = "ŝ";
  var scnap = "⪺";
  var scnE = "⪶";
  var scnsim = "⋩";
  var scpolint = "⨓";
  var scsim = "≿";
  var Scy = "С";
  var scy = "с";
  var sdotb = "⊡";
  var sdot = "⋅";
  var sdote = "⩦";
  var searhk = "⤥";
  var searr = "↘";
  var seArr = "⇘";
  var searrow = "↘";
  var sect = "§";
  var semi = ";";
  var seswar = "⤩";
  var setminus = "∖";
  var setmn = "∖";
  var sext = "✶";
  var Sfr = "𝔖";
  var sfr = "𝔰";
  var sfrown = "⌢";
  var sharp = "♯";
  var SHCHcy = "Щ";
  var shchcy = "щ";
  var SHcy = "Ш";
  var shcy = "ш";
  var ShortDownArrow = "↓";
  var ShortLeftArrow = "←";
  var shortmid = "∣";
  var shortparallel = "∥";
  var ShortRightArrow = "→";
  var ShortUpArrow = "↑";
  var shy = "­";
  var Sigma = "Σ";
  var sigma = "σ";
  var sigmaf = "ς";
  var sigmav = "ς";
  var sim = "∼";
  var simdot = "⩪";
  var sime = "≃";
  var simeq = "≃";
  var simg = "⪞";
  var simgE = "⪠";
  var siml = "⪝";
  var simlE = "⪟";
  var simne = "≆";
  var simplus = "⨤";
  var simrarr = "⥲";
  var slarr = "←";
  var SmallCircle = "∘";
  var smallsetminus = "∖";
  var smashp = "⨳";
  var smeparsl = "⧤";
  var smid = "∣";
  var smile = "⌣";
  var smt = "⪪";
  var smte = "⪬";
  var smtes = "⪬︀";
  var SOFTcy = "Ь";
  var softcy = "ь";
  var solbar = "⌿";
  var solb = "⧄";
  var sol = "/";
  var Sopf = "𝕊";
  var sopf = "𝕤";
  var spades = "♠";
  var spadesuit = "♠";
  var spar = "∥";
  var sqcap = "⊓";
  var sqcaps = "⊓︀";
  var sqcup = "⊔";
  var sqcups = "⊔︀";
  var Sqrt = "√";
  var sqsub = "⊏";
  var sqsube = "⊑";
  var sqsubset = "⊏";
  var sqsubseteq = "⊑";
  var sqsup = "⊐";
  var sqsupe = "⊒";
  var sqsupset = "⊐";
  var sqsupseteq = "⊒";
  var square = "□";
  var Square = "□";
  var SquareIntersection = "⊓";
  var SquareSubset = "⊏";
  var SquareSubsetEqual = "⊑";
  var SquareSuperset = "⊐";
  var SquareSupersetEqual = "⊒";
  var SquareUnion = "⊔";
  var squarf = "▪";
  var squ = "□";
  var squf = "▪";
  var srarr = "→";
  var Sscr = "𝒮";
  var sscr = "𝓈";
  var ssetmn = "∖";
  var ssmile = "⌣";
  var sstarf = "⋆";
  var Star = "⋆";
  var star = "☆";
  var starf = "★";
  var straightepsilon = "ϵ";
  var straightphi = "ϕ";
  var strns = "¯";
  var sub = "⊂";
  var Sub = "⋐";
  var subdot = "⪽";
  var subE = "⫅";
  var sube = "⊆";
  var subedot = "⫃";
  var submult = "⫁";
  var subnE = "⫋";
  var subne = "⊊";
  var subplus = "⪿";
  var subrarr = "⥹";
  var subset = "⊂";
  var Subset = "⋐";
  var subseteq = "⊆";
  var subseteqq = "⫅";
  var SubsetEqual = "⊆";
  var subsetneq = "⊊";
  var subsetneqq = "⫋";
  var subsim = "⫇";
  var subsub = "⫕";
  var subsup = "⫓";
  var succapprox = "⪸";
  var succ = "≻";
  var succcurlyeq = "≽";
  var Succeeds = "≻";
  var SucceedsEqual = "⪰";
  var SucceedsSlantEqual = "≽";
  var SucceedsTilde = "≿";
  var succeq = "⪰";
  var succnapprox = "⪺";
  var succneqq = "⪶";
  var succnsim = "⋩";
  var succsim = "≿";
  var SuchThat = "∋";
  var sum = "∑";
  var Sum = "∑";
  var sung = "♪";
  var sup1 = "¹";
  var sup2 = "²";
  var sup3 = "³";
  var sup = "⊃";
  var Sup = "⋑";
  var supdot = "⪾";
  var supdsub = "⫘";
  var supE = "⫆";
  var supe = "⊇";
  var supedot = "⫄";
  var Superset = "⊃";
  var SupersetEqual = "⊇";
  var suphsol = "⟉";
  var suphsub = "⫗";
  var suplarr = "⥻";
  var supmult = "⫂";
  var supnE = "⫌";
  var supne = "⊋";
  var supplus = "⫀";
  var supset = "⊃";
  var Supset = "⋑";
  var supseteq = "⊇";
  var supseteqq = "⫆";
  var supsetneq = "⊋";
  var supsetneqq = "⫌";
  var supsim = "⫈";
  var supsub = "⫔";
  var supsup = "⫖";
  var swarhk = "⤦";
  var swarr = "↙";
  var swArr = "⇙";
  var swarrow = "↙";
  var swnwar = "⤪";
  var szlig = "ß";
  var Tab = "\t";
  var target = "⌖";
  var Tau = "Τ";
  var tau = "τ";
  var tbrk = "⎴";
  var Tcaron = "Ť";
  var tcaron = "ť";
  var Tcedil = "Ţ";
  var tcedil = "ţ";
  var Tcy = "Т";
  var tcy = "т";
  var tdot = "⃛";
  var telrec = "⌕";
  var Tfr = "𝔗";
  var tfr = "𝔱";
  var there4 = "∴";
  var therefore = "∴";
  var Therefore = "∴";
  var Theta = "Θ";
  var theta = "θ";
  var thetasym = "ϑ";
  var thetav = "ϑ";
  var thickapprox = "≈";
  var thicksim = "∼";
  var ThickSpace = "  ";
  var ThinSpace = " ";
  var thinsp = " ";
  var thkap = "≈";
  var thksim = "∼";
  var THORN = "Þ";
  var thorn = "þ";
  var tilde = "˜";
  var Tilde = "∼";
  var TildeEqual = "≃";
  var TildeFullEqual = "≅";
  var TildeTilde = "≈";
  var timesbar = "⨱";
  var timesb = "⊠";
  var times = "×";
  var timesd = "⨰";
  var tint = "∭";
  var toea = "⤨";
  var topbot = "⌶";
  var topcir = "⫱";
  var top = "⊤";
  var Topf = "𝕋";
  var topf = "𝕥";
  var topfork = "⫚";
  var tosa = "⤩";
  var tprime = "‴";
  var trade = "™";
  var TRADE = "™";
  var triangle = "▵";
  var triangledown = "▿";
  var triangleleft = "◃";
  var trianglelefteq = "⊴";
  var triangleq = "≜";
  var triangleright = "▹";
  var trianglerighteq = "⊵";
  var tridot = "◬";
  var trie = "≜";
  var triminus = "⨺";
  var TripleDot = "⃛";
  var triplus = "⨹";
  var trisb = "⧍";
  var tritime = "⨻";
  var trpezium = "⏢";
  var Tscr = "𝒯";
  var tscr = "𝓉";
  var TScy = "Ц";
  var tscy = "ц";
  var TSHcy = "Ћ";
  var tshcy = "ћ";
  var Tstrok = "Ŧ";
  var tstrok = "ŧ";
  var twixt = "≬";
  var twoheadleftarrow = "↞";
  var twoheadrightarrow = "↠";
  var Uacute = "Ú";
  var uacute = "ú";
  var uarr = "↑";
  var Uarr = "↟";
  var uArr = "⇑";
  var Uarrocir = "⥉";
  var Ubrcy = "Ў";
  var ubrcy = "ў";
  var Ubreve = "Ŭ";
  var ubreve = "ŭ";
  var Ucirc = "Û";
  var ucirc = "û";
  var Ucy = "У";
  var ucy = "у";
  var udarr = "⇅";
  var Udblac = "Ű";
  var udblac = "ű";
  var udhar = "⥮";
  var ufisht = "⥾";
  var Ufr = "𝔘";
  var ufr = "𝔲";
  var Ugrave = "Ù";
  var ugrave = "ù";
  var uHar = "⥣";
  var uharl = "↿";
  var uharr = "↾";
  var uhblk = "▀";
  var ulcorn = "⌜";
  var ulcorner = "⌜";
  var ulcrop = "⌏";
  var ultri = "◸";
  var Umacr = "Ū";
  var umacr = "ū";
  var uml = "¨";
  var UnderBar = "_";
  var UnderBrace = "⏟";
  var UnderBracket = "⎵";
  var UnderParenthesis = "⏝";
  var Union = "⋃";
  var UnionPlus = "⊎";
  var Uogon = "Ų";
  var uogon = "ų";
  var Uopf = "𝕌";
  var uopf = "𝕦";
  var UpArrowBar = "⤒";
  var uparrow = "↑";
  var UpArrow = "↑";
  var Uparrow = "⇑";
  var UpArrowDownArrow = "⇅";
  var updownarrow = "↕";
  var UpDownArrow = "↕";
  var Updownarrow = "⇕";
  var UpEquilibrium = "⥮";
  var upharpoonleft = "↿";
  var upharpoonright = "↾";
  var uplus = "⊎";
  var UpperLeftArrow = "↖";
  var UpperRightArrow = "↗";
  var upsi = "υ";
  var Upsi = "ϒ";
  var upsih = "ϒ";
  var Upsilon = "Υ";
  var upsilon = "υ";
  var UpTeeArrow = "↥";
  var UpTee = "⊥";
  var upuparrows = "⇈";
  var urcorn = "⌝";
  var urcorner = "⌝";
  var urcrop = "⌎";
  var Uring = "Ů";
  var uring = "ů";
  var urtri = "◹";
  var Uscr = "𝒰";
  var uscr = "𝓊";
  var utdot = "⋰";
  var Utilde = "Ũ";
  var utilde = "ũ";
  var utri = "▵";
  var utrif = "▴";
  var uuarr = "⇈";
  var Uuml = "Ü";
  var uuml = "ü";
  var uwangle = "⦧";
  var vangrt = "⦜";
  var varepsilon = "ϵ";
  var varkappa = "ϰ";
  var varnothing = "∅";
  var varphi = "ϕ";
  var varpi = "ϖ";
  var varpropto = "∝";
  var varr = "↕";
  var vArr = "⇕";
  var varrho = "ϱ";
  var varsigma = "ς";
  var varsubsetneq = "⊊︀";
  var varsubsetneqq = "⫋︀";
  var varsupsetneq = "⊋︀";
  var varsupsetneqq = "⫌︀";
  var vartheta = "ϑ";
  var vartriangleleft = "⊲";
  var vartriangleright = "⊳";
  var vBar = "⫨";
  var Vbar = "⫫";
  var vBarv = "⫩";
  var Vcy = "В";
  var vcy = "в";
  var vdash = "⊢";
  var vDash = "⊨";
  var Vdash = "⊩";
  var VDash = "⊫";
  var Vdashl = "⫦";
  var veebar = "⊻";
  var vee = "∨";
  var Vee = "⋁";
  var veeeq = "≚";
  var vellip = "⋮";
  var verbar = "|";
  var Verbar = "‖";
  var vert = "|";
  var Vert = "‖";
  var VerticalBar = "∣";
  var VerticalLine = "|";
  var VerticalSeparator = "❘";
  var VerticalTilde = "≀";
  var VeryThinSpace = " ";
  var Vfr = "𝔙";
  var vfr = "𝔳";
  var vltri = "⊲";
  var vnsub = "⊂⃒";
  var vnsup = "⊃⃒";
  var Vopf = "𝕍";
  var vopf = "𝕧";
  var vprop = "∝";
  var vrtri = "⊳";
  var Vscr = "𝒱";
  var vscr = "𝓋";
  var vsubnE = "⫋︀";
  var vsubne = "⊊︀";
  var vsupnE = "⫌︀";
  var vsupne = "⊋︀";
  var Vvdash = "⊪";
  var vzigzag = "⦚";
  var Wcirc = "Ŵ";
  var wcirc = "ŵ";
  var wedbar = "⩟";
  var wedge = "∧";
  var Wedge = "⋀";
  var wedgeq = "≙";
  var weierp = "℘";
  var Wfr = "𝔚";
  var wfr = "𝔴";
  var Wopf = "𝕎";
  var wopf = "𝕨";
  var wp = "℘";
  var wr = "≀";
  var wreath = "≀";
  var Wscr = "𝒲";
  var wscr = "𝓌";
  var xcap = "⋂";
  var xcirc = "◯";
  var xcup = "⋃";
  var xdtri = "▽";
  var Xfr = "𝔛";
  var xfr = "𝔵";
  var xharr = "⟷";
  var xhArr = "⟺";
  var Xi = "Ξ";
  var xi = "ξ";
  var xlarr = "⟵";
  var xlArr = "⟸";
  var xmap = "⟼";
  var xnis = "⋻";
  var xodot = "⨀";
  var Xopf = "𝕏";
  var xopf = "𝕩";
  var xoplus = "⨁";
  var xotime = "⨂";
  var xrarr = "⟶";
  var xrArr = "⟹";
  var Xscr = "𝒳";
  var xscr = "𝓍";
  var xsqcup = "⨆";
  var xuplus = "⨄";
  var xutri = "△";
  var xvee = "⋁";
  var xwedge = "⋀";
  var Yacute = "Ý";
  var yacute = "ý";
  var YAcy = "Я";
  var yacy = "я";
  var Ycirc = "Ŷ";
  var ycirc = "ŷ";
  var Ycy = "Ы";
  var ycy = "ы";
  var yen = "¥";
  var Yfr = "𝔜";
  var yfr = "𝔶";
  var YIcy = "Ї";
  var yicy = "ї";
  var Yopf = "𝕐";
  var yopf = "𝕪";
  var Yscr = "𝒴";
  var yscr = "𝓎";
  var YUcy = "Ю";
  var yucy = "ю";
  var yuml = "ÿ";
  var Yuml = "Ÿ";
  var Zacute = "Ź";
  var zacute = "ź";
  var Zcaron = "Ž";
  var zcaron = "ž";
  var Zcy = "З";
  var zcy = "з";
  var Zdot = "Ż";
  var zdot = "ż";
  var zeetrf = "ℨ";
  var ZeroWidthSpace = "​";
  var Zeta = "Ζ";
  var zeta = "ζ";
  var zfr = "𝔷";
  var Zfr = "ℨ";
  var ZHcy = "Ж";
  var zhcy = "ж";
  var zigrarr = "⇝";
  var zopf = "𝕫";
  var Zopf = "ℤ";
  var Zscr = "𝒵";
  var zscr = "𝓏";
  var zwj = "‍";
  var zwnj = "‌";
  var entities = {
  	Aacute: Aacute,
  	aacute: aacute,
  	Abreve: Abreve,
  	abreve: abreve,
  	ac: ac,
  	acd: acd,
  	acE: acE,
  	Acirc: Acirc,
  	acirc: acirc,
  	acute: acute,
  	Acy: Acy,
  	acy: acy,
  	AElig: AElig,
  	aelig: aelig,
  	af: af,
  	Afr: Afr,
  	afr: afr,
  	Agrave: Agrave,
  	agrave: agrave,
  	alefsym: alefsym,
  	aleph: aleph,
  	Alpha: Alpha,
  	alpha: alpha,
  	Amacr: Amacr,
  	amacr: amacr,
  	amalg: amalg,
  	amp: amp,
  	AMP: AMP,
  	andand: andand,
  	And: And,
  	and: and,
  	andd: andd,
  	andslope: andslope,
  	andv: andv,
  	ang: ang,
  	ange: ange,
  	angle: angle,
  	angmsdaa: angmsdaa,
  	angmsdab: angmsdab,
  	angmsdac: angmsdac,
  	angmsdad: angmsdad,
  	angmsdae: angmsdae,
  	angmsdaf: angmsdaf,
  	angmsdag: angmsdag,
  	angmsdah: angmsdah,
  	angmsd: angmsd,
  	angrt: angrt,
  	angrtvb: angrtvb,
  	angrtvbd: angrtvbd,
  	angsph: angsph,
  	angst: angst,
  	angzarr: angzarr,
  	Aogon: Aogon,
  	aogon: aogon,
  	Aopf: Aopf,
  	aopf: aopf,
  	apacir: apacir,
  	ap: ap,
  	apE: apE,
  	ape: ape,
  	apid: apid,
  	apos: apos,
  	ApplyFunction: ApplyFunction,
  	approx: approx,
  	approxeq: approxeq,
  	Aring: Aring,
  	aring: aring,
  	Ascr: Ascr,
  	ascr: ascr,
  	Assign: Assign,
  	ast: ast,
  	asymp: asymp,
  	asympeq: asympeq,
  	Atilde: Atilde,
  	atilde: atilde,
  	Auml: Auml,
  	auml: auml,
  	awconint: awconint,
  	awint: awint,
  	backcong: backcong,
  	backepsilon: backepsilon,
  	backprime: backprime,
  	backsim: backsim,
  	backsimeq: backsimeq,
  	Backslash: Backslash,
  	Barv: Barv,
  	barvee: barvee,
  	barwed: barwed,
  	Barwed: Barwed,
  	barwedge: barwedge,
  	bbrk: bbrk,
  	bbrktbrk: bbrktbrk,
  	bcong: bcong,
  	Bcy: Bcy,
  	bcy: bcy,
  	bdquo: bdquo,
  	becaus: becaus,
  	because: because,
  	Because: Because,
  	bemptyv: bemptyv,
  	bepsi: bepsi,
  	bernou: bernou,
  	Bernoullis: Bernoullis,
  	Beta: Beta,
  	beta: beta,
  	beth: beth,
  	between: between,
  	Bfr: Bfr,
  	bfr: bfr,
  	bigcap: bigcap,
  	bigcirc: bigcirc,
  	bigcup: bigcup,
  	bigodot: bigodot,
  	bigoplus: bigoplus,
  	bigotimes: bigotimes,
  	bigsqcup: bigsqcup,
  	bigstar: bigstar,
  	bigtriangledown: bigtriangledown,
  	bigtriangleup: bigtriangleup,
  	biguplus: biguplus,
  	bigvee: bigvee,
  	bigwedge: bigwedge,
  	bkarow: bkarow,
  	blacklozenge: blacklozenge,
  	blacksquare: blacksquare,
  	blacktriangle: blacktriangle,
  	blacktriangledown: blacktriangledown,
  	blacktriangleleft: blacktriangleleft,
  	blacktriangleright: blacktriangleright,
  	blank: blank,
  	blk12: blk12,
  	blk14: blk14,
  	blk34: blk34,
  	block: block,
  	bne: bne,
  	bnequiv: bnequiv,
  	bNot: bNot,
  	bnot: bnot,
  	Bopf: Bopf,
  	bopf: bopf,
  	bot: bot,
  	bottom: bottom,
  	bowtie: bowtie,
  	boxbox: boxbox,
  	boxdl: boxdl,
  	boxdL: boxdL,
  	boxDl: boxDl,
  	boxDL: boxDL,
  	boxdr: boxdr,
  	boxdR: boxdR,
  	boxDr: boxDr,
  	boxDR: boxDR,
  	boxh: boxh,
  	boxH: boxH,
  	boxhd: boxhd,
  	boxHd: boxHd,
  	boxhD: boxhD,
  	boxHD: boxHD,
  	boxhu: boxhu,
  	boxHu: boxHu,
  	boxhU: boxhU,
  	boxHU: boxHU,
  	boxminus: boxminus,
  	boxplus: boxplus,
  	boxtimes: boxtimes,
  	boxul: boxul,
  	boxuL: boxuL,
  	boxUl: boxUl,
  	boxUL: boxUL,
  	boxur: boxur,
  	boxuR: boxuR,
  	boxUr: boxUr,
  	boxUR: boxUR,
  	boxv: boxv,
  	boxV: boxV,
  	boxvh: boxvh,
  	boxvH: boxvH,
  	boxVh: boxVh,
  	boxVH: boxVH,
  	boxvl: boxvl,
  	boxvL: boxvL,
  	boxVl: boxVl,
  	boxVL: boxVL,
  	boxvr: boxvr,
  	boxvR: boxvR,
  	boxVr: boxVr,
  	boxVR: boxVR,
  	bprime: bprime,
  	breve: breve,
  	Breve: Breve,
  	brvbar: brvbar,
  	bscr: bscr,
  	Bscr: Bscr,
  	bsemi: bsemi,
  	bsim: bsim,
  	bsime: bsime,
  	bsolb: bsolb,
  	bsol: bsol,
  	bsolhsub: bsolhsub,
  	bull: bull,
  	bullet: bullet,
  	bump: bump,
  	bumpE: bumpE,
  	bumpe: bumpe,
  	Bumpeq: Bumpeq,
  	bumpeq: bumpeq,
  	Cacute: Cacute,
  	cacute: cacute,
  	capand: capand,
  	capbrcup: capbrcup,
  	capcap: capcap,
  	cap: cap,
  	Cap: Cap,
  	capcup: capcup,
  	capdot: capdot,
  	CapitalDifferentialD: CapitalDifferentialD,
  	caps: caps,
  	caret: caret,
  	caron: caron,
  	Cayleys: Cayleys,
  	ccaps: ccaps,
  	Ccaron: Ccaron,
  	ccaron: ccaron,
  	Ccedil: Ccedil,
  	ccedil: ccedil,
  	Ccirc: Ccirc,
  	ccirc: ccirc,
  	Cconint: Cconint,
  	ccups: ccups,
  	ccupssm: ccupssm,
  	Cdot: Cdot,
  	cdot: cdot,
  	cedil: cedil,
  	Cedilla: Cedilla,
  	cemptyv: cemptyv,
  	cent: cent,
  	centerdot: centerdot,
  	CenterDot: CenterDot,
  	cfr: cfr,
  	Cfr: Cfr,
  	CHcy: CHcy,
  	chcy: chcy,
  	check: check,
  	checkmark: checkmark,
  	Chi: Chi,
  	chi: chi,
  	circ: circ,
  	circeq: circeq,
  	circlearrowleft: circlearrowleft,
  	circlearrowright: circlearrowright,
  	circledast: circledast,
  	circledcirc: circledcirc,
  	circleddash: circleddash,
  	CircleDot: CircleDot,
  	circledR: circledR,
  	circledS: circledS,
  	CircleMinus: CircleMinus,
  	CirclePlus: CirclePlus,
  	CircleTimes: CircleTimes,
  	cir: cir,
  	cirE: cirE,
  	cire: cire,
  	cirfnint: cirfnint,
  	cirmid: cirmid,
  	cirscir: cirscir,
  	ClockwiseContourIntegral: ClockwiseContourIntegral,
  	CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
  	CloseCurlyQuote: CloseCurlyQuote,
  	clubs: clubs,
  	clubsuit: clubsuit,
  	colon: colon,
  	Colon: Colon,
  	Colone: Colone,
  	colone: colone,
  	coloneq: coloneq,
  	comma: comma,
  	commat: commat,
  	comp: comp,
  	compfn: compfn,
  	complement: complement,
  	complexes: complexes,
  	cong: cong,
  	congdot: congdot,
  	Congruent: Congruent,
  	conint: conint,
  	Conint: Conint,
  	ContourIntegral: ContourIntegral,
  	copf: copf,
  	Copf: Copf,
  	coprod: coprod,
  	Coproduct: Coproduct,
  	copy: copy,
  	COPY: COPY,
  	copysr: copysr,
  	CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
  	crarr: crarr,
  	cross: cross,
  	Cross: Cross,
  	Cscr: Cscr,
  	cscr: cscr,
  	csub: csub,
  	csube: csube,
  	csup: csup,
  	csupe: csupe,
  	ctdot: ctdot,
  	cudarrl: cudarrl,
  	cudarrr: cudarrr,
  	cuepr: cuepr,
  	cuesc: cuesc,
  	cularr: cularr,
  	cularrp: cularrp,
  	cupbrcap: cupbrcap,
  	cupcap: cupcap,
  	CupCap: CupCap,
  	cup: cup,
  	Cup: Cup,
  	cupcup: cupcup,
  	cupdot: cupdot,
  	cupor: cupor,
  	cups: cups,
  	curarr: curarr,
  	curarrm: curarrm,
  	curlyeqprec: curlyeqprec,
  	curlyeqsucc: curlyeqsucc,
  	curlyvee: curlyvee,
  	curlywedge: curlywedge,
  	curren: curren,
  	curvearrowleft: curvearrowleft,
  	curvearrowright: curvearrowright,
  	cuvee: cuvee,
  	cuwed: cuwed,
  	cwconint: cwconint,
  	cwint: cwint,
  	cylcty: cylcty,
  	dagger: dagger,
  	Dagger: Dagger,
  	daleth: daleth,
  	darr: darr,
  	Darr: Darr,
  	dArr: dArr,
  	dash: dash,
  	Dashv: Dashv,
  	dashv: dashv,
  	dbkarow: dbkarow,
  	dblac: dblac,
  	Dcaron: Dcaron,
  	dcaron: dcaron,
  	Dcy: Dcy,
  	dcy: dcy,
  	ddagger: ddagger,
  	ddarr: ddarr,
  	DD: DD,
  	dd: dd,
  	DDotrahd: DDotrahd,
  	ddotseq: ddotseq,
  	deg: deg,
  	Del: Del,
  	Delta: Delta,
  	delta: delta,
  	demptyv: demptyv,
  	dfisht: dfisht,
  	Dfr: Dfr,
  	dfr: dfr,
  	dHar: dHar,
  	dharl: dharl,
  	dharr: dharr,
  	DiacriticalAcute: DiacriticalAcute,
  	DiacriticalDot: DiacriticalDot,
  	DiacriticalDoubleAcute: DiacriticalDoubleAcute,
  	DiacriticalGrave: DiacriticalGrave,
  	DiacriticalTilde: DiacriticalTilde,
  	diam: diam,
  	diamond: diamond,
  	Diamond: Diamond,
  	diamondsuit: diamondsuit,
  	diams: diams,
  	die: die,
  	DifferentialD: DifferentialD,
  	digamma: digamma,
  	disin: disin,
  	div: div,
  	divide: divide,
  	divideontimes: divideontimes,
  	divonx: divonx,
  	DJcy: DJcy,
  	djcy: djcy,
  	dlcorn: dlcorn,
  	dlcrop: dlcrop,
  	dollar: dollar,
  	Dopf: Dopf,
  	dopf: dopf,
  	Dot: Dot,
  	dot: dot,
  	DotDot: DotDot,
  	doteq: doteq,
  	doteqdot: doteqdot,
  	DotEqual: DotEqual,
  	dotminus: dotminus,
  	dotplus: dotplus,
  	dotsquare: dotsquare,
  	doublebarwedge: doublebarwedge,
  	DoubleContourIntegral: DoubleContourIntegral,
  	DoubleDot: DoubleDot,
  	DoubleDownArrow: DoubleDownArrow,
  	DoubleLeftArrow: DoubleLeftArrow,
  	DoubleLeftRightArrow: DoubleLeftRightArrow,
  	DoubleLeftTee: DoubleLeftTee,
  	DoubleLongLeftArrow: DoubleLongLeftArrow,
  	DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
  	DoubleLongRightArrow: DoubleLongRightArrow,
  	DoubleRightArrow: DoubleRightArrow,
  	DoubleRightTee: DoubleRightTee,
  	DoubleUpArrow: DoubleUpArrow,
  	DoubleUpDownArrow: DoubleUpDownArrow,
  	DoubleVerticalBar: DoubleVerticalBar,
  	DownArrowBar: DownArrowBar,
  	downarrow: downarrow,
  	DownArrow: DownArrow,
  	Downarrow: Downarrow,
  	DownArrowUpArrow: DownArrowUpArrow,
  	DownBreve: DownBreve,
  	downdownarrows: downdownarrows,
  	downharpoonleft: downharpoonleft,
  	downharpoonright: downharpoonright,
  	DownLeftRightVector: DownLeftRightVector,
  	DownLeftTeeVector: DownLeftTeeVector,
  	DownLeftVectorBar: DownLeftVectorBar,
  	DownLeftVector: DownLeftVector,
  	DownRightTeeVector: DownRightTeeVector,
  	DownRightVectorBar: DownRightVectorBar,
  	DownRightVector: DownRightVector,
  	DownTeeArrow: DownTeeArrow,
  	DownTee: DownTee,
  	drbkarow: drbkarow,
  	drcorn: drcorn,
  	drcrop: drcrop,
  	Dscr: Dscr,
  	dscr: dscr,
  	DScy: DScy,
  	dscy: dscy,
  	dsol: dsol,
  	Dstrok: Dstrok,
  	dstrok: dstrok,
  	dtdot: dtdot,
  	dtri: dtri,
  	dtrif: dtrif,
  	duarr: duarr,
  	duhar: duhar,
  	dwangle: dwangle,
  	DZcy: DZcy,
  	dzcy: dzcy,
  	dzigrarr: dzigrarr,
  	Eacute: Eacute,
  	eacute: eacute,
  	easter: easter,
  	Ecaron: Ecaron,
  	ecaron: ecaron,
  	Ecirc: Ecirc,
  	ecirc: ecirc,
  	ecir: ecir,
  	ecolon: ecolon,
  	Ecy: Ecy,
  	ecy: ecy,
  	eDDot: eDDot,
  	Edot: Edot,
  	edot: edot,
  	eDot: eDot,
  	ee: ee,
  	efDot: efDot,
  	Efr: Efr,
  	efr: efr,
  	eg: eg,
  	Egrave: Egrave,
  	egrave: egrave,
  	egs: egs,
  	egsdot: egsdot,
  	el: el,
  	Element: Element,
  	elinters: elinters,
  	ell: ell,
  	els: els,
  	elsdot: elsdot,
  	Emacr: Emacr,
  	emacr: emacr,
  	empty: empty,
  	emptyset: emptyset,
  	EmptySmallSquare: EmptySmallSquare,
  	emptyv: emptyv,
  	EmptyVerySmallSquare: EmptyVerySmallSquare,
  	emsp13: emsp13,
  	emsp14: emsp14,
  	emsp: emsp,
  	ENG: ENG,
  	eng: eng,
  	ensp: ensp,
  	Eogon: Eogon,
  	eogon: eogon,
  	Eopf: Eopf,
  	eopf: eopf,
  	epar: epar,
  	eparsl: eparsl,
  	eplus: eplus,
  	epsi: epsi,
  	Epsilon: Epsilon,
  	epsilon: epsilon,
  	epsiv: epsiv,
  	eqcirc: eqcirc,
  	eqcolon: eqcolon,
  	eqsim: eqsim,
  	eqslantgtr: eqslantgtr,
  	eqslantless: eqslantless,
  	Equal: Equal,
  	equals: equals,
  	EqualTilde: EqualTilde,
  	equest: equest,
  	Equilibrium: Equilibrium,
  	equiv: equiv,
  	equivDD: equivDD,
  	eqvparsl: eqvparsl,
  	erarr: erarr,
  	erDot: erDot,
  	escr: escr,
  	Escr: Escr,
  	esdot: esdot,
  	Esim: Esim,
  	esim: esim,
  	Eta: Eta,
  	eta: eta,
  	ETH: ETH,
  	eth: eth,
  	Euml: Euml,
  	euml: euml,
  	euro: euro,
  	excl: excl,
  	exist: exist,
  	Exists: Exists,
  	expectation: expectation,
  	exponentiale: exponentiale,
  	ExponentialE: ExponentialE,
  	fallingdotseq: fallingdotseq,
  	Fcy: Fcy,
  	fcy: fcy,
  	female: female,
  	ffilig: ffilig,
  	fflig: fflig,
  	ffllig: ffllig,
  	Ffr: Ffr,
  	ffr: ffr,
  	filig: filig,
  	FilledSmallSquare: FilledSmallSquare,
  	FilledVerySmallSquare: FilledVerySmallSquare,
  	fjlig: fjlig,
  	flat: flat,
  	fllig: fllig,
  	fltns: fltns,
  	fnof: fnof,
  	Fopf: Fopf,
  	fopf: fopf,
  	forall: forall,
  	ForAll: ForAll,
  	fork: fork,
  	forkv: forkv,
  	Fouriertrf: Fouriertrf,
  	fpartint: fpartint,
  	frac12: frac12,
  	frac13: frac13,
  	frac14: frac14,
  	frac15: frac15,
  	frac16: frac16,
  	frac18: frac18,
  	frac23: frac23,
  	frac25: frac25,
  	frac34: frac34,
  	frac35: frac35,
  	frac38: frac38,
  	frac45: frac45,
  	frac56: frac56,
  	frac58: frac58,
  	frac78: frac78,
  	frasl: frasl,
  	frown: frown,
  	fscr: fscr,
  	Fscr: Fscr,
  	gacute: gacute,
  	Gamma: Gamma,
  	gamma: gamma,
  	Gammad: Gammad,
  	gammad: gammad,
  	gap: gap,
  	Gbreve: Gbreve,
  	gbreve: gbreve,
  	Gcedil: Gcedil,
  	Gcirc: Gcirc,
  	gcirc: gcirc,
  	Gcy: Gcy,
  	gcy: gcy,
  	Gdot: Gdot,
  	gdot: gdot,
  	ge: ge,
  	gE: gE,
  	gEl: gEl,
  	gel: gel,
  	geq: geq,
  	geqq: geqq,
  	geqslant: geqslant,
  	gescc: gescc,
  	ges: ges,
  	gesdot: gesdot,
  	gesdoto: gesdoto,
  	gesdotol: gesdotol,
  	gesl: gesl,
  	gesles: gesles,
  	Gfr: Gfr,
  	gfr: gfr,
  	gg: gg,
  	Gg: Gg,
  	ggg: ggg,
  	gimel: gimel,
  	GJcy: GJcy,
  	gjcy: gjcy,
  	gla: gla,
  	gl: gl,
  	glE: glE,
  	glj: glj,
  	gnap: gnap,
  	gnapprox: gnapprox,
  	gne: gne,
  	gnE: gnE,
  	gneq: gneq,
  	gneqq: gneqq,
  	gnsim: gnsim,
  	Gopf: Gopf,
  	gopf: gopf,
  	grave: grave,
  	GreaterEqual: GreaterEqual,
  	GreaterEqualLess: GreaterEqualLess,
  	GreaterFullEqual: GreaterFullEqual,
  	GreaterGreater: GreaterGreater,
  	GreaterLess: GreaterLess,
  	GreaterSlantEqual: GreaterSlantEqual,
  	GreaterTilde: GreaterTilde,
  	Gscr: Gscr,
  	gscr: gscr,
  	gsim: gsim,
  	gsime: gsime,
  	gsiml: gsiml,
  	gtcc: gtcc,
  	gtcir: gtcir,
  	gt: gt,
  	GT: GT,
  	Gt: Gt,
  	gtdot: gtdot,
  	gtlPar: gtlPar,
  	gtquest: gtquest,
  	gtrapprox: gtrapprox,
  	gtrarr: gtrarr,
  	gtrdot: gtrdot,
  	gtreqless: gtreqless,
  	gtreqqless: gtreqqless,
  	gtrless: gtrless,
  	gtrsim: gtrsim,
  	gvertneqq: gvertneqq,
  	gvnE: gvnE,
  	Hacek: Hacek,
  	hairsp: hairsp,
  	half: half,
  	hamilt: hamilt,
  	HARDcy: HARDcy,
  	hardcy: hardcy,
  	harrcir: harrcir,
  	harr: harr,
  	hArr: hArr,
  	harrw: harrw,
  	Hat: Hat,
  	hbar: hbar,
  	Hcirc: Hcirc,
  	hcirc: hcirc,
  	hearts: hearts,
  	heartsuit: heartsuit,
  	hellip: hellip,
  	hercon: hercon,
  	hfr: hfr,
  	Hfr: Hfr,
  	HilbertSpace: HilbertSpace,
  	hksearow: hksearow,
  	hkswarow: hkswarow,
  	hoarr: hoarr,
  	homtht: homtht,
  	hookleftarrow: hookleftarrow,
  	hookrightarrow: hookrightarrow,
  	hopf: hopf,
  	Hopf: Hopf,
  	horbar: horbar,
  	HorizontalLine: HorizontalLine,
  	hscr: hscr,
  	Hscr: Hscr,
  	hslash: hslash,
  	Hstrok: Hstrok,
  	hstrok: hstrok,
  	HumpDownHump: HumpDownHump,
  	HumpEqual: HumpEqual,
  	hybull: hybull,
  	hyphen: hyphen,
  	Iacute: Iacute,
  	iacute: iacute,
  	ic: ic,
  	Icirc: Icirc,
  	icirc: icirc,
  	Icy: Icy,
  	icy: icy,
  	Idot: Idot,
  	IEcy: IEcy,
  	iecy: iecy,
  	iexcl: iexcl,
  	iff: iff,
  	ifr: ifr,
  	Ifr: Ifr,
  	Igrave: Igrave,
  	igrave: igrave,
  	ii: ii,
  	iiiint: iiiint,
  	iiint: iiint,
  	iinfin: iinfin,
  	iiota: iiota,
  	IJlig: IJlig,
  	ijlig: ijlig,
  	Imacr: Imacr,
  	imacr: imacr,
  	image: image,
  	ImaginaryI: ImaginaryI,
  	imagline: imagline,
  	imagpart: imagpart,
  	imath: imath,
  	Im: Im,
  	imof: imof,
  	imped: imped,
  	Implies: Implies,
  	incare: incare,
  	"in": "∈",
  	infin: infin,
  	infintie: infintie,
  	inodot: inodot,
  	intcal: intcal,
  	int: int,
  	Int: Int,
  	integers: integers,
  	Integral: Integral,
  	intercal: intercal,
  	Intersection: Intersection,
  	intlarhk: intlarhk,
  	intprod: intprod,
  	InvisibleComma: InvisibleComma,
  	InvisibleTimes: InvisibleTimes,
  	IOcy: IOcy,
  	iocy: iocy,
  	Iogon: Iogon,
  	iogon: iogon,
  	Iopf: Iopf,
  	iopf: iopf,
  	Iota: Iota,
  	iota: iota,
  	iprod: iprod,
  	iquest: iquest,
  	iscr: iscr,
  	Iscr: Iscr,
  	isin: isin,
  	isindot: isindot,
  	isinE: isinE,
  	isins: isins,
  	isinsv: isinsv,
  	isinv: isinv,
  	it: it,
  	Itilde: Itilde,
  	itilde: itilde,
  	Iukcy: Iukcy,
  	iukcy: iukcy,
  	Iuml: Iuml,
  	iuml: iuml,
  	Jcirc: Jcirc,
  	jcirc: jcirc,
  	Jcy: Jcy,
  	jcy: jcy,
  	Jfr: Jfr,
  	jfr: jfr,
  	jmath: jmath,
  	Jopf: Jopf,
  	jopf: jopf,
  	Jscr: Jscr,
  	jscr: jscr,
  	Jsercy: Jsercy,
  	jsercy: jsercy,
  	Jukcy: Jukcy,
  	jukcy: jukcy,
  	Kappa: Kappa,
  	kappa: kappa,
  	kappav: kappav,
  	Kcedil: Kcedil,
  	kcedil: kcedil,
  	Kcy: Kcy,
  	kcy: kcy,
  	Kfr: Kfr,
  	kfr: kfr,
  	kgreen: kgreen,
  	KHcy: KHcy,
  	khcy: khcy,
  	KJcy: KJcy,
  	kjcy: kjcy,
  	Kopf: Kopf,
  	kopf: kopf,
  	Kscr: Kscr,
  	kscr: kscr,
  	lAarr: lAarr,
  	Lacute: Lacute,
  	lacute: lacute,
  	laemptyv: laemptyv,
  	lagran: lagran,
  	Lambda: Lambda,
  	lambda: lambda,
  	lang: lang,
  	Lang: Lang,
  	langd: langd,
  	langle: langle,
  	lap: lap,
  	Laplacetrf: Laplacetrf,
  	laquo: laquo,
  	larrb: larrb,
  	larrbfs: larrbfs,
  	larr: larr,
  	Larr: Larr,
  	lArr: lArr,
  	larrfs: larrfs,
  	larrhk: larrhk,
  	larrlp: larrlp,
  	larrpl: larrpl,
  	larrsim: larrsim,
  	larrtl: larrtl,
  	latail: latail,
  	lAtail: lAtail,
  	lat: lat,
  	late: late,
  	lates: lates,
  	lbarr: lbarr,
  	lBarr: lBarr,
  	lbbrk: lbbrk,
  	lbrace: lbrace,
  	lbrack: lbrack,
  	lbrke: lbrke,
  	lbrksld: lbrksld,
  	lbrkslu: lbrkslu,
  	Lcaron: Lcaron,
  	lcaron: lcaron,
  	Lcedil: Lcedil,
  	lcedil: lcedil,
  	lceil: lceil,
  	lcub: lcub,
  	Lcy: Lcy,
  	lcy: lcy,
  	ldca: ldca,
  	ldquo: ldquo,
  	ldquor: ldquor,
  	ldrdhar: ldrdhar,
  	ldrushar: ldrushar,
  	ldsh: ldsh,
  	le: le,
  	lE: lE,
  	LeftAngleBracket: LeftAngleBracket,
  	LeftArrowBar: LeftArrowBar,
  	leftarrow: leftarrow,
  	LeftArrow: LeftArrow,
  	Leftarrow: Leftarrow,
  	LeftArrowRightArrow: LeftArrowRightArrow,
  	leftarrowtail: leftarrowtail,
  	LeftCeiling: LeftCeiling,
  	LeftDoubleBracket: LeftDoubleBracket,
  	LeftDownTeeVector: LeftDownTeeVector,
  	LeftDownVectorBar: LeftDownVectorBar,
  	LeftDownVector: LeftDownVector,
  	LeftFloor: LeftFloor,
  	leftharpoondown: leftharpoondown,
  	leftharpoonup: leftharpoonup,
  	leftleftarrows: leftleftarrows,
  	leftrightarrow: leftrightarrow,
  	LeftRightArrow: LeftRightArrow,
  	Leftrightarrow: Leftrightarrow,
  	leftrightarrows: leftrightarrows,
  	leftrightharpoons: leftrightharpoons,
  	leftrightsquigarrow: leftrightsquigarrow,
  	LeftRightVector: LeftRightVector,
  	LeftTeeArrow: LeftTeeArrow,
  	LeftTee: LeftTee,
  	LeftTeeVector: LeftTeeVector,
  	leftthreetimes: leftthreetimes,
  	LeftTriangleBar: LeftTriangleBar,
  	LeftTriangle: LeftTriangle,
  	LeftTriangleEqual: LeftTriangleEqual,
  	LeftUpDownVector: LeftUpDownVector,
  	LeftUpTeeVector: LeftUpTeeVector,
  	LeftUpVectorBar: LeftUpVectorBar,
  	LeftUpVector: LeftUpVector,
  	LeftVectorBar: LeftVectorBar,
  	LeftVector: LeftVector,
  	lEg: lEg,
  	leg: leg,
  	leq: leq,
  	leqq: leqq,
  	leqslant: leqslant,
  	lescc: lescc,
  	les: les,
  	lesdot: lesdot,
  	lesdoto: lesdoto,
  	lesdotor: lesdotor,
  	lesg: lesg,
  	lesges: lesges,
  	lessapprox: lessapprox,
  	lessdot: lessdot,
  	lesseqgtr: lesseqgtr,
  	lesseqqgtr: lesseqqgtr,
  	LessEqualGreater: LessEqualGreater,
  	LessFullEqual: LessFullEqual,
  	LessGreater: LessGreater,
  	lessgtr: lessgtr,
  	LessLess: LessLess,
  	lesssim: lesssim,
  	LessSlantEqual: LessSlantEqual,
  	LessTilde: LessTilde,
  	lfisht: lfisht,
  	lfloor: lfloor,
  	Lfr: Lfr,
  	lfr: lfr,
  	lg: lg,
  	lgE: lgE,
  	lHar: lHar,
  	lhard: lhard,
  	lharu: lharu,
  	lharul: lharul,
  	lhblk: lhblk,
  	LJcy: LJcy,
  	ljcy: ljcy,
  	llarr: llarr,
  	ll: ll,
  	Ll: Ll,
  	llcorner: llcorner,
  	Lleftarrow: Lleftarrow,
  	llhard: llhard,
  	lltri: lltri,
  	Lmidot: Lmidot,
  	lmidot: lmidot,
  	lmoustache: lmoustache,
  	lmoust: lmoust,
  	lnap: lnap,
  	lnapprox: lnapprox,
  	lne: lne,
  	lnE: lnE,
  	lneq: lneq,
  	lneqq: lneqq,
  	lnsim: lnsim,
  	loang: loang,
  	loarr: loarr,
  	lobrk: lobrk,
  	longleftarrow: longleftarrow,
  	LongLeftArrow: LongLeftArrow,
  	Longleftarrow: Longleftarrow,
  	longleftrightarrow: longleftrightarrow,
  	LongLeftRightArrow: LongLeftRightArrow,
  	Longleftrightarrow: Longleftrightarrow,
  	longmapsto: longmapsto,
  	longrightarrow: longrightarrow,
  	LongRightArrow: LongRightArrow,
  	Longrightarrow: Longrightarrow,
  	looparrowleft: looparrowleft,
  	looparrowright: looparrowright,
  	lopar: lopar,
  	Lopf: Lopf,
  	lopf: lopf,
  	loplus: loplus,
  	lotimes: lotimes,
  	lowast: lowast,
  	lowbar: lowbar,
  	LowerLeftArrow: LowerLeftArrow,
  	LowerRightArrow: LowerRightArrow,
  	loz: loz,
  	lozenge: lozenge,
  	lozf: lozf,
  	lpar: lpar,
  	lparlt: lparlt,
  	lrarr: lrarr,
  	lrcorner: lrcorner,
  	lrhar: lrhar,
  	lrhard: lrhard,
  	lrm: lrm,
  	lrtri: lrtri,
  	lsaquo: lsaquo,
  	lscr: lscr,
  	Lscr: Lscr,
  	lsh: lsh,
  	Lsh: Lsh,
  	lsim: lsim,
  	lsime: lsime,
  	lsimg: lsimg,
  	lsqb: lsqb,
  	lsquo: lsquo,
  	lsquor: lsquor,
  	Lstrok: Lstrok,
  	lstrok: lstrok,
  	ltcc: ltcc,
  	ltcir: ltcir,
  	lt: lt,
  	LT: LT,
  	Lt: Lt,
  	ltdot: ltdot,
  	lthree: lthree,
  	ltimes: ltimes,
  	ltlarr: ltlarr,
  	ltquest: ltquest,
  	ltri: ltri,
  	ltrie: ltrie,
  	ltrif: ltrif,
  	ltrPar: ltrPar,
  	lurdshar: lurdshar,
  	luruhar: luruhar,
  	lvertneqq: lvertneqq,
  	lvnE: lvnE,
  	macr: macr,
  	male: male,
  	malt: malt,
  	maltese: maltese,
  	"Map": "⤅",
  	map: map,
  	mapsto: mapsto,
  	mapstodown: mapstodown,
  	mapstoleft: mapstoleft,
  	mapstoup: mapstoup,
  	marker: marker,
  	mcomma: mcomma,
  	Mcy: Mcy,
  	mcy: mcy,
  	mdash: mdash,
  	mDDot: mDDot,
  	measuredangle: measuredangle,
  	MediumSpace: MediumSpace,
  	Mellintrf: Mellintrf,
  	Mfr: Mfr,
  	mfr: mfr,
  	mho: mho,
  	micro: micro,
  	midast: midast,
  	midcir: midcir,
  	mid: mid,
  	middot: middot,
  	minusb: minusb,
  	minus: minus,
  	minusd: minusd,
  	minusdu: minusdu,
  	MinusPlus: MinusPlus,
  	mlcp: mlcp,
  	mldr: mldr,
  	mnplus: mnplus,
  	models: models,
  	Mopf: Mopf,
  	mopf: mopf,
  	mp: mp,
  	mscr: mscr,
  	Mscr: Mscr,
  	mstpos: mstpos,
  	Mu: Mu,
  	mu: mu,
  	multimap: multimap,
  	mumap: mumap,
  	nabla: nabla,
  	Nacute: Nacute,
  	nacute: nacute,
  	nang: nang,
  	nap: nap,
  	napE: napE,
  	napid: napid,
  	napos: napos,
  	napprox: napprox,
  	natural: natural,
  	naturals: naturals,
  	natur: natur,
  	nbsp: nbsp,
  	nbump: nbump,
  	nbumpe: nbumpe,
  	ncap: ncap,
  	Ncaron: Ncaron,
  	ncaron: ncaron,
  	Ncedil: Ncedil,
  	ncedil: ncedil,
  	ncong: ncong,
  	ncongdot: ncongdot,
  	ncup: ncup,
  	Ncy: Ncy,
  	ncy: ncy,
  	ndash: ndash,
  	nearhk: nearhk,
  	nearr: nearr,
  	neArr: neArr,
  	nearrow: nearrow,
  	ne: ne,
  	nedot: nedot,
  	NegativeMediumSpace: NegativeMediumSpace,
  	NegativeThickSpace: NegativeThickSpace,
  	NegativeThinSpace: NegativeThinSpace,
  	NegativeVeryThinSpace: NegativeVeryThinSpace,
  	nequiv: nequiv,
  	nesear: nesear,
  	nesim: nesim,
  	NestedGreaterGreater: NestedGreaterGreater,
  	NestedLessLess: NestedLessLess,
  	NewLine: NewLine,
  	nexist: nexist,
  	nexists: nexists,
  	Nfr: Nfr,
  	nfr: nfr,
  	ngE: ngE,
  	nge: nge,
  	ngeq: ngeq,
  	ngeqq: ngeqq,
  	ngeqslant: ngeqslant,
  	nges: nges,
  	nGg: nGg,
  	ngsim: ngsim,
  	nGt: nGt,
  	ngt: ngt,
  	ngtr: ngtr,
  	nGtv: nGtv,
  	nharr: nharr,
  	nhArr: nhArr,
  	nhpar: nhpar,
  	ni: ni,
  	nis: nis,
  	nisd: nisd,
  	niv: niv,
  	NJcy: NJcy,
  	njcy: njcy,
  	nlarr: nlarr,
  	nlArr: nlArr,
  	nldr: nldr,
  	nlE: nlE,
  	nle: nle,
  	nleftarrow: nleftarrow,
  	nLeftarrow: nLeftarrow,
  	nleftrightarrow: nleftrightarrow,
  	nLeftrightarrow: nLeftrightarrow,
  	nleq: nleq,
  	nleqq: nleqq,
  	nleqslant: nleqslant,
  	nles: nles,
  	nless: nless,
  	nLl: nLl,
  	nlsim: nlsim,
  	nLt: nLt,
  	nlt: nlt,
  	nltri: nltri,
  	nltrie: nltrie,
  	nLtv: nLtv,
  	nmid: nmid,
  	NoBreak: NoBreak,
  	NonBreakingSpace: NonBreakingSpace,
  	nopf: nopf,
  	Nopf: Nopf,
  	Not: Not,
  	not: not,
  	NotCongruent: NotCongruent,
  	NotCupCap: NotCupCap,
  	NotDoubleVerticalBar: NotDoubleVerticalBar,
  	NotElement: NotElement,
  	NotEqual: NotEqual,
  	NotEqualTilde: NotEqualTilde,
  	NotExists: NotExists,
  	NotGreater: NotGreater,
  	NotGreaterEqual: NotGreaterEqual,
  	NotGreaterFullEqual: NotGreaterFullEqual,
  	NotGreaterGreater: NotGreaterGreater,
  	NotGreaterLess: NotGreaterLess,
  	NotGreaterSlantEqual: NotGreaterSlantEqual,
  	NotGreaterTilde: NotGreaterTilde,
  	NotHumpDownHump: NotHumpDownHump,
  	NotHumpEqual: NotHumpEqual,
  	notin: notin,
  	notindot: notindot,
  	notinE: notinE,
  	notinva: notinva,
  	notinvb: notinvb,
  	notinvc: notinvc,
  	NotLeftTriangleBar: NotLeftTriangleBar,
  	NotLeftTriangle: NotLeftTriangle,
  	NotLeftTriangleEqual: NotLeftTriangleEqual,
  	NotLess: NotLess,
  	NotLessEqual: NotLessEqual,
  	NotLessGreater: NotLessGreater,
  	NotLessLess: NotLessLess,
  	NotLessSlantEqual: NotLessSlantEqual,
  	NotLessTilde: NotLessTilde,
  	NotNestedGreaterGreater: NotNestedGreaterGreater,
  	NotNestedLessLess: NotNestedLessLess,
  	notni: notni,
  	notniva: notniva,
  	notnivb: notnivb,
  	notnivc: notnivc,
  	NotPrecedes: NotPrecedes,
  	NotPrecedesEqual: NotPrecedesEqual,
  	NotPrecedesSlantEqual: NotPrecedesSlantEqual,
  	NotReverseElement: NotReverseElement,
  	NotRightTriangleBar: NotRightTriangleBar,
  	NotRightTriangle: NotRightTriangle,
  	NotRightTriangleEqual: NotRightTriangleEqual,
  	NotSquareSubset: NotSquareSubset,
  	NotSquareSubsetEqual: NotSquareSubsetEqual,
  	NotSquareSuperset: NotSquareSuperset,
  	NotSquareSupersetEqual: NotSquareSupersetEqual,
  	NotSubset: NotSubset,
  	NotSubsetEqual: NotSubsetEqual,
  	NotSucceeds: NotSucceeds,
  	NotSucceedsEqual: NotSucceedsEqual,
  	NotSucceedsSlantEqual: NotSucceedsSlantEqual,
  	NotSucceedsTilde: NotSucceedsTilde,
  	NotSuperset: NotSuperset,
  	NotSupersetEqual: NotSupersetEqual,
  	NotTilde: NotTilde,
  	NotTildeEqual: NotTildeEqual,
  	NotTildeFullEqual: NotTildeFullEqual,
  	NotTildeTilde: NotTildeTilde,
  	NotVerticalBar: NotVerticalBar,
  	nparallel: nparallel,
  	npar: npar,
  	nparsl: nparsl,
  	npart: npart,
  	npolint: npolint,
  	npr: npr,
  	nprcue: nprcue,
  	nprec: nprec,
  	npreceq: npreceq,
  	npre: npre,
  	nrarrc: nrarrc,
  	nrarr: nrarr,
  	nrArr: nrArr,
  	nrarrw: nrarrw,
  	nrightarrow: nrightarrow,
  	nRightarrow: nRightarrow,
  	nrtri: nrtri,
  	nrtrie: nrtrie,
  	nsc: nsc,
  	nsccue: nsccue,
  	nsce: nsce,
  	Nscr: Nscr,
  	nscr: nscr,
  	nshortmid: nshortmid,
  	nshortparallel: nshortparallel,
  	nsim: nsim,
  	nsime: nsime,
  	nsimeq: nsimeq,
  	nsmid: nsmid,
  	nspar: nspar,
  	nsqsube: nsqsube,
  	nsqsupe: nsqsupe,
  	nsub: nsub,
  	nsubE: nsubE,
  	nsube: nsube,
  	nsubset: nsubset,
  	nsubseteq: nsubseteq,
  	nsubseteqq: nsubseteqq,
  	nsucc: nsucc,
  	nsucceq: nsucceq,
  	nsup: nsup,
  	nsupE: nsupE,
  	nsupe: nsupe,
  	nsupset: nsupset,
  	nsupseteq: nsupseteq,
  	nsupseteqq: nsupseteqq,
  	ntgl: ntgl,
  	Ntilde: Ntilde,
  	ntilde: ntilde,
  	ntlg: ntlg,
  	ntriangleleft: ntriangleleft,
  	ntrianglelefteq: ntrianglelefteq,
  	ntriangleright: ntriangleright,
  	ntrianglerighteq: ntrianglerighteq,
  	Nu: Nu,
  	nu: nu,
  	num: num,
  	numero: numero,
  	numsp: numsp,
  	nvap: nvap,
  	nvdash: nvdash,
  	nvDash: nvDash,
  	nVdash: nVdash,
  	nVDash: nVDash,
  	nvge: nvge,
  	nvgt: nvgt,
  	nvHarr: nvHarr,
  	nvinfin: nvinfin,
  	nvlArr: nvlArr,
  	nvle: nvle,
  	nvlt: nvlt,
  	nvltrie: nvltrie,
  	nvrArr: nvrArr,
  	nvrtrie: nvrtrie,
  	nvsim: nvsim,
  	nwarhk: nwarhk,
  	nwarr: nwarr,
  	nwArr: nwArr,
  	nwarrow: nwarrow,
  	nwnear: nwnear,
  	Oacute: Oacute,
  	oacute: oacute,
  	oast: oast,
  	Ocirc: Ocirc,
  	ocirc: ocirc,
  	ocir: ocir,
  	Ocy: Ocy,
  	ocy: ocy,
  	odash: odash,
  	Odblac: Odblac,
  	odblac: odblac,
  	odiv: odiv,
  	odot: odot,
  	odsold: odsold,
  	OElig: OElig,
  	oelig: oelig,
  	ofcir: ofcir,
  	Ofr: Ofr,
  	ofr: ofr,
  	ogon: ogon,
  	Ograve: Ograve,
  	ograve: ograve,
  	ogt: ogt,
  	ohbar: ohbar,
  	ohm: ohm,
  	oint: oint,
  	olarr: olarr,
  	olcir: olcir,
  	olcross: olcross,
  	oline: oline,
  	olt: olt,
  	Omacr: Omacr,
  	omacr: omacr,
  	Omega: Omega,
  	omega: omega,
  	Omicron: Omicron,
  	omicron: omicron,
  	omid: omid,
  	ominus: ominus,
  	Oopf: Oopf,
  	oopf: oopf,
  	opar: opar,
  	OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
  	OpenCurlyQuote: OpenCurlyQuote,
  	operp: operp,
  	oplus: oplus,
  	orarr: orarr,
  	Or: Or,
  	or: or,
  	ord: ord,
  	order: order,
  	orderof: orderof,
  	ordf: ordf,
  	ordm: ordm,
  	origof: origof,
  	oror: oror,
  	orslope: orslope,
  	orv: orv,
  	oS: oS,
  	Oscr: Oscr,
  	oscr: oscr,
  	Oslash: Oslash,
  	oslash: oslash,
  	osol: osol,
  	Otilde: Otilde,
  	otilde: otilde,
  	otimesas: otimesas,
  	Otimes: Otimes,
  	otimes: otimes,
  	Ouml: Ouml,
  	ouml: ouml,
  	ovbar: ovbar,
  	OverBar: OverBar,
  	OverBrace: OverBrace,
  	OverBracket: OverBracket,
  	OverParenthesis: OverParenthesis,
  	para: para,
  	parallel: parallel,
  	par: par,
  	parsim: parsim,
  	parsl: parsl,
  	part: part,
  	PartialD: PartialD,
  	Pcy: Pcy,
  	pcy: pcy,
  	percnt: percnt,
  	period: period,
  	permil: permil,
  	perp: perp,
  	pertenk: pertenk,
  	Pfr: Pfr,
  	pfr: pfr,
  	Phi: Phi,
  	phi: phi,
  	phiv: phiv,
  	phmmat: phmmat,
  	phone: phone,
  	Pi: Pi,
  	pi: pi,
  	pitchfork: pitchfork,
  	piv: piv,
  	planck: planck,
  	planckh: planckh,
  	plankv: plankv,
  	plusacir: plusacir,
  	plusb: plusb,
  	pluscir: pluscir,
  	plus: plus,
  	plusdo: plusdo,
  	plusdu: plusdu,
  	pluse: pluse,
  	PlusMinus: PlusMinus,
  	plusmn: plusmn,
  	plussim: plussim,
  	plustwo: plustwo,
  	pm: pm,
  	Poincareplane: Poincareplane,
  	pointint: pointint,
  	popf: popf,
  	Popf: Popf,
  	pound: pound,
  	prap: prap,
  	Pr: Pr,
  	pr: pr,
  	prcue: prcue,
  	precapprox: precapprox,
  	prec: prec,
  	preccurlyeq: preccurlyeq,
  	Precedes: Precedes,
  	PrecedesEqual: PrecedesEqual,
  	PrecedesSlantEqual: PrecedesSlantEqual,
  	PrecedesTilde: PrecedesTilde,
  	preceq: preceq,
  	precnapprox: precnapprox,
  	precneqq: precneqq,
  	precnsim: precnsim,
  	pre: pre,
  	prE: prE,
  	precsim: precsim,
  	prime: prime,
  	Prime: Prime,
  	primes: primes,
  	prnap: prnap,
  	prnE: prnE,
  	prnsim: prnsim,
  	prod: prod,
  	Product: Product,
  	profalar: profalar,
  	profline: profline,
  	profsurf: profsurf,
  	prop: prop,
  	Proportional: Proportional,
  	Proportion: Proportion,
  	propto: propto,
  	prsim: prsim,
  	prurel: prurel,
  	Pscr: Pscr,
  	pscr: pscr,
  	Psi: Psi,
  	psi: psi,
  	puncsp: puncsp,
  	Qfr: Qfr,
  	qfr: qfr,
  	qint: qint,
  	qopf: qopf,
  	Qopf: Qopf,
  	qprime: qprime,
  	Qscr: Qscr,
  	qscr: qscr,
  	quaternions: quaternions,
  	quatint: quatint,
  	quest: quest,
  	questeq: questeq,
  	quot: quot,
  	QUOT: QUOT,
  	rAarr: rAarr,
  	race: race,
  	Racute: Racute,
  	racute: racute,
  	radic: radic,
  	raemptyv: raemptyv,
  	rang: rang,
  	Rang: Rang,
  	rangd: rangd,
  	range: range,
  	rangle: rangle,
  	raquo: raquo,
  	rarrap: rarrap,
  	rarrb: rarrb,
  	rarrbfs: rarrbfs,
  	rarrc: rarrc,
  	rarr: rarr,
  	Rarr: Rarr,
  	rArr: rArr,
  	rarrfs: rarrfs,
  	rarrhk: rarrhk,
  	rarrlp: rarrlp,
  	rarrpl: rarrpl,
  	rarrsim: rarrsim,
  	Rarrtl: Rarrtl,
  	rarrtl: rarrtl,
  	rarrw: rarrw,
  	ratail: ratail,
  	rAtail: rAtail,
  	ratio: ratio,
  	rationals: rationals,
  	rbarr: rbarr,
  	rBarr: rBarr,
  	RBarr: RBarr,
  	rbbrk: rbbrk,
  	rbrace: rbrace,
  	rbrack: rbrack,
  	rbrke: rbrke,
  	rbrksld: rbrksld,
  	rbrkslu: rbrkslu,
  	Rcaron: Rcaron,
  	rcaron: rcaron,
  	Rcedil: Rcedil,
  	rcedil: rcedil,
  	rceil: rceil,
  	rcub: rcub,
  	Rcy: Rcy,
  	rcy: rcy,
  	rdca: rdca,
  	rdldhar: rdldhar,
  	rdquo: rdquo,
  	rdquor: rdquor,
  	rdsh: rdsh,
  	real: real,
  	realine: realine,
  	realpart: realpart,
  	reals: reals,
  	Re: Re,
  	rect: rect,
  	reg: reg,
  	REG: REG,
  	ReverseElement: ReverseElement,
  	ReverseEquilibrium: ReverseEquilibrium,
  	ReverseUpEquilibrium: ReverseUpEquilibrium,
  	rfisht: rfisht,
  	rfloor: rfloor,
  	rfr: rfr,
  	Rfr: Rfr,
  	rHar: rHar,
  	rhard: rhard,
  	rharu: rharu,
  	rharul: rharul,
  	Rho: Rho,
  	rho: rho,
  	rhov: rhov,
  	RightAngleBracket: RightAngleBracket,
  	RightArrowBar: RightArrowBar,
  	rightarrow: rightarrow,
  	RightArrow: RightArrow,
  	Rightarrow: Rightarrow,
  	RightArrowLeftArrow: RightArrowLeftArrow,
  	rightarrowtail: rightarrowtail,
  	RightCeiling: RightCeiling,
  	RightDoubleBracket: RightDoubleBracket,
  	RightDownTeeVector: RightDownTeeVector,
  	RightDownVectorBar: RightDownVectorBar,
  	RightDownVector: RightDownVector,
  	RightFloor: RightFloor,
  	rightharpoondown: rightharpoondown,
  	rightharpoonup: rightharpoonup,
  	rightleftarrows: rightleftarrows,
  	rightleftharpoons: rightleftharpoons,
  	rightrightarrows: rightrightarrows,
  	rightsquigarrow: rightsquigarrow,
  	RightTeeArrow: RightTeeArrow,
  	RightTee: RightTee,
  	RightTeeVector: RightTeeVector,
  	rightthreetimes: rightthreetimes,
  	RightTriangleBar: RightTriangleBar,
  	RightTriangle: RightTriangle,
  	RightTriangleEqual: RightTriangleEqual,
  	RightUpDownVector: RightUpDownVector,
  	RightUpTeeVector: RightUpTeeVector,
  	RightUpVectorBar: RightUpVectorBar,
  	RightUpVector: RightUpVector,
  	RightVectorBar: RightVectorBar,
  	RightVector: RightVector,
  	ring: ring,
  	risingdotseq: risingdotseq,
  	rlarr: rlarr,
  	rlhar: rlhar,
  	rlm: rlm,
  	rmoustache: rmoustache,
  	rmoust: rmoust,
  	rnmid: rnmid,
  	roang: roang,
  	roarr: roarr,
  	robrk: robrk,
  	ropar: ropar,
  	ropf: ropf,
  	Ropf: Ropf,
  	roplus: roplus,
  	rotimes: rotimes,
  	RoundImplies: RoundImplies,
  	rpar: rpar,
  	rpargt: rpargt,
  	rppolint: rppolint,
  	rrarr: rrarr,
  	Rrightarrow: Rrightarrow,
  	rsaquo: rsaquo,
  	rscr: rscr,
  	Rscr: Rscr,
  	rsh: rsh,
  	Rsh: Rsh,
  	rsqb: rsqb,
  	rsquo: rsquo,
  	rsquor: rsquor,
  	rthree: rthree,
  	rtimes: rtimes,
  	rtri: rtri,
  	rtrie: rtrie,
  	rtrif: rtrif,
  	rtriltri: rtriltri,
  	RuleDelayed: RuleDelayed,
  	ruluhar: ruluhar,
  	rx: rx,
  	Sacute: Sacute,
  	sacute: sacute,
  	sbquo: sbquo,
  	scap: scap,
  	Scaron: Scaron,
  	scaron: scaron,
  	Sc: Sc,
  	sc: sc,
  	sccue: sccue,
  	sce: sce,
  	scE: scE,
  	Scedil: Scedil,
  	scedil: scedil,
  	Scirc: Scirc,
  	scirc: scirc,
  	scnap: scnap,
  	scnE: scnE,
  	scnsim: scnsim,
  	scpolint: scpolint,
  	scsim: scsim,
  	Scy: Scy,
  	scy: scy,
  	sdotb: sdotb,
  	sdot: sdot,
  	sdote: sdote,
  	searhk: searhk,
  	searr: searr,
  	seArr: seArr,
  	searrow: searrow,
  	sect: sect,
  	semi: semi,
  	seswar: seswar,
  	setminus: setminus,
  	setmn: setmn,
  	sext: sext,
  	Sfr: Sfr,
  	sfr: sfr,
  	sfrown: sfrown,
  	sharp: sharp,
  	SHCHcy: SHCHcy,
  	shchcy: shchcy,
  	SHcy: SHcy,
  	shcy: shcy,
  	ShortDownArrow: ShortDownArrow,
  	ShortLeftArrow: ShortLeftArrow,
  	shortmid: shortmid,
  	shortparallel: shortparallel,
  	ShortRightArrow: ShortRightArrow,
  	ShortUpArrow: ShortUpArrow,
  	shy: shy,
  	Sigma: Sigma,
  	sigma: sigma,
  	sigmaf: sigmaf,
  	sigmav: sigmav,
  	sim: sim,
  	simdot: simdot,
  	sime: sime,
  	simeq: simeq,
  	simg: simg,
  	simgE: simgE,
  	siml: siml,
  	simlE: simlE,
  	simne: simne,
  	simplus: simplus,
  	simrarr: simrarr,
  	slarr: slarr,
  	SmallCircle: SmallCircle,
  	smallsetminus: smallsetminus,
  	smashp: smashp,
  	smeparsl: smeparsl,
  	smid: smid,
  	smile: smile,
  	smt: smt,
  	smte: smte,
  	smtes: smtes,
  	SOFTcy: SOFTcy,
  	softcy: softcy,
  	solbar: solbar,
  	solb: solb,
  	sol: sol,
  	Sopf: Sopf,
  	sopf: sopf,
  	spades: spades,
  	spadesuit: spadesuit,
  	spar: spar,
  	sqcap: sqcap,
  	sqcaps: sqcaps,
  	sqcup: sqcup,
  	sqcups: sqcups,
  	Sqrt: Sqrt,
  	sqsub: sqsub,
  	sqsube: sqsube,
  	sqsubset: sqsubset,
  	sqsubseteq: sqsubseteq,
  	sqsup: sqsup,
  	sqsupe: sqsupe,
  	sqsupset: sqsupset,
  	sqsupseteq: sqsupseteq,
  	square: square,
  	Square: Square,
  	SquareIntersection: SquareIntersection,
  	SquareSubset: SquareSubset,
  	SquareSubsetEqual: SquareSubsetEqual,
  	SquareSuperset: SquareSuperset,
  	SquareSupersetEqual: SquareSupersetEqual,
  	SquareUnion: SquareUnion,
  	squarf: squarf,
  	squ: squ,
  	squf: squf,
  	srarr: srarr,
  	Sscr: Sscr,
  	sscr: sscr,
  	ssetmn: ssetmn,
  	ssmile: ssmile,
  	sstarf: sstarf,
  	Star: Star,
  	star: star,
  	starf: starf,
  	straightepsilon: straightepsilon,
  	straightphi: straightphi,
  	strns: strns,
  	sub: sub,
  	Sub: Sub,
  	subdot: subdot,
  	subE: subE,
  	sube: sube,
  	subedot: subedot,
  	submult: submult,
  	subnE: subnE,
  	subne: subne,
  	subplus: subplus,
  	subrarr: subrarr,
  	subset: subset,
  	Subset: Subset,
  	subseteq: subseteq,
  	subseteqq: subseteqq,
  	SubsetEqual: SubsetEqual,
  	subsetneq: subsetneq,
  	subsetneqq: subsetneqq,
  	subsim: subsim,
  	subsub: subsub,
  	subsup: subsup,
  	succapprox: succapprox,
  	succ: succ,
  	succcurlyeq: succcurlyeq,
  	Succeeds: Succeeds,
  	SucceedsEqual: SucceedsEqual,
  	SucceedsSlantEqual: SucceedsSlantEqual,
  	SucceedsTilde: SucceedsTilde,
  	succeq: succeq,
  	succnapprox: succnapprox,
  	succneqq: succneqq,
  	succnsim: succnsim,
  	succsim: succsim,
  	SuchThat: SuchThat,
  	sum: sum,
  	Sum: Sum,
  	sung: sung,
  	sup1: sup1,
  	sup2: sup2,
  	sup3: sup3,
  	sup: sup,
  	Sup: Sup,
  	supdot: supdot,
  	supdsub: supdsub,
  	supE: supE,
  	supe: supe,
  	supedot: supedot,
  	Superset: Superset,
  	SupersetEqual: SupersetEqual,
  	suphsol: suphsol,
  	suphsub: suphsub,
  	suplarr: suplarr,
  	supmult: supmult,
  	supnE: supnE,
  	supne: supne,
  	supplus: supplus,
  	supset: supset,
  	Supset: Supset,
  	supseteq: supseteq,
  	supseteqq: supseteqq,
  	supsetneq: supsetneq,
  	supsetneqq: supsetneqq,
  	supsim: supsim,
  	supsub: supsub,
  	supsup: supsup,
  	swarhk: swarhk,
  	swarr: swarr,
  	swArr: swArr,
  	swarrow: swarrow,
  	swnwar: swnwar,
  	szlig: szlig,
  	Tab: Tab,
  	target: target,
  	Tau: Tau,
  	tau: tau,
  	tbrk: tbrk,
  	Tcaron: Tcaron,
  	tcaron: tcaron,
  	Tcedil: Tcedil,
  	tcedil: tcedil,
  	Tcy: Tcy,
  	tcy: tcy,
  	tdot: tdot,
  	telrec: telrec,
  	Tfr: Tfr,
  	tfr: tfr,
  	there4: there4,
  	therefore: therefore,
  	Therefore: Therefore,
  	Theta: Theta,
  	theta: theta,
  	thetasym: thetasym,
  	thetav: thetav,
  	thickapprox: thickapprox,
  	thicksim: thicksim,
  	ThickSpace: ThickSpace,
  	ThinSpace: ThinSpace,
  	thinsp: thinsp,
  	thkap: thkap,
  	thksim: thksim,
  	THORN: THORN,
  	thorn: thorn,
  	tilde: tilde,
  	Tilde: Tilde,
  	TildeEqual: TildeEqual,
  	TildeFullEqual: TildeFullEqual,
  	TildeTilde: TildeTilde,
  	timesbar: timesbar,
  	timesb: timesb,
  	times: times,
  	timesd: timesd,
  	tint: tint,
  	toea: toea,
  	topbot: topbot,
  	topcir: topcir,
  	top: top,
  	Topf: Topf,
  	topf: topf,
  	topfork: topfork,
  	tosa: tosa,
  	tprime: tprime,
  	trade: trade,
  	TRADE: TRADE,
  	triangle: triangle,
  	triangledown: triangledown,
  	triangleleft: triangleleft,
  	trianglelefteq: trianglelefteq,
  	triangleq: triangleq,
  	triangleright: triangleright,
  	trianglerighteq: trianglerighteq,
  	tridot: tridot,
  	trie: trie,
  	triminus: triminus,
  	TripleDot: TripleDot,
  	triplus: triplus,
  	trisb: trisb,
  	tritime: tritime,
  	trpezium: trpezium,
  	Tscr: Tscr,
  	tscr: tscr,
  	TScy: TScy,
  	tscy: tscy,
  	TSHcy: TSHcy,
  	tshcy: tshcy,
  	Tstrok: Tstrok,
  	tstrok: tstrok,
  	twixt: twixt,
  	twoheadleftarrow: twoheadleftarrow,
  	twoheadrightarrow: twoheadrightarrow,
  	Uacute: Uacute,
  	uacute: uacute,
  	uarr: uarr,
  	Uarr: Uarr,
  	uArr: uArr,
  	Uarrocir: Uarrocir,
  	Ubrcy: Ubrcy,
  	ubrcy: ubrcy,
  	Ubreve: Ubreve,
  	ubreve: ubreve,
  	Ucirc: Ucirc,
  	ucirc: ucirc,
  	Ucy: Ucy,
  	ucy: ucy,
  	udarr: udarr,
  	Udblac: Udblac,
  	udblac: udblac,
  	udhar: udhar,
  	ufisht: ufisht,
  	Ufr: Ufr,
  	ufr: ufr,
  	Ugrave: Ugrave,
  	ugrave: ugrave,
  	uHar: uHar,
  	uharl: uharl,
  	uharr: uharr,
  	uhblk: uhblk,
  	ulcorn: ulcorn,
  	ulcorner: ulcorner,
  	ulcrop: ulcrop,
  	ultri: ultri,
  	Umacr: Umacr,
  	umacr: umacr,
  	uml: uml,
  	UnderBar: UnderBar,
  	UnderBrace: UnderBrace,
  	UnderBracket: UnderBracket,
  	UnderParenthesis: UnderParenthesis,
  	Union: Union,
  	UnionPlus: UnionPlus,
  	Uogon: Uogon,
  	uogon: uogon,
  	Uopf: Uopf,
  	uopf: uopf,
  	UpArrowBar: UpArrowBar,
  	uparrow: uparrow,
  	UpArrow: UpArrow,
  	Uparrow: Uparrow,
  	UpArrowDownArrow: UpArrowDownArrow,
  	updownarrow: updownarrow,
  	UpDownArrow: UpDownArrow,
  	Updownarrow: Updownarrow,
  	UpEquilibrium: UpEquilibrium,
  	upharpoonleft: upharpoonleft,
  	upharpoonright: upharpoonright,
  	uplus: uplus,
  	UpperLeftArrow: UpperLeftArrow,
  	UpperRightArrow: UpperRightArrow,
  	upsi: upsi,
  	Upsi: Upsi,
  	upsih: upsih,
  	Upsilon: Upsilon,
  	upsilon: upsilon,
  	UpTeeArrow: UpTeeArrow,
  	UpTee: UpTee,
  	upuparrows: upuparrows,
  	urcorn: urcorn,
  	urcorner: urcorner,
  	urcrop: urcrop,
  	Uring: Uring,
  	uring: uring,
  	urtri: urtri,
  	Uscr: Uscr,
  	uscr: uscr,
  	utdot: utdot,
  	Utilde: Utilde,
  	utilde: utilde,
  	utri: utri,
  	utrif: utrif,
  	uuarr: uuarr,
  	Uuml: Uuml,
  	uuml: uuml,
  	uwangle: uwangle,
  	vangrt: vangrt,
  	varepsilon: varepsilon,
  	varkappa: varkappa,
  	varnothing: varnothing,
  	varphi: varphi,
  	varpi: varpi,
  	varpropto: varpropto,
  	varr: varr,
  	vArr: vArr,
  	varrho: varrho,
  	varsigma: varsigma,
  	varsubsetneq: varsubsetneq,
  	varsubsetneqq: varsubsetneqq,
  	varsupsetneq: varsupsetneq,
  	varsupsetneqq: varsupsetneqq,
  	vartheta: vartheta,
  	vartriangleleft: vartriangleleft,
  	vartriangleright: vartriangleright,
  	vBar: vBar,
  	Vbar: Vbar,
  	vBarv: vBarv,
  	Vcy: Vcy,
  	vcy: vcy,
  	vdash: vdash,
  	vDash: vDash,
  	Vdash: Vdash,
  	VDash: VDash,
  	Vdashl: Vdashl,
  	veebar: veebar,
  	vee: vee,
  	Vee: Vee,
  	veeeq: veeeq,
  	vellip: vellip,
  	verbar: verbar,
  	Verbar: Verbar,
  	vert: vert,
  	Vert: Vert,
  	VerticalBar: VerticalBar,
  	VerticalLine: VerticalLine,
  	VerticalSeparator: VerticalSeparator,
  	VerticalTilde: VerticalTilde,
  	VeryThinSpace: VeryThinSpace,
  	Vfr: Vfr,
  	vfr: vfr,
  	vltri: vltri,
  	vnsub: vnsub,
  	vnsup: vnsup,
  	Vopf: Vopf,
  	vopf: vopf,
  	vprop: vprop,
  	vrtri: vrtri,
  	Vscr: Vscr,
  	vscr: vscr,
  	vsubnE: vsubnE,
  	vsubne: vsubne,
  	vsupnE: vsupnE,
  	vsupne: vsupne,
  	Vvdash: Vvdash,
  	vzigzag: vzigzag,
  	Wcirc: Wcirc,
  	wcirc: wcirc,
  	wedbar: wedbar,
  	wedge: wedge,
  	Wedge: Wedge,
  	wedgeq: wedgeq,
  	weierp: weierp,
  	Wfr: Wfr,
  	wfr: wfr,
  	Wopf: Wopf,
  	wopf: wopf,
  	wp: wp,
  	wr: wr,
  	wreath: wreath,
  	Wscr: Wscr,
  	wscr: wscr,
  	xcap: xcap,
  	xcirc: xcirc,
  	xcup: xcup,
  	xdtri: xdtri,
  	Xfr: Xfr,
  	xfr: xfr,
  	xharr: xharr,
  	xhArr: xhArr,
  	Xi: Xi,
  	xi: xi,
  	xlarr: xlarr,
  	xlArr: xlArr,
  	xmap: xmap,
  	xnis: xnis,
  	xodot: xodot,
  	Xopf: Xopf,
  	xopf: xopf,
  	xoplus: xoplus,
  	xotime: xotime,
  	xrarr: xrarr,
  	xrArr: xrArr,
  	Xscr: Xscr,
  	xscr: xscr,
  	xsqcup: xsqcup,
  	xuplus: xuplus,
  	xutri: xutri,
  	xvee: xvee,
  	xwedge: xwedge,
  	Yacute: Yacute,
  	yacute: yacute,
  	YAcy: YAcy,
  	yacy: yacy,
  	Ycirc: Ycirc,
  	ycirc: ycirc,
  	Ycy: Ycy,
  	ycy: ycy,
  	yen: yen,
  	Yfr: Yfr,
  	yfr: yfr,
  	YIcy: YIcy,
  	yicy: yicy,
  	Yopf: Yopf,
  	yopf: yopf,
  	Yscr: Yscr,
  	yscr: yscr,
  	YUcy: YUcy,
  	yucy: yucy,
  	yuml: yuml,
  	Yuml: Yuml,
  	Zacute: Zacute,
  	zacute: zacute,
  	Zcaron: Zcaron,
  	zcaron: zcaron,
  	Zcy: Zcy,
  	zcy: zcy,
  	Zdot: Zdot,
  	zdot: zdot,
  	zeetrf: zeetrf,
  	ZeroWidthSpace: ZeroWidthSpace,
  	Zeta: Zeta,
  	zeta: zeta,
  	zfr: zfr,
  	Zfr: Zfr,
  	ZHcy: ZHcy,
  	zhcy: zhcy,
  	zigrarr: zigrarr,
  	zopf: zopf,
  	Zopf: Zopf,
  	Zscr: Zscr,
  	zscr: zscr,
  	zwj: zwj,
  	zwnj: zwnj
  };

  var entities$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Aacute: Aacute,
    aacute: aacute,
    Abreve: Abreve,
    abreve: abreve,
    ac: ac,
    acd: acd,
    acE: acE,
    Acirc: Acirc,
    acirc: acirc,
    acute: acute,
    Acy: Acy,
    acy: acy,
    AElig: AElig,
    aelig: aelig,
    af: af,
    Afr: Afr,
    afr: afr,
    Agrave: Agrave,
    agrave: agrave,
    alefsym: alefsym,
    aleph: aleph,
    Alpha: Alpha,
    alpha: alpha,
    Amacr: Amacr,
    amacr: amacr,
    amalg: amalg,
    amp: amp,
    AMP: AMP,
    andand: andand,
    And: And,
    and: and,
    andd: andd,
    andslope: andslope,
    andv: andv,
    ang: ang,
    ange: ange,
    angle: angle,
    angmsdaa: angmsdaa,
    angmsdab: angmsdab,
    angmsdac: angmsdac,
    angmsdad: angmsdad,
    angmsdae: angmsdae,
    angmsdaf: angmsdaf,
    angmsdag: angmsdag,
    angmsdah: angmsdah,
    angmsd: angmsd,
    angrt: angrt,
    angrtvb: angrtvb,
    angrtvbd: angrtvbd,
    angsph: angsph,
    angst: angst,
    angzarr: angzarr,
    Aogon: Aogon,
    aogon: aogon,
    Aopf: Aopf,
    aopf: aopf,
    apacir: apacir,
    ap: ap,
    apE: apE,
    ape: ape,
    apid: apid,
    apos: apos,
    ApplyFunction: ApplyFunction,
    approx: approx,
    approxeq: approxeq,
    Aring: Aring,
    aring: aring,
    Ascr: Ascr,
    ascr: ascr,
    Assign: Assign,
    ast: ast,
    asymp: asymp,
    asympeq: asympeq,
    Atilde: Atilde,
    atilde: atilde,
    Auml: Auml,
    auml: auml,
    awconint: awconint,
    awint: awint,
    backcong: backcong,
    backepsilon: backepsilon,
    backprime: backprime,
    backsim: backsim,
    backsimeq: backsimeq,
    Backslash: Backslash,
    Barv: Barv,
    barvee: barvee,
    barwed: barwed,
    Barwed: Barwed,
    barwedge: barwedge,
    bbrk: bbrk,
    bbrktbrk: bbrktbrk,
    bcong: bcong,
    Bcy: Bcy,
    bcy: bcy,
    bdquo: bdquo,
    becaus: becaus,
    because: because,
    Because: Because,
    bemptyv: bemptyv,
    bepsi: bepsi,
    bernou: bernou,
    Bernoullis: Bernoullis,
    Beta: Beta,
    beta: beta,
    beth: beth,
    between: between,
    Bfr: Bfr,
    bfr: bfr,
    bigcap: bigcap,
    bigcirc: bigcirc,
    bigcup: bigcup,
    bigodot: bigodot,
    bigoplus: bigoplus,
    bigotimes: bigotimes,
    bigsqcup: bigsqcup,
    bigstar: bigstar,
    bigtriangledown: bigtriangledown,
    bigtriangleup: bigtriangleup,
    biguplus: biguplus,
    bigvee: bigvee,
    bigwedge: bigwedge,
    bkarow: bkarow,
    blacklozenge: blacklozenge,
    blacksquare: blacksquare,
    blacktriangle: blacktriangle,
    blacktriangledown: blacktriangledown,
    blacktriangleleft: blacktriangleleft,
    blacktriangleright: blacktriangleright,
    blank: blank,
    blk12: blk12,
    blk14: blk14,
    blk34: blk34,
    block: block,
    bne: bne,
    bnequiv: bnequiv,
    bNot: bNot,
    bnot: bnot,
    Bopf: Bopf,
    bopf: bopf,
    bot: bot,
    bottom: bottom,
    bowtie: bowtie,
    boxbox: boxbox,
    boxdl: boxdl,
    boxdL: boxdL,
    boxDl: boxDl,
    boxDL: boxDL,
    boxdr: boxdr,
    boxdR: boxdR,
    boxDr: boxDr,
    boxDR: boxDR,
    boxh: boxh,
    boxH: boxH,
    boxhd: boxhd,
    boxHd: boxHd,
    boxhD: boxhD,
    boxHD: boxHD,
    boxhu: boxhu,
    boxHu: boxHu,
    boxhU: boxhU,
    boxHU: boxHU,
    boxminus: boxminus,
    boxplus: boxplus,
    boxtimes: boxtimes,
    boxul: boxul,
    boxuL: boxuL,
    boxUl: boxUl,
    boxUL: boxUL,
    boxur: boxur,
    boxuR: boxuR,
    boxUr: boxUr,
    boxUR: boxUR,
    boxv: boxv,
    boxV: boxV,
    boxvh: boxvh,
    boxvH: boxvH,
    boxVh: boxVh,
    boxVH: boxVH,
    boxvl: boxvl,
    boxvL: boxvL,
    boxVl: boxVl,
    boxVL: boxVL,
    boxvr: boxvr,
    boxvR: boxvR,
    boxVr: boxVr,
    boxVR: boxVR,
    bprime: bprime,
    breve: breve,
    Breve: Breve,
    brvbar: brvbar,
    bscr: bscr,
    Bscr: Bscr,
    bsemi: bsemi,
    bsim: bsim,
    bsime: bsime,
    bsolb: bsolb,
    bsol: bsol,
    bsolhsub: bsolhsub,
    bull: bull,
    bullet: bullet,
    bump: bump,
    bumpE: bumpE,
    bumpe: bumpe,
    Bumpeq: Bumpeq,
    bumpeq: bumpeq,
    Cacute: Cacute,
    cacute: cacute,
    capand: capand,
    capbrcup: capbrcup,
    capcap: capcap,
    cap: cap,
    Cap: Cap,
    capcup: capcup,
    capdot: capdot,
    CapitalDifferentialD: CapitalDifferentialD,
    caps: caps,
    caret: caret,
    caron: caron,
    Cayleys: Cayleys,
    ccaps: ccaps,
    Ccaron: Ccaron,
    ccaron: ccaron,
    Ccedil: Ccedil,
    ccedil: ccedil,
    Ccirc: Ccirc,
    ccirc: ccirc,
    Cconint: Cconint,
    ccups: ccups,
    ccupssm: ccupssm,
    Cdot: Cdot,
    cdot: cdot,
    cedil: cedil,
    Cedilla: Cedilla,
    cemptyv: cemptyv,
    cent: cent,
    centerdot: centerdot,
    CenterDot: CenterDot,
    cfr: cfr,
    Cfr: Cfr,
    CHcy: CHcy,
    chcy: chcy,
    check: check,
    checkmark: checkmark,
    Chi: Chi,
    chi: chi,
    circ: circ,
    circeq: circeq,
    circlearrowleft: circlearrowleft,
    circlearrowright: circlearrowright,
    circledast: circledast,
    circledcirc: circledcirc,
    circleddash: circleddash,
    CircleDot: CircleDot,
    circledR: circledR,
    circledS: circledS,
    CircleMinus: CircleMinus,
    CirclePlus: CirclePlus,
    CircleTimes: CircleTimes,
    cir: cir,
    cirE: cirE,
    cire: cire,
    cirfnint: cirfnint,
    cirmid: cirmid,
    cirscir: cirscir,
    ClockwiseContourIntegral: ClockwiseContourIntegral,
    CloseCurlyDoubleQuote: CloseCurlyDoubleQuote,
    CloseCurlyQuote: CloseCurlyQuote,
    clubs: clubs,
    clubsuit: clubsuit,
    colon: colon,
    Colon: Colon,
    Colone: Colone,
    colone: colone,
    coloneq: coloneq,
    comma: comma,
    commat: commat,
    comp: comp,
    compfn: compfn,
    complement: complement,
    complexes: complexes,
    cong: cong,
    congdot: congdot,
    Congruent: Congruent,
    conint: conint,
    Conint: Conint,
    ContourIntegral: ContourIntegral,
    copf: copf,
    Copf: Copf,
    coprod: coprod,
    Coproduct: Coproduct,
    copy: copy,
    COPY: COPY,
    copysr: copysr,
    CounterClockwiseContourIntegral: CounterClockwiseContourIntegral,
    crarr: crarr,
    cross: cross,
    Cross: Cross,
    Cscr: Cscr,
    cscr: cscr,
    csub: csub,
    csube: csube,
    csup: csup,
    csupe: csupe,
    ctdot: ctdot,
    cudarrl: cudarrl,
    cudarrr: cudarrr,
    cuepr: cuepr,
    cuesc: cuesc,
    cularr: cularr,
    cularrp: cularrp,
    cupbrcap: cupbrcap,
    cupcap: cupcap,
    CupCap: CupCap,
    cup: cup,
    Cup: Cup,
    cupcup: cupcup,
    cupdot: cupdot,
    cupor: cupor,
    cups: cups,
    curarr: curarr,
    curarrm: curarrm,
    curlyeqprec: curlyeqprec,
    curlyeqsucc: curlyeqsucc,
    curlyvee: curlyvee,
    curlywedge: curlywedge,
    curren: curren,
    curvearrowleft: curvearrowleft,
    curvearrowright: curvearrowright,
    cuvee: cuvee,
    cuwed: cuwed,
    cwconint: cwconint,
    cwint: cwint,
    cylcty: cylcty,
    dagger: dagger,
    Dagger: Dagger,
    daleth: daleth,
    darr: darr,
    Darr: Darr,
    dArr: dArr,
    dash: dash,
    Dashv: Dashv,
    dashv: dashv,
    dbkarow: dbkarow,
    dblac: dblac,
    Dcaron: Dcaron,
    dcaron: dcaron,
    Dcy: Dcy,
    dcy: dcy,
    ddagger: ddagger,
    ddarr: ddarr,
    DD: DD,
    dd: dd,
    DDotrahd: DDotrahd,
    ddotseq: ddotseq,
    deg: deg,
    Del: Del,
    Delta: Delta,
    delta: delta,
    demptyv: demptyv,
    dfisht: dfisht,
    Dfr: Dfr,
    dfr: dfr,
    dHar: dHar,
    dharl: dharl,
    dharr: dharr,
    DiacriticalAcute: DiacriticalAcute,
    DiacriticalDot: DiacriticalDot,
    DiacriticalDoubleAcute: DiacriticalDoubleAcute,
    DiacriticalGrave: DiacriticalGrave,
    DiacriticalTilde: DiacriticalTilde,
    diam: diam,
    diamond: diamond,
    Diamond: Diamond,
    diamondsuit: diamondsuit,
    diams: diams,
    die: die,
    DifferentialD: DifferentialD,
    digamma: digamma,
    disin: disin,
    div: div,
    divide: divide,
    divideontimes: divideontimes,
    divonx: divonx,
    DJcy: DJcy,
    djcy: djcy,
    dlcorn: dlcorn,
    dlcrop: dlcrop,
    dollar: dollar,
    Dopf: Dopf,
    dopf: dopf,
    Dot: Dot,
    dot: dot,
    DotDot: DotDot,
    doteq: doteq,
    doteqdot: doteqdot,
    DotEqual: DotEqual,
    dotminus: dotminus,
    dotplus: dotplus,
    dotsquare: dotsquare,
    doublebarwedge: doublebarwedge,
    DoubleContourIntegral: DoubleContourIntegral,
    DoubleDot: DoubleDot,
    DoubleDownArrow: DoubleDownArrow,
    DoubleLeftArrow: DoubleLeftArrow,
    DoubleLeftRightArrow: DoubleLeftRightArrow,
    DoubleLeftTee: DoubleLeftTee,
    DoubleLongLeftArrow: DoubleLongLeftArrow,
    DoubleLongLeftRightArrow: DoubleLongLeftRightArrow,
    DoubleLongRightArrow: DoubleLongRightArrow,
    DoubleRightArrow: DoubleRightArrow,
    DoubleRightTee: DoubleRightTee,
    DoubleUpArrow: DoubleUpArrow,
    DoubleUpDownArrow: DoubleUpDownArrow,
    DoubleVerticalBar: DoubleVerticalBar,
    DownArrowBar: DownArrowBar,
    downarrow: downarrow,
    DownArrow: DownArrow,
    Downarrow: Downarrow,
    DownArrowUpArrow: DownArrowUpArrow,
    DownBreve: DownBreve,
    downdownarrows: downdownarrows,
    downharpoonleft: downharpoonleft,
    downharpoonright: downharpoonright,
    DownLeftRightVector: DownLeftRightVector,
    DownLeftTeeVector: DownLeftTeeVector,
    DownLeftVectorBar: DownLeftVectorBar,
    DownLeftVector: DownLeftVector,
    DownRightTeeVector: DownRightTeeVector,
    DownRightVectorBar: DownRightVectorBar,
    DownRightVector: DownRightVector,
    DownTeeArrow: DownTeeArrow,
    DownTee: DownTee,
    drbkarow: drbkarow,
    drcorn: drcorn,
    drcrop: drcrop,
    Dscr: Dscr,
    dscr: dscr,
    DScy: DScy,
    dscy: dscy,
    dsol: dsol,
    Dstrok: Dstrok,
    dstrok: dstrok,
    dtdot: dtdot,
    dtri: dtri,
    dtrif: dtrif,
    duarr: duarr,
    duhar: duhar,
    dwangle: dwangle,
    DZcy: DZcy,
    dzcy: dzcy,
    dzigrarr: dzigrarr,
    Eacute: Eacute,
    eacute: eacute,
    easter: easter,
    Ecaron: Ecaron,
    ecaron: ecaron,
    Ecirc: Ecirc,
    ecirc: ecirc,
    ecir: ecir,
    ecolon: ecolon,
    Ecy: Ecy,
    ecy: ecy,
    eDDot: eDDot,
    Edot: Edot,
    edot: edot,
    eDot: eDot,
    ee: ee,
    efDot: efDot,
    Efr: Efr,
    efr: efr,
    eg: eg,
    Egrave: Egrave,
    egrave: egrave,
    egs: egs,
    egsdot: egsdot,
    el: el,
    Element: Element,
    elinters: elinters,
    ell: ell,
    els: els,
    elsdot: elsdot,
    Emacr: Emacr,
    emacr: emacr,
    empty: empty,
    emptyset: emptyset,
    EmptySmallSquare: EmptySmallSquare,
    emptyv: emptyv,
    EmptyVerySmallSquare: EmptyVerySmallSquare,
    emsp13: emsp13,
    emsp14: emsp14,
    emsp: emsp,
    ENG: ENG,
    eng: eng,
    ensp: ensp,
    Eogon: Eogon,
    eogon: eogon,
    Eopf: Eopf,
    eopf: eopf,
    epar: epar,
    eparsl: eparsl,
    eplus: eplus,
    epsi: epsi,
    Epsilon: Epsilon,
    epsilon: epsilon,
    epsiv: epsiv,
    eqcirc: eqcirc,
    eqcolon: eqcolon,
    eqsim: eqsim,
    eqslantgtr: eqslantgtr,
    eqslantless: eqslantless,
    Equal: Equal,
    equals: equals,
    EqualTilde: EqualTilde,
    equest: equest,
    Equilibrium: Equilibrium,
    equiv: equiv,
    equivDD: equivDD,
    eqvparsl: eqvparsl,
    erarr: erarr,
    erDot: erDot,
    escr: escr,
    Escr: Escr,
    esdot: esdot,
    Esim: Esim,
    esim: esim,
    Eta: Eta,
    eta: eta,
    ETH: ETH,
    eth: eth,
    Euml: Euml,
    euml: euml,
    euro: euro,
    excl: excl,
    exist: exist,
    Exists: Exists,
    expectation: expectation,
    exponentiale: exponentiale,
    ExponentialE: ExponentialE,
    fallingdotseq: fallingdotseq,
    Fcy: Fcy,
    fcy: fcy,
    female: female,
    ffilig: ffilig,
    fflig: fflig,
    ffllig: ffllig,
    Ffr: Ffr,
    ffr: ffr,
    filig: filig,
    FilledSmallSquare: FilledSmallSquare,
    FilledVerySmallSquare: FilledVerySmallSquare,
    fjlig: fjlig,
    flat: flat,
    fllig: fllig,
    fltns: fltns,
    fnof: fnof,
    Fopf: Fopf,
    fopf: fopf,
    forall: forall,
    ForAll: ForAll,
    fork: fork,
    forkv: forkv,
    Fouriertrf: Fouriertrf,
    fpartint: fpartint,
    frac12: frac12,
    frac13: frac13,
    frac14: frac14,
    frac15: frac15,
    frac16: frac16,
    frac18: frac18,
    frac23: frac23,
    frac25: frac25,
    frac34: frac34,
    frac35: frac35,
    frac38: frac38,
    frac45: frac45,
    frac56: frac56,
    frac58: frac58,
    frac78: frac78,
    frasl: frasl,
    frown: frown,
    fscr: fscr,
    Fscr: Fscr,
    gacute: gacute,
    Gamma: Gamma,
    gamma: gamma,
    Gammad: Gammad,
    gammad: gammad,
    gap: gap,
    Gbreve: Gbreve,
    gbreve: gbreve,
    Gcedil: Gcedil,
    Gcirc: Gcirc,
    gcirc: gcirc,
    Gcy: Gcy,
    gcy: gcy,
    Gdot: Gdot,
    gdot: gdot,
    ge: ge,
    gE: gE,
    gEl: gEl,
    gel: gel,
    geq: geq,
    geqq: geqq,
    geqslant: geqslant,
    gescc: gescc,
    ges: ges,
    gesdot: gesdot,
    gesdoto: gesdoto,
    gesdotol: gesdotol,
    gesl: gesl,
    gesles: gesles,
    Gfr: Gfr,
    gfr: gfr,
    gg: gg,
    Gg: Gg,
    ggg: ggg,
    gimel: gimel,
    GJcy: GJcy,
    gjcy: gjcy,
    gla: gla,
    gl: gl,
    glE: glE,
    glj: glj,
    gnap: gnap,
    gnapprox: gnapprox,
    gne: gne,
    gnE: gnE,
    gneq: gneq,
    gneqq: gneqq,
    gnsim: gnsim,
    Gopf: Gopf,
    gopf: gopf,
    grave: grave,
    GreaterEqual: GreaterEqual,
    GreaterEqualLess: GreaterEqualLess,
    GreaterFullEqual: GreaterFullEqual,
    GreaterGreater: GreaterGreater,
    GreaterLess: GreaterLess,
    GreaterSlantEqual: GreaterSlantEqual,
    GreaterTilde: GreaterTilde,
    Gscr: Gscr,
    gscr: gscr,
    gsim: gsim,
    gsime: gsime,
    gsiml: gsiml,
    gtcc: gtcc,
    gtcir: gtcir,
    gt: gt,
    GT: GT,
    Gt: Gt,
    gtdot: gtdot,
    gtlPar: gtlPar,
    gtquest: gtquest,
    gtrapprox: gtrapprox,
    gtrarr: gtrarr,
    gtrdot: gtrdot,
    gtreqless: gtreqless,
    gtreqqless: gtreqqless,
    gtrless: gtrless,
    gtrsim: gtrsim,
    gvertneqq: gvertneqq,
    gvnE: gvnE,
    Hacek: Hacek,
    hairsp: hairsp,
    half: half,
    hamilt: hamilt,
    HARDcy: HARDcy,
    hardcy: hardcy,
    harrcir: harrcir,
    harr: harr,
    hArr: hArr,
    harrw: harrw,
    Hat: Hat,
    hbar: hbar,
    Hcirc: Hcirc,
    hcirc: hcirc,
    hearts: hearts,
    heartsuit: heartsuit,
    hellip: hellip,
    hercon: hercon,
    hfr: hfr,
    Hfr: Hfr,
    HilbertSpace: HilbertSpace,
    hksearow: hksearow,
    hkswarow: hkswarow,
    hoarr: hoarr,
    homtht: homtht,
    hookleftarrow: hookleftarrow,
    hookrightarrow: hookrightarrow,
    hopf: hopf,
    Hopf: Hopf,
    horbar: horbar,
    HorizontalLine: HorizontalLine,
    hscr: hscr,
    Hscr: Hscr,
    hslash: hslash,
    Hstrok: Hstrok,
    hstrok: hstrok,
    HumpDownHump: HumpDownHump,
    HumpEqual: HumpEqual,
    hybull: hybull,
    hyphen: hyphen,
    Iacute: Iacute,
    iacute: iacute,
    ic: ic,
    Icirc: Icirc,
    icirc: icirc,
    Icy: Icy,
    icy: icy,
    Idot: Idot,
    IEcy: IEcy,
    iecy: iecy,
    iexcl: iexcl,
    iff: iff,
    ifr: ifr,
    Ifr: Ifr,
    Igrave: Igrave,
    igrave: igrave,
    ii: ii,
    iiiint: iiiint,
    iiint: iiint,
    iinfin: iinfin,
    iiota: iiota,
    IJlig: IJlig,
    ijlig: ijlig,
    Imacr: Imacr,
    imacr: imacr,
    image: image,
    ImaginaryI: ImaginaryI,
    imagline: imagline,
    imagpart: imagpart,
    imath: imath,
    Im: Im,
    imof: imof,
    imped: imped,
    Implies: Implies,
    incare: incare,
    infin: infin,
    infintie: infintie,
    inodot: inodot,
    intcal: intcal,
    int: int,
    Int: Int,
    integers: integers,
    Integral: Integral,
    intercal: intercal,
    Intersection: Intersection,
    intlarhk: intlarhk,
    intprod: intprod,
    InvisibleComma: InvisibleComma,
    InvisibleTimes: InvisibleTimes,
    IOcy: IOcy,
    iocy: iocy,
    Iogon: Iogon,
    iogon: iogon,
    Iopf: Iopf,
    iopf: iopf,
    Iota: Iota,
    iota: iota,
    iprod: iprod,
    iquest: iquest,
    iscr: iscr,
    Iscr: Iscr,
    isin: isin,
    isindot: isindot,
    isinE: isinE,
    isins: isins,
    isinsv: isinsv,
    isinv: isinv,
    it: it,
    Itilde: Itilde,
    itilde: itilde,
    Iukcy: Iukcy,
    iukcy: iukcy,
    Iuml: Iuml,
    iuml: iuml,
    Jcirc: Jcirc,
    jcirc: jcirc,
    Jcy: Jcy,
    jcy: jcy,
    Jfr: Jfr,
    jfr: jfr,
    jmath: jmath,
    Jopf: Jopf,
    jopf: jopf,
    Jscr: Jscr,
    jscr: jscr,
    Jsercy: Jsercy,
    jsercy: jsercy,
    Jukcy: Jukcy,
    jukcy: jukcy,
    Kappa: Kappa,
    kappa: kappa,
    kappav: kappav,
    Kcedil: Kcedil,
    kcedil: kcedil,
    Kcy: Kcy,
    kcy: kcy,
    Kfr: Kfr,
    kfr: kfr,
    kgreen: kgreen,
    KHcy: KHcy,
    khcy: khcy,
    KJcy: KJcy,
    kjcy: kjcy,
    Kopf: Kopf,
    kopf: kopf,
    Kscr: Kscr,
    kscr: kscr,
    lAarr: lAarr,
    Lacute: Lacute,
    lacute: lacute,
    laemptyv: laemptyv,
    lagran: lagran,
    Lambda: Lambda,
    lambda: lambda,
    lang: lang,
    Lang: Lang,
    langd: langd,
    langle: langle,
    lap: lap,
    Laplacetrf: Laplacetrf,
    laquo: laquo,
    larrb: larrb,
    larrbfs: larrbfs,
    larr: larr,
    Larr: Larr,
    lArr: lArr,
    larrfs: larrfs,
    larrhk: larrhk,
    larrlp: larrlp,
    larrpl: larrpl,
    larrsim: larrsim,
    larrtl: larrtl,
    latail: latail,
    lAtail: lAtail,
    lat: lat,
    late: late,
    lates: lates,
    lbarr: lbarr,
    lBarr: lBarr,
    lbbrk: lbbrk,
    lbrace: lbrace,
    lbrack: lbrack,
    lbrke: lbrke,
    lbrksld: lbrksld,
    lbrkslu: lbrkslu,
    Lcaron: Lcaron,
    lcaron: lcaron,
    Lcedil: Lcedil,
    lcedil: lcedil,
    lceil: lceil,
    lcub: lcub,
    Lcy: Lcy,
    lcy: lcy,
    ldca: ldca,
    ldquo: ldquo,
    ldquor: ldquor,
    ldrdhar: ldrdhar,
    ldrushar: ldrushar,
    ldsh: ldsh,
    le: le,
    lE: lE,
    LeftAngleBracket: LeftAngleBracket,
    LeftArrowBar: LeftArrowBar,
    leftarrow: leftarrow,
    LeftArrow: LeftArrow,
    Leftarrow: Leftarrow,
    LeftArrowRightArrow: LeftArrowRightArrow,
    leftarrowtail: leftarrowtail,
    LeftCeiling: LeftCeiling,
    LeftDoubleBracket: LeftDoubleBracket,
    LeftDownTeeVector: LeftDownTeeVector,
    LeftDownVectorBar: LeftDownVectorBar,
    LeftDownVector: LeftDownVector,
    LeftFloor: LeftFloor,
    leftharpoondown: leftharpoondown,
    leftharpoonup: leftharpoonup,
    leftleftarrows: leftleftarrows,
    leftrightarrow: leftrightarrow,
    LeftRightArrow: LeftRightArrow,
    Leftrightarrow: Leftrightarrow,
    leftrightarrows: leftrightarrows,
    leftrightharpoons: leftrightharpoons,
    leftrightsquigarrow: leftrightsquigarrow,
    LeftRightVector: LeftRightVector,
    LeftTeeArrow: LeftTeeArrow,
    LeftTee: LeftTee,
    LeftTeeVector: LeftTeeVector,
    leftthreetimes: leftthreetimes,
    LeftTriangleBar: LeftTriangleBar,
    LeftTriangle: LeftTriangle,
    LeftTriangleEqual: LeftTriangleEqual,
    LeftUpDownVector: LeftUpDownVector,
    LeftUpTeeVector: LeftUpTeeVector,
    LeftUpVectorBar: LeftUpVectorBar,
    LeftUpVector: LeftUpVector,
    LeftVectorBar: LeftVectorBar,
    LeftVector: LeftVector,
    lEg: lEg,
    leg: leg,
    leq: leq,
    leqq: leqq,
    leqslant: leqslant,
    lescc: lescc,
    les: les,
    lesdot: lesdot,
    lesdoto: lesdoto,
    lesdotor: lesdotor,
    lesg: lesg,
    lesges: lesges,
    lessapprox: lessapprox,
    lessdot: lessdot,
    lesseqgtr: lesseqgtr,
    lesseqqgtr: lesseqqgtr,
    LessEqualGreater: LessEqualGreater,
    LessFullEqual: LessFullEqual,
    LessGreater: LessGreater,
    lessgtr: lessgtr,
    LessLess: LessLess,
    lesssim: lesssim,
    LessSlantEqual: LessSlantEqual,
    LessTilde: LessTilde,
    lfisht: lfisht,
    lfloor: lfloor,
    Lfr: Lfr,
    lfr: lfr,
    lg: lg,
    lgE: lgE,
    lHar: lHar,
    lhard: lhard,
    lharu: lharu,
    lharul: lharul,
    lhblk: lhblk,
    LJcy: LJcy,
    ljcy: ljcy,
    llarr: llarr,
    ll: ll,
    Ll: Ll,
    llcorner: llcorner,
    Lleftarrow: Lleftarrow,
    llhard: llhard,
    lltri: lltri,
    Lmidot: Lmidot,
    lmidot: lmidot,
    lmoustache: lmoustache,
    lmoust: lmoust,
    lnap: lnap,
    lnapprox: lnapprox,
    lne: lne,
    lnE: lnE,
    lneq: lneq,
    lneqq: lneqq,
    lnsim: lnsim,
    loang: loang,
    loarr: loarr,
    lobrk: lobrk,
    longleftarrow: longleftarrow,
    LongLeftArrow: LongLeftArrow,
    Longleftarrow: Longleftarrow,
    longleftrightarrow: longleftrightarrow,
    LongLeftRightArrow: LongLeftRightArrow,
    Longleftrightarrow: Longleftrightarrow,
    longmapsto: longmapsto,
    longrightarrow: longrightarrow,
    LongRightArrow: LongRightArrow,
    Longrightarrow: Longrightarrow,
    looparrowleft: looparrowleft,
    looparrowright: looparrowright,
    lopar: lopar,
    Lopf: Lopf,
    lopf: lopf,
    loplus: loplus,
    lotimes: lotimes,
    lowast: lowast,
    lowbar: lowbar,
    LowerLeftArrow: LowerLeftArrow,
    LowerRightArrow: LowerRightArrow,
    loz: loz,
    lozenge: lozenge,
    lozf: lozf,
    lpar: lpar,
    lparlt: lparlt,
    lrarr: lrarr,
    lrcorner: lrcorner,
    lrhar: lrhar,
    lrhard: lrhard,
    lrm: lrm,
    lrtri: lrtri,
    lsaquo: lsaquo,
    lscr: lscr,
    Lscr: Lscr,
    lsh: lsh,
    Lsh: Lsh,
    lsim: lsim,
    lsime: lsime,
    lsimg: lsimg,
    lsqb: lsqb,
    lsquo: lsquo,
    lsquor: lsquor,
    Lstrok: Lstrok,
    lstrok: lstrok,
    ltcc: ltcc,
    ltcir: ltcir,
    lt: lt,
    LT: LT,
    Lt: Lt,
    ltdot: ltdot,
    lthree: lthree,
    ltimes: ltimes,
    ltlarr: ltlarr,
    ltquest: ltquest,
    ltri: ltri,
    ltrie: ltrie,
    ltrif: ltrif,
    ltrPar: ltrPar,
    lurdshar: lurdshar,
    luruhar: luruhar,
    lvertneqq: lvertneqq,
    lvnE: lvnE,
    macr: macr,
    male: male,
    malt: malt,
    maltese: maltese,
    map: map,
    mapsto: mapsto,
    mapstodown: mapstodown,
    mapstoleft: mapstoleft,
    mapstoup: mapstoup,
    marker: marker,
    mcomma: mcomma,
    Mcy: Mcy,
    mcy: mcy,
    mdash: mdash,
    mDDot: mDDot,
    measuredangle: measuredangle,
    MediumSpace: MediumSpace,
    Mellintrf: Mellintrf,
    Mfr: Mfr,
    mfr: mfr,
    mho: mho,
    micro: micro,
    midast: midast,
    midcir: midcir,
    mid: mid,
    middot: middot,
    minusb: minusb,
    minus: minus,
    minusd: minusd,
    minusdu: minusdu,
    MinusPlus: MinusPlus,
    mlcp: mlcp,
    mldr: mldr,
    mnplus: mnplus,
    models: models,
    Mopf: Mopf,
    mopf: mopf,
    mp: mp,
    mscr: mscr,
    Mscr: Mscr,
    mstpos: mstpos,
    Mu: Mu,
    mu: mu,
    multimap: multimap,
    mumap: mumap,
    nabla: nabla,
    Nacute: Nacute,
    nacute: nacute,
    nang: nang,
    nap: nap,
    napE: napE,
    napid: napid,
    napos: napos,
    napprox: napprox,
    natural: natural,
    naturals: naturals,
    natur: natur,
    nbsp: nbsp,
    nbump: nbump,
    nbumpe: nbumpe,
    ncap: ncap,
    Ncaron: Ncaron,
    ncaron: ncaron,
    Ncedil: Ncedil,
    ncedil: ncedil,
    ncong: ncong,
    ncongdot: ncongdot,
    ncup: ncup,
    Ncy: Ncy,
    ncy: ncy,
    ndash: ndash,
    nearhk: nearhk,
    nearr: nearr,
    neArr: neArr,
    nearrow: nearrow,
    ne: ne,
    nedot: nedot,
    NegativeMediumSpace: NegativeMediumSpace,
    NegativeThickSpace: NegativeThickSpace,
    NegativeThinSpace: NegativeThinSpace,
    NegativeVeryThinSpace: NegativeVeryThinSpace,
    nequiv: nequiv,
    nesear: nesear,
    nesim: nesim,
    NestedGreaterGreater: NestedGreaterGreater,
    NestedLessLess: NestedLessLess,
    NewLine: NewLine,
    nexist: nexist,
    nexists: nexists,
    Nfr: Nfr,
    nfr: nfr,
    ngE: ngE,
    nge: nge,
    ngeq: ngeq,
    ngeqq: ngeqq,
    ngeqslant: ngeqslant,
    nges: nges,
    nGg: nGg,
    ngsim: ngsim,
    nGt: nGt,
    ngt: ngt,
    ngtr: ngtr,
    nGtv: nGtv,
    nharr: nharr,
    nhArr: nhArr,
    nhpar: nhpar,
    ni: ni,
    nis: nis,
    nisd: nisd,
    niv: niv,
    NJcy: NJcy,
    njcy: njcy,
    nlarr: nlarr,
    nlArr: nlArr,
    nldr: nldr,
    nlE: nlE,
    nle: nle,
    nleftarrow: nleftarrow,
    nLeftarrow: nLeftarrow,
    nleftrightarrow: nleftrightarrow,
    nLeftrightarrow: nLeftrightarrow,
    nleq: nleq,
    nleqq: nleqq,
    nleqslant: nleqslant,
    nles: nles,
    nless: nless,
    nLl: nLl,
    nlsim: nlsim,
    nLt: nLt,
    nlt: nlt,
    nltri: nltri,
    nltrie: nltrie,
    nLtv: nLtv,
    nmid: nmid,
    NoBreak: NoBreak,
    NonBreakingSpace: NonBreakingSpace,
    nopf: nopf,
    Nopf: Nopf,
    Not: Not,
    not: not,
    NotCongruent: NotCongruent,
    NotCupCap: NotCupCap,
    NotDoubleVerticalBar: NotDoubleVerticalBar,
    NotElement: NotElement,
    NotEqual: NotEqual,
    NotEqualTilde: NotEqualTilde,
    NotExists: NotExists,
    NotGreater: NotGreater,
    NotGreaterEqual: NotGreaterEqual,
    NotGreaterFullEqual: NotGreaterFullEqual,
    NotGreaterGreater: NotGreaterGreater,
    NotGreaterLess: NotGreaterLess,
    NotGreaterSlantEqual: NotGreaterSlantEqual,
    NotGreaterTilde: NotGreaterTilde,
    NotHumpDownHump: NotHumpDownHump,
    NotHumpEqual: NotHumpEqual,
    notin: notin,
    notindot: notindot,
    notinE: notinE,
    notinva: notinva,
    notinvb: notinvb,
    notinvc: notinvc,
    NotLeftTriangleBar: NotLeftTriangleBar,
    NotLeftTriangle: NotLeftTriangle,
    NotLeftTriangleEqual: NotLeftTriangleEqual,
    NotLess: NotLess,
    NotLessEqual: NotLessEqual,
    NotLessGreater: NotLessGreater,
    NotLessLess: NotLessLess,
    NotLessSlantEqual: NotLessSlantEqual,
    NotLessTilde: NotLessTilde,
    NotNestedGreaterGreater: NotNestedGreaterGreater,
    NotNestedLessLess: NotNestedLessLess,
    notni: notni,
    notniva: notniva,
    notnivb: notnivb,
    notnivc: notnivc,
    NotPrecedes: NotPrecedes,
    NotPrecedesEqual: NotPrecedesEqual,
    NotPrecedesSlantEqual: NotPrecedesSlantEqual,
    NotReverseElement: NotReverseElement,
    NotRightTriangleBar: NotRightTriangleBar,
    NotRightTriangle: NotRightTriangle,
    NotRightTriangleEqual: NotRightTriangleEqual,
    NotSquareSubset: NotSquareSubset,
    NotSquareSubsetEqual: NotSquareSubsetEqual,
    NotSquareSuperset: NotSquareSuperset,
    NotSquareSupersetEqual: NotSquareSupersetEqual,
    NotSubset: NotSubset,
    NotSubsetEqual: NotSubsetEqual,
    NotSucceeds: NotSucceeds,
    NotSucceedsEqual: NotSucceedsEqual,
    NotSucceedsSlantEqual: NotSucceedsSlantEqual,
    NotSucceedsTilde: NotSucceedsTilde,
    NotSuperset: NotSuperset,
    NotSupersetEqual: NotSupersetEqual,
    NotTilde: NotTilde,
    NotTildeEqual: NotTildeEqual,
    NotTildeFullEqual: NotTildeFullEqual,
    NotTildeTilde: NotTildeTilde,
    NotVerticalBar: NotVerticalBar,
    nparallel: nparallel,
    npar: npar,
    nparsl: nparsl,
    npart: npart,
    npolint: npolint,
    npr: npr,
    nprcue: nprcue,
    nprec: nprec,
    npreceq: npreceq,
    npre: npre,
    nrarrc: nrarrc,
    nrarr: nrarr,
    nrArr: nrArr,
    nrarrw: nrarrw,
    nrightarrow: nrightarrow,
    nRightarrow: nRightarrow,
    nrtri: nrtri,
    nrtrie: nrtrie,
    nsc: nsc,
    nsccue: nsccue,
    nsce: nsce,
    Nscr: Nscr,
    nscr: nscr,
    nshortmid: nshortmid,
    nshortparallel: nshortparallel,
    nsim: nsim,
    nsime: nsime,
    nsimeq: nsimeq,
    nsmid: nsmid,
    nspar: nspar,
    nsqsube: nsqsube,
    nsqsupe: nsqsupe,
    nsub: nsub,
    nsubE: nsubE,
    nsube: nsube,
    nsubset: nsubset,
    nsubseteq: nsubseteq,
    nsubseteqq: nsubseteqq,
    nsucc: nsucc,
    nsucceq: nsucceq,
    nsup: nsup,
    nsupE: nsupE,
    nsupe: nsupe,
    nsupset: nsupset,
    nsupseteq: nsupseteq,
    nsupseteqq: nsupseteqq,
    ntgl: ntgl,
    Ntilde: Ntilde,
    ntilde: ntilde,
    ntlg: ntlg,
    ntriangleleft: ntriangleleft,
    ntrianglelefteq: ntrianglelefteq,
    ntriangleright: ntriangleright,
    ntrianglerighteq: ntrianglerighteq,
    Nu: Nu,
    nu: nu,
    num: num,
    numero: numero,
    numsp: numsp,
    nvap: nvap,
    nvdash: nvdash,
    nvDash: nvDash,
    nVdash: nVdash,
    nVDash: nVDash,
    nvge: nvge,
    nvgt: nvgt,
    nvHarr: nvHarr,
    nvinfin: nvinfin,
    nvlArr: nvlArr,
    nvle: nvle,
    nvlt: nvlt,
    nvltrie: nvltrie,
    nvrArr: nvrArr,
    nvrtrie: nvrtrie,
    nvsim: nvsim,
    nwarhk: nwarhk,
    nwarr: nwarr,
    nwArr: nwArr,
    nwarrow: nwarrow,
    nwnear: nwnear,
    Oacute: Oacute,
    oacute: oacute,
    oast: oast,
    Ocirc: Ocirc,
    ocirc: ocirc,
    ocir: ocir,
    Ocy: Ocy,
    ocy: ocy,
    odash: odash,
    Odblac: Odblac,
    odblac: odblac,
    odiv: odiv,
    odot: odot,
    odsold: odsold,
    OElig: OElig,
    oelig: oelig,
    ofcir: ofcir,
    Ofr: Ofr,
    ofr: ofr,
    ogon: ogon,
    Ograve: Ograve,
    ograve: ograve,
    ogt: ogt,
    ohbar: ohbar,
    ohm: ohm,
    oint: oint,
    olarr: olarr,
    olcir: olcir,
    olcross: olcross,
    oline: oline,
    olt: olt,
    Omacr: Omacr,
    omacr: omacr,
    Omega: Omega,
    omega: omega,
    Omicron: Omicron,
    omicron: omicron,
    omid: omid,
    ominus: ominus,
    Oopf: Oopf,
    oopf: oopf,
    opar: opar,
    OpenCurlyDoubleQuote: OpenCurlyDoubleQuote,
    OpenCurlyQuote: OpenCurlyQuote,
    operp: operp,
    oplus: oplus,
    orarr: orarr,
    Or: Or,
    or: or,
    ord: ord,
    order: order,
    orderof: orderof,
    ordf: ordf,
    ordm: ordm,
    origof: origof,
    oror: oror,
    orslope: orslope,
    orv: orv,
    oS: oS,
    Oscr: Oscr,
    oscr: oscr,
    Oslash: Oslash,
    oslash: oslash,
    osol: osol,
    Otilde: Otilde,
    otilde: otilde,
    otimesas: otimesas,
    Otimes: Otimes,
    otimes: otimes,
    Ouml: Ouml,
    ouml: ouml,
    ovbar: ovbar,
    OverBar: OverBar,
    OverBrace: OverBrace,
    OverBracket: OverBracket,
    OverParenthesis: OverParenthesis,
    para: para,
    parallel: parallel,
    par: par,
    parsim: parsim,
    parsl: parsl,
    part: part,
    PartialD: PartialD,
    Pcy: Pcy,
    pcy: pcy,
    percnt: percnt,
    period: period,
    permil: permil,
    perp: perp,
    pertenk: pertenk,
    Pfr: Pfr,
    pfr: pfr,
    Phi: Phi,
    phi: phi,
    phiv: phiv,
    phmmat: phmmat,
    phone: phone,
    Pi: Pi,
    pi: pi,
    pitchfork: pitchfork,
    piv: piv,
    planck: planck,
    planckh: planckh,
    plankv: plankv,
    plusacir: plusacir,
    plusb: plusb,
    pluscir: pluscir,
    plus: plus,
    plusdo: plusdo,
    plusdu: plusdu,
    pluse: pluse,
    PlusMinus: PlusMinus,
    plusmn: plusmn,
    plussim: plussim,
    plustwo: plustwo,
    pm: pm,
    Poincareplane: Poincareplane,
    pointint: pointint,
    popf: popf,
    Popf: Popf,
    pound: pound,
    prap: prap,
    Pr: Pr,
    pr: pr,
    prcue: prcue,
    precapprox: precapprox,
    prec: prec,
    preccurlyeq: preccurlyeq,
    Precedes: Precedes,
    PrecedesEqual: PrecedesEqual,
    PrecedesSlantEqual: PrecedesSlantEqual,
    PrecedesTilde: PrecedesTilde,
    preceq: preceq,
    precnapprox: precnapprox,
    precneqq: precneqq,
    precnsim: precnsim,
    pre: pre,
    prE: prE,
    precsim: precsim,
    prime: prime,
    Prime: Prime,
    primes: primes,
    prnap: prnap,
    prnE: prnE,
    prnsim: prnsim,
    prod: prod,
    Product: Product,
    profalar: profalar,
    profline: profline,
    profsurf: profsurf,
    prop: prop,
    Proportional: Proportional,
    Proportion: Proportion,
    propto: propto,
    prsim: prsim,
    prurel: prurel,
    Pscr: Pscr,
    pscr: pscr,
    Psi: Psi,
    psi: psi,
    puncsp: puncsp,
    Qfr: Qfr,
    qfr: qfr,
    qint: qint,
    qopf: qopf,
    Qopf: Qopf,
    qprime: qprime,
    Qscr: Qscr,
    qscr: qscr,
    quaternions: quaternions,
    quatint: quatint,
    quest: quest,
    questeq: questeq,
    quot: quot,
    QUOT: QUOT,
    rAarr: rAarr,
    race: race,
    Racute: Racute,
    racute: racute,
    radic: radic,
    raemptyv: raemptyv,
    rang: rang,
    Rang: Rang,
    rangd: rangd,
    range: range,
    rangle: rangle,
    raquo: raquo,
    rarrap: rarrap,
    rarrb: rarrb,
    rarrbfs: rarrbfs,
    rarrc: rarrc,
    rarr: rarr,
    Rarr: Rarr,
    rArr: rArr,
    rarrfs: rarrfs,
    rarrhk: rarrhk,
    rarrlp: rarrlp,
    rarrpl: rarrpl,
    rarrsim: rarrsim,
    Rarrtl: Rarrtl,
    rarrtl: rarrtl,
    rarrw: rarrw,
    ratail: ratail,
    rAtail: rAtail,
    ratio: ratio,
    rationals: rationals,
    rbarr: rbarr,
    rBarr: rBarr,
    RBarr: RBarr,
    rbbrk: rbbrk,
    rbrace: rbrace,
    rbrack: rbrack,
    rbrke: rbrke,
    rbrksld: rbrksld,
    rbrkslu: rbrkslu,
    Rcaron: Rcaron,
    rcaron: rcaron,
    Rcedil: Rcedil,
    rcedil: rcedil,
    rceil: rceil,
    rcub: rcub,
    Rcy: Rcy,
    rcy: rcy,
    rdca: rdca,
    rdldhar: rdldhar,
    rdquo: rdquo,
    rdquor: rdquor,
    rdsh: rdsh,
    real: real,
    realine: realine,
    realpart: realpart,
    reals: reals,
    Re: Re,
    rect: rect,
    reg: reg,
    REG: REG,
    ReverseElement: ReverseElement,
    ReverseEquilibrium: ReverseEquilibrium,
    ReverseUpEquilibrium: ReverseUpEquilibrium,
    rfisht: rfisht,
    rfloor: rfloor,
    rfr: rfr,
    Rfr: Rfr,
    rHar: rHar,
    rhard: rhard,
    rharu: rharu,
    rharul: rharul,
    Rho: Rho,
    rho: rho,
    rhov: rhov,
    RightAngleBracket: RightAngleBracket,
    RightArrowBar: RightArrowBar,
    rightarrow: rightarrow,
    RightArrow: RightArrow,
    Rightarrow: Rightarrow,
    RightArrowLeftArrow: RightArrowLeftArrow,
    rightarrowtail: rightarrowtail,
    RightCeiling: RightCeiling,
    RightDoubleBracket: RightDoubleBracket,
    RightDownTeeVector: RightDownTeeVector,
    RightDownVectorBar: RightDownVectorBar,
    RightDownVector: RightDownVector,
    RightFloor: RightFloor,
    rightharpoondown: rightharpoondown,
    rightharpoonup: rightharpoonup,
    rightleftarrows: rightleftarrows,
    rightleftharpoons: rightleftharpoons,
    rightrightarrows: rightrightarrows,
    rightsquigarrow: rightsquigarrow,
    RightTeeArrow: RightTeeArrow,
    RightTee: RightTee,
    RightTeeVector: RightTeeVector,
    rightthreetimes: rightthreetimes,
    RightTriangleBar: RightTriangleBar,
    RightTriangle: RightTriangle,
    RightTriangleEqual: RightTriangleEqual,
    RightUpDownVector: RightUpDownVector,
    RightUpTeeVector: RightUpTeeVector,
    RightUpVectorBar: RightUpVectorBar,
    RightUpVector: RightUpVector,
    RightVectorBar: RightVectorBar,
    RightVector: RightVector,
    ring: ring,
    risingdotseq: risingdotseq,
    rlarr: rlarr,
    rlhar: rlhar,
    rlm: rlm,
    rmoustache: rmoustache,
    rmoust: rmoust,
    rnmid: rnmid,
    roang: roang,
    roarr: roarr,
    robrk: robrk,
    ropar: ropar,
    ropf: ropf,
    Ropf: Ropf,
    roplus: roplus,
    rotimes: rotimes,
    RoundImplies: RoundImplies,
    rpar: rpar,
    rpargt: rpargt,
    rppolint: rppolint,
    rrarr: rrarr,
    Rrightarrow: Rrightarrow,
    rsaquo: rsaquo,
    rscr: rscr,
    Rscr: Rscr,
    rsh: rsh,
    Rsh: Rsh,
    rsqb: rsqb,
    rsquo: rsquo,
    rsquor: rsquor,
    rthree: rthree,
    rtimes: rtimes,
    rtri: rtri,
    rtrie: rtrie,
    rtrif: rtrif,
    rtriltri: rtriltri,
    RuleDelayed: RuleDelayed,
    ruluhar: ruluhar,
    rx: rx,
    Sacute: Sacute,
    sacute: sacute,
    sbquo: sbquo,
    scap: scap,
    Scaron: Scaron,
    scaron: scaron,
    Sc: Sc,
    sc: sc,
    sccue: sccue,
    sce: sce,
    scE: scE,
    Scedil: Scedil,
    scedil: scedil,
    Scirc: Scirc,
    scirc: scirc,
    scnap: scnap,
    scnE: scnE,
    scnsim: scnsim,
    scpolint: scpolint,
    scsim: scsim,
    Scy: Scy,
    scy: scy,
    sdotb: sdotb,
    sdot: sdot,
    sdote: sdote,
    searhk: searhk,
    searr: searr,
    seArr: seArr,
    searrow: searrow,
    sect: sect,
    semi: semi,
    seswar: seswar,
    setminus: setminus,
    setmn: setmn,
    sext: sext,
    Sfr: Sfr,
    sfr: sfr,
    sfrown: sfrown,
    sharp: sharp,
    SHCHcy: SHCHcy,
    shchcy: shchcy,
    SHcy: SHcy,
    shcy: shcy,
    ShortDownArrow: ShortDownArrow,
    ShortLeftArrow: ShortLeftArrow,
    shortmid: shortmid,
    shortparallel: shortparallel,
    ShortRightArrow: ShortRightArrow,
    ShortUpArrow: ShortUpArrow,
    shy: shy,
    Sigma: Sigma,
    sigma: sigma,
    sigmaf: sigmaf,
    sigmav: sigmav,
    sim: sim,
    simdot: simdot,
    sime: sime,
    simeq: simeq,
    simg: simg,
    simgE: simgE,
    siml: siml,
    simlE: simlE,
    simne: simne,
    simplus: simplus,
    simrarr: simrarr,
    slarr: slarr,
    SmallCircle: SmallCircle,
    smallsetminus: smallsetminus,
    smashp: smashp,
    smeparsl: smeparsl,
    smid: smid,
    smile: smile,
    smt: smt,
    smte: smte,
    smtes: smtes,
    SOFTcy: SOFTcy,
    softcy: softcy,
    solbar: solbar,
    solb: solb,
    sol: sol,
    Sopf: Sopf,
    sopf: sopf,
    spades: spades,
    spadesuit: spadesuit,
    spar: spar,
    sqcap: sqcap,
    sqcaps: sqcaps,
    sqcup: sqcup,
    sqcups: sqcups,
    Sqrt: Sqrt,
    sqsub: sqsub,
    sqsube: sqsube,
    sqsubset: sqsubset,
    sqsubseteq: sqsubseteq,
    sqsup: sqsup,
    sqsupe: sqsupe,
    sqsupset: sqsupset,
    sqsupseteq: sqsupseteq,
    square: square,
    Square: Square,
    SquareIntersection: SquareIntersection,
    SquareSubset: SquareSubset,
    SquareSubsetEqual: SquareSubsetEqual,
    SquareSuperset: SquareSuperset,
    SquareSupersetEqual: SquareSupersetEqual,
    SquareUnion: SquareUnion,
    squarf: squarf,
    squ: squ,
    squf: squf,
    srarr: srarr,
    Sscr: Sscr,
    sscr: sscr,
    ssetmn: ssetmn,
    ssmile: ssmile,
    sstarf: sstarf,
    Star: Star,
    star: star,
    starf: starf,
    straightepsilon: straightepsilon,
    straightphi: straightphi,
    strns: strns,
    sub: sub,
    Sub: Sub,
    subdot: subdot,
    subE: subE,
    sube: sube,
    subedot: subedot,
    submult: submult,
    subnE: subnE,
    subne: subne,
    subplus: subplus,
    subrarr: subrarr,
    subset: subset,
    Subset: Subset,
    subseteq: subseteq,
    subseteqq: subseteqq,
    SubsetEqual: SubsetEqual,
    subsetneq: subsetneq,
    subsetneqq: subsetneqq,
    subsim: subsim,
    subsub: subsub,
    subsup: subsup,
    succapprox: succapprox,
    succ: succ,
    succcurlyeq: succcurlyeq,
    Succeeds: Succeeds,
    SucceedsEqual: SucceedsEqual,
    SucceedsSlantEqual: SucceedsSlantEqual,
    SucceedsTilde: SucceedsTilde,
    succeq: succeq,
    succnapprox: succnapprox,
    succneqq: succneqq,
    succnsim: succnsim,
    succsim: succsim,
    SuchThat: SuchThat,
    sum: sum,
    Sum: Sum,
    sung: sung,
    sup1: sup1,
    sup2: sup2,
    sup3: sup3,
    sup: sup,
    Sup: Sup,
    supdot: supdot,
    supdsub: supdsub,
    supE: supE,
    supe: supe,
    supedot: supedot,
    Superset: Superset,
    SupersetEqual: SupersetEqual,
    suphsol: suphsol,
    suphsub: suphsub,
    suplarr: suplarr,
    supmult: supmult,
    supnE: supnE,
    supne: supne,
    supplus: supplus,
    supset: supset,
    Supset: Supset,
    supseteq: supseteq,
    supseteqq: supseteqq,
    supsetneq: supsetneq,
    supsetneqq: supsetneqq,
    supsim: supsim,
    supsub: supsub,
    supsup: supsup,
    swarhk: swarhk,
    swarr: swarr,
    swArr: swArr,
    swarrow: swarrow,
    swnwar: swnwar,
    szlig: szlig,
    Tab: Tab,
    target: target,
    Tau: Tau,
    tau: tau,
    tbrk: tbrk,
    Tcaron: Tcaron,
    tcaron: tcaron,
    Tcedil: Tcedil,
    tcedil: tcedil,
    Tcy: Tcy,
    tcy: tcy,
    tdot: tdot,
    telrec: telrec,
    Tfr: Tfr,
    tfr: tfr,
    there4: there4,
    therefore: therefore,
    Therefore: Therefore,
    Theta: Theta,
    theta: theta,
    thetasym: thetasym,
    thetav: thetav,
    thickapprox: thickapprox,
    thicksim: thicksim,
    ThickSpace: ThickSpace,
    ThinSpace: ThinSpace,
    thinsp: thinsp,
    thkap: thkap,
    thksim: thksim,
    THORN: THORN,
    thorn: thorn,
    tilde: tilde,
    Tilde: Tilde,
    TildeEqual: TildeEqual,
    TildeFullEqual: TildeFullEqual,
    TildeTilde: TildeTilde,
    timesbar: timesbar,
    timesb: timesb,
    times: times,
    timesd: timesd,
    tint: tint,
    toea: toea,
    topbot: topbot,
    topcir: topcir,
    top: top,
    Topf: Topf,
    topf: topf,
    topfork: topfork,
    tosa: tosa,
    tprime: tprime,
    trade: trade,
    TRADE: TRADE,
    triangle: triangle,
    triangledown: triangledown,
    triangleleft: triangleleft,
    trianglelefteq: trianglelefteq,
    triangleq: triangleq,
    triangleright: triangleright,
    trianglerighteq: trianglerighteq,
    tridot: tridot,
    trie: trie,
    triminus: triminus,
    TripleDot: TripleDot,
    triplus: triplus,
    trisb: trisb,
    tritime: tritime,
    trpezium: trpezium,
    Tscr: Tscr,
    tscr: tscr,
    TScy: TScy,
    tscy: tscy,
    TSHcy: TSHcy,
    tshcy: tshcy,
    Tstrok: Tstrok,
    tstrok: tstrok,
    twixt: twixt,
    twoheadleftarrow: twoheadleftarrow,
    twoheadrightarrow: twoheadrightarrow,
    Uacute: Uacute,
    uacute: uacute,
    uarr: uarr,
    Uarr: Uarr,
    uArr: uArr,
    Uarrocir: Uarrocir,
    Ubrcy: Ubrcy,
    ubrcy: ubrcy,
    Ubreve: Ubreve,
    ubreve: ubreve,
    Ucirc: Ucirc,
    ucirc: ucirc,
    Ucy: Ucy,
    ucy: ucy,
    udarr: udarr,
    Udblac: Udblac,
    udblac: udblac,
    udhar: udhar,
    ufisht: ufisht,
    Ufr: Ufr,
    ufr: ufr,
    Ugrave: Ugrave,
    ugrave: ugrave,
    uHar: uHar,
    uharl: uharl,
    uharr: uharr,
    uhblk: uhblk,
    ulcorn: ulcorn,
    ulcorner: ulcorner,
    ulcrop: ulcrop,
    ultri: ultri,
    Umacr: Umacr,
    umacr: umacr,
    uml: uml,
    UnderBar: UnderBar,
    UnderBrace: UnderBrace,
    UnderBracket: UnderBracket,
    UnderParenthesis: UnderParenthesis,
    Union: Union,
    UnionPlus: UnionPlus,
    Uogon: Uogon,
    uogon: uogon,
    Uopf: Uopf,
    uopf: uopf,
    UpArrowBar: UpArrowBar,
    uparrow: uparrow,
    UpArrow: UpArrow,
    Uparrow: Uparrow,
    UpArrowDownArrow: UpArrowDownArrow,
    updownarrow: updownarrow,
    UpDownArrow: UpDownArrow,
    Updownarrow: Updownarrow,
    UpEquilibrium: UpEquilibrium,
    upharpoonleft: upharpoonleft,
    upharpoonright: upharpoonright,
    uplus: uplus,
    UpperLeftArrow: UpperLeftArrow,
    UpperRightArrow: UpperRightArrow,
    upsi: upsi,
    Upsi: Upsi,
    upsih: upsih,
    Upsilon: Upsilon,
    upsilon: upsilon,
    UpTeeArrow: UpTeeArrow,
    UpTee: UpTee,
    upuparrows: upuparrows,
    urcorn: urcorn,
    urcorner: urcorner,
    urcrop: urcrop,
    Uring: Uring,
    uring: uring,
    urtri: urtri,
    Uscr: Uscr,
    uscr: uscr,
    utdot: utdot,
    Utilde: Utilde,
    utilde: utilde,
    utri: utri,
    utrif: utrif,
    uuarr: uuarr,
    Uuml: Uuml,
    uuml: uuml,
    uwangle: uwangle,
    vangrt: vangrt,
    varepsilon: varepsilon,
    varkappa: varkappa,
    varnothing: varnothing,
    varphi: varphi,
    varpi: varpi,
    varpropto: varpropto,
    varr: varr,
    vArr: vArr,
    varrho: varrho,
    varsigma: varsigma,
    varsubsetneq: varsubsetneq,
    varsubsetneqq: varsubsetneqq,
    varsupsetneq: varsupsetneq,
    varsupsetneqq: varsupsetneqq,
    vartheta: vartheta,
    vartriangleleft: vartriangleleft,
    vartriangleright: vartriangleright,
    vBar: vBar,
    Vbar: Vbar,
    vBarv: vBarv,
    Vcy: Vcy,
    vcy: vcy,
    vdash: vdash,
    vDash: vDash,
    Vdash: Vdash,
    VDash: VDash,
    Vdashl: Vdashl,
    veebar: veebar,
    vee: vee,
    Vee: Vee,
    veeeq: veeeq,
    vellip: vellip,
    verbar: verbar,
    Verbar: Verbar,
    vert: vert,
    Vert: Vert,
    VerticalBar: VerticalBar,
    VerticalLine: VerticalLine,
    VerticalSeparator: VerticalSeparator,
    VerticalTilde: VerticalTilde,
    VeryThinSpace: VeryThinSpace,
    Vfr: Vfr,
    vfr: vfr,
    vltri: vltri,
    vnsub: vnsub,
    vnsup: vnsup,
    Vopf: Vopf,
    vopf: vopf,
    vprop: vprop,
    vrtri: vrtri,
    Vscr: Vscr,
    vscr: vscr,
    vsubnE: vsubnE,
    vsubne: vsubne,
    vsupnE: vsupnE,
    vsupne: vsupne,
    Vvdash: Vvdash,
    vzigzag: vzigzag,
    Wcirc: Wcirc,
    wcirc: wcirc,
    wedbar: wedbar,
    wedge: wedge,
    Wedge: Wedge,
    wedgeq: wedgeq,
    weierp: weierp,
    Wfr: Wfr,
    wfr: wfr,
    Wopf: Wopf,
    wopf: wopf,
    wp: wp,
    wr: wr,
    wreath: wreath,
    Wscr: Wscr,
    wscr: wscr,
    xcap: xcap,
    xcirc: xcirc,
    xcup: xcup,
    xdtri: xdtri,
    Xfr: Xfr,
    xfr: xfr,
    xharr: xharr,
    xhArr: xhArr,
    Xi: Xi,
    xi: xi,
    xlarr: xlarr,
    xlArr: xlArr,
    xmap: xmap,
    xnis: xnis,
    xodot: xodot,
    Xopf: Xopf,
    xopf: xopf,
    xoplus: xoplus,
    xotime: xotime,
    xrarr: xrarr,
    xrArr: xrArr,
    Xscr: Xscr,
    xscr: xscr,
    xsqcup: xsqcup,
    xuplus: xuplus,
    xutri: xutri,
    xvee: xvee,
    xwedge: xwedge,
    Yacute: Yacute,
    yacute: yacute,
    YAcy: YAcy,
    yacy: yacy,
    Ycirc: Ycirc,
    ycirc: ycirc,
    Ycy: Ycy,
    ycy: ycy,
    yen: yen,
    Yfr: Yfr,
    yfr: yfr,
    YIcy: YIcy,
    yicy: yicy,
    Yopf: Yopf,
    yopf: yopf,
    Yscr: Yscr,
    yscr: yscr,
    YUcy: YUcy,
    yucy: yucy,
    yuml: yuml,
    Yuml: Yuml,
    Zacute: Zacute,
    zacute: zacute,
    Zcaron: Zcaron,
    zcaron: zcaron,
    Zcy: Zcy,
    zcy: zcy,
    Zdot: Zdot,
    zdot: zdot,
    zeetrf: zeetrf,
    ZeroWidthSpace: ZeroWidthSpace,
    Zeta: Zeta,
    zeta: zeta,
    zfr: zfr,
    Zfr: Zfr,
    ZHcy: ZHcy,
    zhcy: zhcy,
    zigrarr: zigrarr,
    zopf: zopf,
    Zopf: Zopf,
    Zscr: Zscr,
    zscr: zscr,
    zwj: zwj,
    zwnj: zwnj,
    'default': entities
  });

  var Aacute$1 = "Á";
  var aacute$1 = "á";
  var Acirc$1 = "Â";
  var acirc$1 = "â";
  var acute$1 = "´";
  var AElig$1 = "Æ";
  var aelig$1 = "æ";
  var Agrave$1 = "À";
  var agrave$1 = "à";
  var amp$1 = "&";
  var AMP$1 = "&";
  var Aring$1 = "Å";
  var aring$1 = "å";
  var Atilde$1 = "Ã";
  var atilde$1 = "ã";
  var Auml$1 = "Ä";
  var auml$1 = "ä";
  var brvbar$1 = "¦";
  var Ccedil$1 = "Ç";
  var ccedil$1 = "ç";
  var cedil$1 = "¸";
  var cent$1 = "¢";
  var copy$1 = "©";
  var COPY$1 = "©";
  var curren$1 = "¤";
  var deg$1 = "°";
  var divide$1 = "÷";
  var Eacute$1 = "É";
  var eacute$1 = "é";
  var Ecirc$1 = "Ê";
  var ecirc$1 = "ê";
  var Egrave$1 = "È";
  var egrave$1 = "è";
  var ETH$1 = "Ð";
  var eth$1 = "ð";
  var Euml$1 = "Ë";
  var euml$1 = "ë";
  var frac12$1 = "½";
  var frac14$1 = "¼";
  var frac34$1 = "¾";
  var gt$1 = ">";
  var GT$1 = ">";
  var Iacute$1 = "Í";
  var iacute$1 = "í";
  var Icirc$1 = "Î";
  var icirc$1 = "î";
  var iexcl$1 = "¡";
  var Igrave$1 = "Ì";
  var igrave$1 = "ì";
  var iquest$1 = "¿";
  var Iuml$1 = "Ï";
  var iuml$1 = "ï";
  var laquo$1 = "«";
  var lt$1 = "<";
  var LT$1 = "<";
  var macr$1 = "¯";
  var micro$1 = "µ";
  var middot$1 = "·";
  var nbsp$1 = " ";
  var not$1 = "¬";
  var Ntilde$1 = "Ñ";
  var ntilde$1 = "ñ";
  var Oacute$1 = "Ó";
  var oacute$1 = "ó";
  var Ocirc$1 = "Ô";
  var ocirc$1 = "ô";
  var Ograve$1 = "Ò";
  var ograve$1 = "ò";
  var ordf$1 = "ª";
  var ordm$1 = "º";
  var Oslash$1 = "Ø";
  var oslash$1 = "ø";
  var Otilde$1 = "Õ";
  var otilde$1 = "õ";
  var Ouml$1 = "Ö";
  var ouml$1 = "ö";
  var para$1 = "¶";
  var plusmn$1 = "±";
  var pound$1 = "£";
  var quot$1 = "\"";
  var QUOT$1 = "\"";
  var raquo$1 = "»";
  var reg$1 = "®";
  var REG$1 = "®";
  var sect$1 = "§";
  var shy$1 = "­";
  var sup1$1 = "¹";
  var sup2$1 = "²";
  var sup3$1 = "³";
  var szlig$1 = "ß";
  var THORN$1 = "Þ";
  var thorn$1 = "þ";
  var times$1 = "×";
  var Uacute$1 = "Ú";
  var uacute$1 = "ú";
  var Ucirc$1 = "Û";
  var ucirc$1 = "û";
  var Ugrave$1 = "Ù";
  var ugrave$1 = "ù";
  var uml$1 = "¨";
  var Uuml$1 = "Ü";
  var uuml$1 = "ü";
  var Yacute$1 = "Ý";
  var yacute$1 = "ý";
  var yen$1 = "¥";
  var yuml$1 = "ÿ";
  var legacy = {
  	Aacute: Aacute$1,
  	aacute: aacute$1,
  	Acirc: Acirc$1,
  	acirc: acirc$1,
  	acute: acute$1,
  	AElig: AElig$1,
  	aelig: aelig$1,
  	Agrave: Agrave$1,
  	agrave: agrave$1,
  	amp: amp$1,
  	AMP: AMP$1,
  	Aring: Aring$1,
  	aring: aring$1,
  	Atilde: Atilde$1,
  	atilde: atilde$1,
  	Auml: Auml$1,
  	auml: auml$1,
  	brvbar: brvbar$1,
  	Ccedil: Ccedil$1,
  	ccedil: ccedil$1,
  	cedil: cedil$1,
  	cent: cent$1,
  	copy: copy$1,
  	COPY: COPY$1,
  	curren: curren$1,
  	deg: deg$1,
  	divide: divide$1,
  	Eacute: Eacute$1,
  	eacute: eacute$1,
  	Ecirc: Ecirc$1,
  	ecirc: ecirc$1,
  	Egrave: Egrave$1,
  	egrave: egrave$1,
  	ETH: ETH$1,
  	eth: eth$1,
  	Euml: Euml$1,
  	euml: euml$1,
  	frac12: frac12$1,
  	frac14: frac14$1,
  	frac34: frac34$1,
  	gt: gt$1,
  	GT: GT$1,
  	Iacute: Iacute$1,
  	iacute: iacute$1,
  	Icirc: Icirc$1,
  	icirc: icirc$1,
  	iexcl: iexcl$1,
  	Igrave: Igrave$1,
  	igrave: igrave$1,
  	iquest: iquest$1,
  	Iuml: Iuml$1,
  	iuml: iuml$1,
  	laquo: laquo$1,
  	lt: lt$1,
  	LT: LT$1,
  	macr: macr$1,
  	micro: micro$1,
  	middot: middot$1,
  	nbsp: nbsp$1,
  	not: not$1,
  	Ntilde: Ntilde$1,
  	ntilde: ntilde$1,
  	Oacute: Oacute$1,
  	oacute: oacute$1,
  	Ocirc: Ocirc$1,
  	ocirc: ocirc$1,
  	Ograve: Ograve$1,
  	ograve: ograve$1,
  	ordf: ordf$1,
  	ordm: ordm$1,
  	Oslash: Oslash$1,
  	oslash: oslash$1,
  	Otilde: Otilde$1,
  	otilde: otilde$1,
  	Ouml: Ouml$1,
  	ouml: ouml$1,
  	para: para$1,
  	plusmn: plusmn$1,
  	pound: pound$1,
  	quot: quot$1,
  	QUOT: QUOT$1,
  	raquo: raquo$1,
  	reg: reg$1,
  	REG: REG$1,
  	sect: sect$1,
  	shy: shy$1,
  	sup1: sup1$1,
  	sup2: sup2$1,
  	sup3: sup3$1,
  	szlig: szlig$1,
  	THORN: THORN$1,
  	thorn: thorn$1,
  	times: times$1,
  	Uacute: Uacute$1,
  	uacute: uacute$1,
  	Ucirc: Ucirc$1,
  	ucirc: ucirc$1,
  	Ugrave: Ugrave$1,
  	ugrave: ugrave$1,
  	uml: uml$1,
  	Uuml: Uuml$1,
  	uuml: uuml$1,
  	Yacute: Yacute$1,
  	yacute: yacute$1,
  	yen: yen$1,
  	yuml: yuml$1
  };

  var legacy$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    Aacute: Aacute$1,
    aacute: aacute$1,
    Acirc: Acirc$1,
    acirc: acirc$1,
    acute: acute$1,
    AElig: AElig$1,
    aelig: aelig$1,
    Agrave: Agrave$1,
    agrave: agrave$1,
    amp: amp$1,
    AMP: AMP$1,
    Aring: Aring$1,
    aring: aring$1,
    Atilde: Atilde$1,
    atilde: atilde$1,
    Auml: Auml$1,
    auml: auml$1,
    brvbar: brvbar$1,
    Ccedil: Ccedil$1,
    ccedil: ccedil$1,
    cedil: cedil$1,
    cent: cent$1,
    copy: copy$1,
    COPY: COPY$1,
    curren: curren$1,
    deg: deg$1,
    divide: divide$1,
    Eacute: Eacute$1,
    eacute: eacute$1,
    Ecirc: Ecirc$1,
    ecirc: ecirc$1,
    Egrave: Egrave$1,
    egrave: egrave$1,
    ETH: ETH$1,
    eth: eth$1,
    Euml: Euml$1,
    euml: euml$1,
    frac12: frac12$1,
    frac14: frac14$1,
    frac34: frac34$1,
    gt: gt$1,
    GT: GT$1,
    Iacute: Iacute$1,
    iacute: iacute$1,
    Icirc: Icirc$1,
    icirc: icirc$1,
    iexcl: iexcl$1,
    Igrave: Igrave$1,
    igrave: igrave$1,
    iquest: iquest$1,
    Iuml: Iuml$1,
    iuml: iuml$1,
    laquo: laquo$1,
    lt: lt$1,
    LT: LT$1,
    macr: macr$1,
    micro: micro$1,
    middot: middot$1,
    nbsp: nbsp$1,
    not: not$1,
    Ntilde: Ntilde$1,
    ntilde: ntilde$1,
    Oacute: Oacute$1,
    oacute: oacute$1,
    Ocirc: Ocirc$1,
    ocirc: ocirc$1,
    Ograve: Ograve$1,
    ograve: ograve$1,
    ordf: ordf$1,
    ordm: ordm$1,
    Oslash: Oslash$1,
    oslash: oslash$1,
    Otilde: Otilde$1,
    otilde: otilde$1,
    Ouml: Ouml$1,
    ouml: ouml$1,
    para: para$1,
    plusmn: plusmn$1,
    pound: pound$1,
    quot: quot$1,
    QUOT: QUOT$1,
    raquo: raquo$1,
    reg: reg$1,
    REG: REG$1,
    sect: sect$1,
    shy: shy$1,
    sup1: sup1$1,
    sup2: sup2$1,
    sup3: sup3$1,
    szlig: szlig$1,
    THORN: THORN$1,
    thorn: thorn$1,
    times: times$1,
    Uacute: Uacute$1,
    uacute: uacute$1,
    Ucirc: Ucirc$1,
    ucirc: ucirc$1,
    Ugrave: Ugrave$1,
    ugrave: ugrave$1,
    uml: uml$1,
    Uuml: Uuml$1,
    uuml: uuml$1,
    Yacute: Yacute$1,
    yacute: yacute$1,
    yen: yen$1,
    yuml: yuml$1,
    'default': legacy
  });

  var amp$2 = "&";
  var apos$1 = "'";
  var gt$2 = ">";
  var lt$2 = "<";
  var quot$2 = "\"";
  var xml = {
  	amp: amp$2,
  	apos: apos$1,
  	gt: gt$2,
  	lt: lt$2,
  	quot: quot$2
  };

  var xml$1 = /*#__PURE__*/Object.freeze({
    __proto__: null,
    amp: amp$2,
    apos: apos$1,
    gt: gt$2,
    lt: lt$2,
    quot: quot$2,
    'default': xml
  });

  var require$$1 = getCjsExportFromNamespace(entities$1);

  var require$$1$1 = getCjsExportFromNamespace(legacy$1);

  var require$$0$1 = getCjsExportFromNamespace(xml$1);

  var Tokenizer_1 = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var decode_codepoint_1 = __importDefault(decode_codepoint);
  var entities_json_1 = __importDefault(require$$1);
  var legacy_json_1 = __importDefault(require$$1$1);
  var xml_json_1 = __importDefault(require$$0$1);
  function whitespace(c) {
      return c === " " || c === "\n" || c === "\t" || c === "\f" || c === "\r";
  }
  function ifElseState(upper, SUCCESS, FAILURE) {
      var lower = upper.toLowerCase();
      if (upper === lower) {
          return function (t, c) {
              if (c === lower) {
                  t._state = SUCCESS;
              }
              else {
                  t._state = FAILURE;
                  t._index--;
              }
          };
      }
      else {
          return function (t, c) {
              if (c === lower || c === upper) {
                  t._state = SUCCESS;
              }
              else {
                  t._state = FAILURE;
                  t._index--;
              }
          };
      }
  }
  function consumeSpecialNameChar(upper, NEXT_STATE) {
      var lower = upper.toLowerCase();
      return function (t, c) {
          if (c === lower || c === upper) {
              t._state = NEXT_STATE;
          }
          else {
              t._state = 3 /* InTagName */;
              t._index--; //consume the token again
          }
      };
  }
  var stateBeforeCdata1 = ifElseState("C", 23 /* BeforeCdata2 */, 16 /* InDeclaration */);
  var stateBeforeCdata2 = ifElseState("D", 24 /* BeforeCdata3 */, 16 /* InDeclaration */);
  var stateBeforeCdata3 = ifElseState("A", 25 /* BeforeCdata4 */, 16 /* InDeclaration */);
  var stateBeforeCdata4 = ifElseState("T", 26 /* BeforeCdata5 */, 16 /* InDeclaration */);
  var stateBeforeCdata5 = ifElseState("A", 27 /* BeforeCdata6 */, 16 /* InDeclaration */);
  var stateBeforeScript1 = consumeSpecialNameChar("R", 34 /* BeforeScript2 */);
  var stateBeforeScript2 = consumeSpecialNameChar("I", 35 /* BeforeScript3 */);
  var stateBeforeScript3 = consumeSpecialNameChar("P", 36 /* BeforeScript4 */);
  var stateBeforeScript4 = consumeSpecialNameChar("T", 37 /* BeforeScript5 */);
  var stateAfterScript1 = ifElseState("R", 39 /* AfterScript2 */, 1 /* Text */);
  var stateAfterScript2 = ifElseState("I", 40 /* AfterScript3 */, 1 /* Text */);
  var stateAfterScript3 = ifElseState("P", 41 /* AfterScript4 */, 1 /* Text */);
  var stateAfterScript4 = ifElseState("T", 42 /* AfterScript5 */, 1 /* Text */);
  var stateBeforeStyle1 = consumeSpecialNameChar("Y", 44 /* BeforeStyle2 */);
  var stateBeforeStyle2 = consumeSpecialNameChar("L", 45 /* BeforeStyle3 */);
  var stateBeforeStyle3 = consumeSpecialNameChar("E", 46 /* BeforeStyle4 */);
  var stateAfterStyle1 = ifElseState("Y", 48 /* AfterStyle2 */, 1 /* Text */);
  var stateAfterStyle2 = ifElseState("L", 49 /* AfterStyle3 */, 1 /* Text */);
  var stateAfterStyle3 = ifElseState("E", 50 /* AfterStyle4 */, 1 /* Text */);
  var stateBeforeEntity = ifElseState("#", 52 /* BeforeNumericEntity */, 53 /* InNamedEntity */);
  var stateBeforeNumericEntity = ifElseState("X", 55 /* InHexEntity */, 54 /* InNumericEntity */);
  var Tokenizer = /** @class */ (function () {
      function Tokenizer(options, cbs) {
          /** The current state the tokenizer is in. */
          this._state = 1 /* Text */;
          /** The read buffer. */
          this._buffer = "";
          /** The beginning of the section that is currently being read. */
          this._sectionStart = 0;
          /** The index within the buffer that we are currently looking at. */
          this._index = 0;
          /**
           * Data that has already been processed will be removed from the buffer occasionally.
           * `_bufferOffset` keeps track of how many characters have been removed, to make sure position information is accurate.
           */
          this._bufferOffset = 0;
          /** Some behavior, eg. when decoding entities, is done while we are in another state. This keeps track of the other state type. */
          this._baseState = 1 /* Text */;
          /** For special parsing behavior inside of script and style tags. */
          this._special = 1 /* None */;
          /** Indicates whether the tokenizer has been paused. */
          this._running = true;
          /** Indicates whether the tokenizer has finished running / `.end` has been called. */
          this._ended = false;
          this._cbs = cbs;
          this._xmlMode = !!(options && options.xmlMode);
          this._decodeEntities = !!(options && options.decodeEntities);
      }
      Tokenizer.prototype.reset = function () {
          this._state = 1 /* Text */;
          this._buffer = "";
          this._sectionStart = 0;
          this._index = 0;
          this._bufferOffset = 0;
          this._baseState = 1 /* Text */;
          this._special = 1 /* None */;
          this._running = true;
          this._ended = false;
      };
      Tokenizer.prototype._stateText = function (c) {
          if (c === "<") {
              if (this._index > this._sectionStart) {
                  this._cbs.ontext(this._getSection());
              }
              this._state = 2 /* BeforeTagName */;
              this._sectionStart = this._index;
          }
          else if (this._decodeEntities &&
              this._special === 1 /* None */ &&
              c === "&") {
              if (this._index > this._sectionStart) {
                  this._cbs.ontext(this._getSection());
              }
              this._baseState = 1 /* Text */;
              this._state = 51 /* BeforeEntity */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateBeforeTagName = function (c) {
          if (c === "/") {
              this._state = 5 /* BeforeClosingTagName */;
          }
          else if (c === "<") {
              this._cbs.ontext(this._getSection());
              this._sectionStart = this._index;
          }
          else if (c === ">" ||
              this._special !== 1 /* None */ ||
              whitespace(c)) {
              this._state = 1 /* Text */;
          }
          else if (c === "!") {
              this._state = 15 /* BeforeDeclaration */;
              this._sectionStart = this._index + 1;
          }
          else if (c === "?") {
              this._state = 17 /* InProcessingInstruction */;
              this._sectionStart = this._index + 1;
          }
          else {
              this._state =
                  !this._xmlMode && (c === "s" || c === "S")
                      ? 31 /* BeforeSpecial */
                      : 3 /* InTagName */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateInTagName = function (c) {
          if (c === "/" || c === ">" || whitespace(c)) {
              this._emitToken("onopentagname");
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype._stateBeforeClosingTagName = function (c) {
          if (whitespace(c)) ;
          else if (c === ">") {
              this._state = 1 /* Text */;
          }
          else if (this._special !== 1 /* None */) {
              if (c === "s" || c === "S") {
                  this._state = 32 /* BeforeSpecialEnd */;
              }
              else {
                  this._state = 1 /* Text */;
                  this._index--;
              }
          }
          else {
              this._state = 6 /* InClosingTagName */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateInClosingTagName = function (c) {
          if (c === ">" || whitespace(c)) {
              this._emitToken("onclosetag");
              this._state = 7 /* AfterClosingTagName */;
              this._index--;
          }
      };
      Tokenizer.prototype._stateAfterClosingTagName = function (c) {
          //skip everything until ">"
          if (c === ">") {
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype._stateBeforeAttributeName = function (c) {
          if (c === ">") {
              this._cbs.onopentagend();
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
          else if (c === "/") {
              this._state = 4 /* InSelfClosingTag */;
          }
          else if (!whitespace(c)) {
              this._state = 9 /* InAttributeName */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateInSelfClosingTag = function (c) {
          if (c === ">") {
              this._cbs.onselfclosingtag();
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
          else if (!whitespace(c)) {
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype._stateInAttributeName = function (c) {
          if (c === "=" || c === "/" || c === ">" || whitespace(c)) {
              this._cbs.onattribname(this._getSection());
              this._sectionStart = -1;
              this._state = 10 /* AfterAttributeName */;
              this._index--;
          }
      };
      Tokenizer.prototype._stateAfterAttributeName = function (c) {
          if (c === "=") {
              this._state = 11 /* BeforeAttributeValue */;
          }
          else if (c === "/" || c === ">") {
              this._cbs.onattribend();
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
          else if (!whitespace(c)) {
              this._cbs.onattribend();
              this._state = 9 /* InAttributeName */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateBeforeAttributeValue = function (c) {
          if (c === '"') {
              this._state = 12 /* InAttributeValueDq */;
              this._sectionStart = this._index + 1;
          }
          else if (c === "'") {
              this._state = 13 /* InAttributeValueSq */;
              this._sectionStart = this._index + 1;
          }
          else if (!whitespace(c)) {
              this._state = 14 /* InAttributeValueNq */;
              this._sectionStart = this._index;
              this._index--; //reconsume token
          }
      };
      Tokenizer.prototype._stateInAttributeValueDoubleQuotes = function (c) {
          if (c === '"') {
              this._emitToken("onattribdata");
              this._cbs.onattribend();
              this._state = 8 /* BeforeAttributeName */;
          }
          else if (this._decodeEntities && c === "&") {
              this._emitToken("onattribdata");
              this._baseState = this._state;
              this._state = 51 /* BeforeEntity */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateInAttributeValueSingleQuotes = function (c) {
          if (c === "'") {
              this._emitToken("onattribdata");
              this._cbs.onattribend();
              this._state = 8 /* BeforeAttributeName */;
          }
          else if (this._decodeEntities && c === "&") {
              this._emitToken("onattribdata");
              this._baseState = this._state;
              this._state = 51 /* BeforeEntity */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateInAttributeValueNoQuotes = function (c) {
          if (whitespace(c) || c === ">") {
              this._emitToken("onattribdata");
              this._cbs.onattribend();
              this._state = 8 /* BeforeAttributeName */;
              this._index--;
          }
          else if (this._decodeEntities && c === "&") {
              this._emitToken("onattribdata");
              this._baseState = this._state;
              this._state = 51 /* BeforeEntity */;
              this._sectionStart = this._index;
          }
      };
      Tokenizer.prototype._stateBeforeDeclaration = function (c) {
          this._state =
              c === "["
                  ? 22 /* BeforeCdata1 */
                  : c === "-"
                      ? 18 /* BeforeComment */
                      : 16 /* InDeclaration */;
      };
      Tokenizer.prototype._stateInDeclaration = function (c) {
          if (c === ">") {
              this._cbs.ondeclaration(this._getSection());
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype._stateInProcessingInstruction = function (c) {
          if (c === ">") {
              this._cbs.onprocessinginstruction(this._getSection());
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
      };
      Tokenizer.prototype._stateBeforeComment = function (c) {
          if (c === "-") {
              this._state = 19 /* InComment */;
              this._sectionStart = this._index + 1;
          }
          else {
              this._state = 16 /* InDeclaration */;
          }
      };
      Tokenizer.prototype._stateInComment = function (c) {
          if (c === "-")
              this._state = 20 /* AfterComment1 */;
      };
      Tokenizer.prototype._stateAfterComment1 = function (c) {
          if (c === "-") {
              this._state = 21 /* AfterComment2 */;
          }
          else {
              this._state = 19 /* InComment */;
          }
      };
      Tokenizer.prototype._stateAfterComment2 = function (c) {
          if (c === ">") {
              //remove 2 trailing chars
              this._cbs.oncomment(this._buffer.substring(this._sectionStart, this._index - 2));
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
          else if (c !== "-") {
              this._state = 19 /* InComment */;
          }
          // else: stay in AFTER_COMMENT_2 (`--->`)
      };
      Tokenizer.prototype._stateBeforeCdata6 = function (c) {
          if (c === "[") {
              this._state = 28 /* InCdata */;
              this._sectionStart = this._index + 1;
          }
          else {
              this._state = 16 /* InDeclaration */;
              this._index--;
          }
      };
      Tokenizer.prototype._stateInCdata = function (c) {
          if (c === "]")
              this._state = 29 /* AfterCdata1 */;
      };
      Tokenizer.prototype._stateAfterCdata1 = function (c) {
          if (c === "]")
              this._state = 30 /* AfterCdata2 */;
          else
              this._state = 28 /* InCdata */;
      };
      Tokenizer.prototype._stateAfterCdata2 = function (c) {
          if (c === ">") {
              //remove 2 trailing chars
              this._cbs.oncdata(this._buffer.substring(this._sectionStart, this._index - 2));
              this._state = 1 /* Text */;
              this._sectionStart = this._index + 1;
          }
          else if (c !== "]") {
              this._state = 28 /* InCdata */;
          }
          //else: stay in AFTER_CDATA_2 (`]]]>`)
      };
      Tokenizer.prototype._stateBeforeSpecial = function (c) {
          if (c === "c" || c === "C") {
              this._state = 33 /* BeforeScript1 */;
          }
          else if (c === "t" || c === "T") {
              this._state = 43 /* BeforeStyle1 */;
          }
          else {
              this._state = 3 /* InTagName */;
              this._index--; //consume the token again
          }
      };
      Tokenizer.prototype._stateBeforeSpecialEnd = function (c) {
          if (this._special === 2 /* Script */ && (c === "c" || c === "C")) {
              this._state = 38 /* AfterScript1 */;
          }
          else if (this._special === 3 /* Style */ &&
              (c === "t" || c === "T")) {
              this._state = 47 /* AfterStyle1 */;
          }
          else
              this._state = 1 /* Text */;
      };
      Tokenizer.prototype._stateBeforeScript5 = function (c) {
          if (c === "/" || c === ">" || whitespace(c)) {
              this._special = 2 /* Script */;
          }
          this._state = 3 /* InTagName */;
          this._index--; //consume the token again
      };
      Tokenizer.prototype._stateAfterScript5 = function (c) {
          if (c === ">" || whitespace(c)) {
              this._special = 1 /* None */;
              this._state = 6 /* InClosingTagName */;
              this._sectionStart = this._index - 6;
              this._index--; //reconsume the token
          }
          else
              this._state = 1 /* Text */;
      };
      Tokenizer.prototype._stateBeforeStyle4 = function (c) {
          if (c === "/" || c === ">" || whitespace(c)) {
              this._special = 3 /* Style */;
          }
          this._state = 3 /* InTagName */;
          this._index--; //consume the token again
      };
      Tokenizer.prototype._stateAfterStyle4 = function (c) {
          if (c === ">" || whitespace(c)) {
              this._special = 1 /* None */;
              this._state = 6 /* InClosingTagName */;
              this._sectionStart = this._index - 5;
              this._index--; //reconsume the token
          }
          else
              this._state = 1 /* Text */;
      };
      //for entities terminated with a semicolon
      Tokenizer.prototype._parseNamedEntityStrict = function () {
          //offset = 1
          if (this._sectionStart + 1 < this._index) {
              var entity = this._buffer.substring(this._sectionStart + 1, this._index), map = this._xmlMode ? xml_json_1.default : entities_json_1.default;
              if (Object.prototype.hasOwnProperty.call(map, entity)) {
                  // @ts-ignore
                  this._emitPartial(map[entity]);
                  this._sectionStart = this._index + 1;
              }
          }
      };
      //parses legacy entities (without trailing semicolon)
      Tokenizer.prototype._parseLegacyEntity = function () {
          var start = this._sectionStart + 1;
          var limit = this._index - start;
          if (limit > 6)
              limit = 6; // The max length of legacy entities is 6
          while (limit >= 2) {
              // The min length of legacy entities is 2
              var entity = this._buffer.substr(start, limit);
              if (Object.prototype.hasOwnProperty.call(legacy_json_1.default, entity)) {
                  // @ts-ignore
                  this._emitPartial(legacy_json_1.default[entity]);
                  this._sectionStart += limit + 1;
                  return;
              }
              else {
                  limit--;
              }
          }
      };
      Tokenizer.prototype._stateInNamedEntity = function (c) {
          if (c === ";") {
              this._parseNamedEntityStrict();
              if (this._sectionStart + 1 < this._index && !this._xmlMode) {
                  this._parseLegacyEntity();
              }
              this._state = this._baseState;
          }
          else if ((c < "a" || c > "z") &&
              (c < "A" || c > "Z") &&
              (c < "0" || c > "9")) {
              if (this._xmlMode || this._sectionStart + 1 === this._index) ;
              else if (this._baseState !== 1 /* Text */) {
                  if (c !== "=") {
                      this._parseNamedEntityStrict();
                  }
              }
              else {
                  this._parseLegacyEntity();
              }
              this._state = this._baseState;
              this._index--;
          }
      };
      Tokenizer.prototype._decodeNumericEntity = function (offset, base) {
          var sectionStart = this._sectionStart + offset;
          if (sectionStart !== this._index) {
              //parse entity
              var entity = this._buffer.substring(sectionStart, this._index);
              var parsed = parseInt(entity, base);
              this._emitPartial(decode_codepoint_1.default(parsed));
              this._sectionStart = this._index;
          }
          else {
              this._sectionStart--;
          }
          this._state = this._baseState;
      };
      Tokenizer.prototype._stateInNumericEntity = function (c) {
          if (c === ";") {
              this._decodeNumericEntity(2, 10);
              this._sectionStart++;
          }
          else if (c < "0" || c > "9") {
              if (!this._xmlMode) {
                  this._decodeNumericEntity(2, 10);
              }
              else {
                  this._state = this._baseState;
              }
              this._index--;
          }
      };
      Tokenizer.prototype._stateInHexEntity = function (c) {
          if (c === ";") {
              this._decodeNumericEntity(3, 16);
              this._sectionStart++;
          }
          else if ((c < "a" || c > "f") &&
              (c < "A" || c > "F") &&
              (c < "0" || c > "9")) {
              if (!this._xmlMode) {
                  this._decodeNumericEntity(3, 16);
              }
              else {
                  this._state = this._baseState;
              }
              this._index--;
          }
      };
      Tokenizer.prototype._cleanup = function () {
          if (this._sectionStart < 0) {
              this._buffer = "";
              this._bufferOffset += this._index;
              this._index = 0;
          }
          else if (this._running) {
              if (this._state === 1 /* Text */) {
                  if (this._sectionStart !== this._index) {
                      this._cbs.ontext(this._buffer.substr(this._sectionStart));
                  }
                  this._buffer = "";
                  this._bufferOffset += this._index;
                  this._index = 0;
              }
              else if (this._sectionStart === this._index) {
                  //the section just started
                  this._buffer = "";
                  this._bufferOffset += this._index;
                  this._index = 0;
              }
              else {
                  //remove everything unnecessary
                  this._buffer = this._buffer.substr(this._sectionStart);
                  this._index -= this._sectionStart;
                  this._bufferOffset += this._sectionStart;
              }
              this._sectionStart = 0;
          }
      };
      //TODO make events conditional
      Tokenizer.prototype.write = function (chunk) {
          if (this._ended)
              this._cbs.onerror(Error(".write() after done!"));
          this._buffer += chunk;
          this._parse();
      };
      // Iterates through the buffer, calling the function corresponding to the current state.
      // States that are more likely to be hit are higher up, as a performance improvement.
      Tokenizer.prototype._parse = function () {
          while (this._index < this._buffer.length && this._running) {
              var c = this._buffer.charAt(this._index);
              if (this._state === 1 /* Text */) {
                  this._stateText(c);
              }
              else if (this._state === 12 /* InAttributeValueDq */) {
                  this._stateInAttributeValueDoubleQuotes(c);
              }
              else if (this._state === 9 /* InAttributeName */) {
                  this._stateInAttributeName(c);
              }
              else if (this._state === 19 /* InComment */) {
                  this._stateInComment(c);
              }
              else if (this._state === 8 /* BeforeAttributeName */) {
                  this._stateBeforeAttributeName(c);
              }
              else if (this._state === 3 /* InTagName */) {
                  this._stateInTagName(c);
              }
              else if (this._state === 6 /* InClosingTagName */) {
                  this._stateInClosingTagName(c);
              }
              else if (this._state === 2 /* BeforeTagName */) {
                  this._stateBeforeTagName(c);
              }
              else if (this._state === 10 /* AfterAttributeName */) {
                  this._stateAfterAttributeName(c);
              }
              else if (this._state === 13 /* InAttributeValueSq */) {
                  this._stateInAttributeValueSingleQuotes(c);
              }
              else if (this._state === 11 /* BeforeAttributeValue */) {
                  this._stateBeforeAttributeValue(c);
              }
              else if (this._state === 5 /* BeforeClosingTagName */) {
                  this._stateBeforeClosingTagName(c);
              }
              else if (this._state === 7 /* AfterClosingTagName */) {
                  this._stateAfterClosingTagName(c);
              }
              else if (this._state === 31 /* BeforeSpecial */) {
                  this._stateBeforeSpecial(c);
              }
              else if (this._state === 20 /* AfterComment1 */) {
                  this._stateAfterComment1(c);
              }
              else if (this._state === 14 /* InAttributeValueNq */) {
                  this._stateInAttributeValueNoQuotes(c);
              }
              else if (this._state === 4 /* InSelfClosingTag */) {
                  this._stateInSelfClosingTag(c);
              }
              else if (this._state === 16 /* InDeclaration */) {
                  this._stateInDeclaration(c);
              }
              else if (this._state === 15 /* BeforeDeclaration */) {
                  this._stateBeforeDeclaration(c);
              }
              else if (this._state === 21 /* AfterComment2 */) {
                  this._stateAfterComment2(c);
              }
              else if (this._state === 18 /* BeforeComment */) {
                  this._stateBeforeComment(c);
              }
              else if (this._state === 32 /* BeforeSpecialEnd */) {
                  this._stateBeforeSpecialEnd(c);
              }
              else if (this._state === 38 /* AfterScript1 */) {
                  stateAfterScript1(this, c);
              }
              else if (this._state === 39 /* AfterScript2 */) {
                  stateAfterScript2(this, c);
              }
              else if (this._state === 40 /* AfterScript3 */) {
                  stateAfterScript3(this, c);
              }
              else if (this._state === 33 /* BeforeScript1 */) {
                  stateBeforeScript1(this, c);
              }
              else if (this._state === 34 /* BeforeScript2 */) {
                  stateBeforeScript2(this, c);
              }
              else if (this._state === 35 /* BeforeScript3 */) {
                  stateBeforeScript3(this, c);
              }
              else if (this._state === 36 /* BeforeScript4 */) {
                  stateBeforeScript4(this, c);
              }
              else if (this._state === 37 /* BeforeScript5 */) {
                  this._stateBeforeScript5(c);
              }
              else if (this._state === 41 /* AfterScript4 */) {
                  stateAfterScript4(this, c);
              }
              else if (this._state === 42 /* AfterScript5 */) {
                  this._stateAfterScript5(c);
              }
              else if (this._state === 43 /* BeforeStyle1 */) {
                  stateBeforeStyle1(this, c);
              }
              else if (this._state === 28 /* InCdata */) {
                  this._stateInCdata(c);
              }
              else if (this._state === 44 /* BeforeStyle2 */) {
                  stateBeforeStyle2(this, c);
              }
              else if (this._state === 45 /* BeforeStyle3 */) {
                  stateBeforeStyle3(this, c);
              }
              else if (this._state === 46 /* BeforeStyle4 */) {
                  this._stateBeforeStyle4(c);
              }
              else if (this._state === 47 /* AfterStyle1 */) {
                  stateAfterStyle1(this, c);
              }
              else if (this._state === 48 /* AfterStyle2 */) {
                  stateAfterStyle2(this, c);
              }
              else if (this._state === 49 /* AfterStyle3 */) {
                  stateAfterStyle3(this, c);
              }
              else if (this._state === 50 /* AfterStyle4 */) {
                  this._stateAfterStyle4(c);
              }
              else if (this._state === 17 /* InProcessingInstruction */) {
                  this._stateInProcessingInstruction(c);
              }
              else if (this._state === 53 /* InNamedEntity */) {
                  this._stateInNamedEntity(c);
              }
              else if (this._state === 22 /* BeforeCdata1 */) {
                  stateBeforeCdata1(this, c);
              }
              else if (this._state === 51 /* BeforeEntity */) {
                  stateBeforeEntity(this, c);
              }
              else if (this._state === 23 /* BeforeCdata2 */) {
                  stateBeforeCdata2(this, c);
              }
              else if (this._state === 24 /* BeforeCdata3 */) {
                  stateBeforeCdata3(this, c);
              }
              else if (this._state === 29 /* AfterCdata1 */) {
                  this._stateAfterCdata1(c);
              }
              else if (this._state === 30 /* AfterCdata2 */) {
                  this._stateAfterCdata2(c);
              }
              else if (this._state === 25 /* BeforeCdata4 */) {
                  stateBeforeCdata4(this, c);
              }
              else if (this._state === 26 /* BeforeCdata5 */) {
                  stateBeforeCdata5(this, c);
              }
              else if (this._state === 27 /* BeforeCdata6 */) {
                  this._stateBeforeCdata6(c);
              }
              else if (this._state === 55 /* InHexEntity */) {
                  this._stateInHexEntity(c);
              }
              else if (this._state === 54 /* InNumericEntity */) {
                  this._stateInNumericEntity(c);
              }
              else if (this._state === 52 /* BeforeNumericEntity */) {
                  stateBeforeNumericEntity(this, c);
              }
              else {
                  this._cbs.onerror(Error("unknown _state"), this._state);
              }
              this._index++;
          }
          this._cleanup();
      };
      Tokenizer.prototype.pause = function () {
          this._running = false;
      };
      Tokenizer.prototype.resume = function () {
          this._running = true;
          if (this._index < this._buffer.length) {
              this._parse();
          }
          if (this._ended) {
              this._finish();
          }
      };
      Tokenizer.prototype.end = function (chunk) {
          if (this._ended)
              this._cbs.onerror(Error(".end() after done!"));
          if (chunk)
              this.write(chunk);
          this._ended = true;
          if (this._running)
              this._finish();
      };
      Tokenizer.prototype._finish = function () {
          //if there is remaining data, emit it in a reasonable way
          if (this._sectionStart < this._index) {
              this._handleTrailingData();
          }
          this._cbs.onend();
      };
      Tokenizer.prototype._handleTrailingData = function () {
          var data = this._buffer.substr(this._sectionStart);
          if (this._state === 28 /* InCdata */ ||
              this._state === 29 /* AfterCdata1 */ ||
              this._state === 30 /* AfterCdata2 */) {
              this._cbs.oncdata(data);
          }
          else if (this._state === 19 /* InComment */ ||
              this._state === 20 /* AfterComment1 */ ||
              this._state === 21 /* AfterComment2 */) {
              this._cbs.oncomment(data);
          }
          else if (this._state === 53 /* InNamedEntity */ && !this._xmlMode) {
              this._parseLegacyEntity();
              if (this._sectionStart < this._index) {
                  this._state = this._baseState;
                  this._handleTrailingData();
              }
          }
          else if (this._state === 54 /* InNumericEntity */ && !this._xmlMode) {
              this._decodeNumericEntity(2, 10);
              if (this._sectionStart < this._index) {
                  this._state = this._baseState;
                  this._handleTrailingData();
              }
          }
          else if (this._state === 55 /* InHexEntity */ && !this._xmlMode) {
              this._decodeNumericEntity(3, 16);
              if (this._sectionStart < this._index) {
                  this._state = this._baseState;
                  this._handleTrailingData();
              }
          }
          else if (this._state !== 3 /* InTagName */ &&
              this._state !== 8 /* BeforeAttributeName */ &&
              this._state !== 11 /* BeforeAttributeValue */ &&
              this._state !== 10 /* AfterAttributeName */ &&
              this._state !== 9 /* InAttributeName */ &&
              this._state !== 13 /* InAttributeValueSq */ &&
              this._state !== 12 /* InAttributeValueDq */ &&
              this._state !== 14 /* InAttributeValueNq */ &&
              this._state !== 6 /* InClosingTagName */) {
              this._cbs.ontext(data);
          }
          //else, ignore remaining data
          //TODO add a way to remove current tag
      };
      Tokenizer.prototype.getAbsoluteIndex = function () {
          return this._bufferOffset + this._index;
      };
      Tokenizer.prototype._getSection = function () {
          return this._buffer.substring(this._sectionStart, this._index);
      };
      Tokenizer.prototype._emitToken = function (name) {
          this._cbs[name](this._getSection());
          this._sectionStart = -1;
      };
      Tokenizer.prototype._emitPartial = function (value) {
          if (this._baseState !== 1 /* Text */) {
              this._cbs.onattribdata(value); //TODO implement the new event
          }
          else {
              this._cbs.ontext(value);
          }
      };
      return Tokenizer;
  }());
  exports.default = Tokenizer;
  });

  unwrapExports(Tokenizer_1);

  var Parser_1 = createCommonjsModule(function (module, exports) {
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var Tokenizer_1$1 = __importDefault(Tokenizer_1);

  var formTags = new Set([
      "input",
      "option",
      "optgroup",
      "select",
      "button",
      "datalist",
      "textarea"
  ]);
  var pTag = new Set(["p"]);
  var openImpliesClose = {
      tr: new Set(["tr", "th", "td"]),
      th: new Set(["th"]),
      td: new Set(["thead", "th", "td"]),
      body: new Set(["head", "link", "script"]),
      li: new Set(["li"]),
      p: pTag,
      h1: pTag,
      h2: pTag,
      h3: pTag,
      h4: pTag,
      h5: pTag,
      h6: pTag,
      select: formTags,
      input: formTags,
      output: formTags,
      button: formTags,
      datalist: formTags,
      textarea: formTags,
      option: new Set(["option"]),
      optgroup: new Set(["optgroup", "option"]),
      dd: new Set(["dt", "dd"]),
      dt: new Set(["dt", "dd"]),
      address: pTag,
      article: pTag,
      aside: pTag,
      blockquote: pTag,
      details: pTag,
      div: pTag,
      dl: pTag,
      fieldset: pTag,
      figcaption: pTag,
      figure: pTag,
      footer: pTag,
      form: pTag,
      header: pTag,
      hr: pTag,
      main: pTag,
      nav: pTag,
      ol: pTag,
      pre: pTag,
      section: pTag,
      table: pTag,
      ul: pTag,
      rt: new Set(["rt", "rp"]),
      rp: new Set(["rt", "rp"]),
      tbody: new Set(["thead", "tbody"]),
      tfoot: new Set(["thead", "tbody"])
  };
  var voidElements = new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr"
  ]);
  var foreignContextElements = new Set(["math", "svg"]);
  var htmlIntegrationElements = new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title"
  ]);
  var reNameEnd = /\s|\//;
  var Parser = /** @class */ (function (_super) {
      __extends(Parser, _super);
      function Parser(cbs, options) {
          var _this = _super.call(this) || this;
          _this._tagname = "";
          _this._attribname = "";
          _this._attribvalue = "";
          _this._attribs = null;
          _this._stack = [];
          _this._foreignContext = [];
          _this.startIndex = 0;
          _this.endIndex = null;
          // Aliases for backwards compatibility
          _this.parseChunk = Parser.prototype.write;
          _this.done = Parser.prototype.end;
          _this._options = options || {};
          _this._cbs = cbs || {};
          _this._tagname = "";
          _this._attribname = "";
          _this._attribvalue = "";
          _this._attribs = null;
          _this._stack = [];
          _this._foreignContext = [];
          _this.startIndex = 0;
          _this.endIndex = null;
          _this._lowerCaseTagNames =
              "lowerCaseTags" in _this._options
                  ? !!_this._options.lowerCaseTags
                  : !_this._options.xmlMode;
          _this._lowerCaseAttributeNames =
              "lowerCaseAttributeNames" in _this._options
                  ? !!_this._options.lowerCaseAttributeNames
                  : !_this._options.xmlMode;
          _this._tokenizer = new (_this._options.Tokenizer || Tokenizer_1$1.default)(_this._options, _this);
          if (_this._cbs.onparserinit)
              _this._cbs.onparserinit(_this);
          return _this;
      }
      Parser.prototype._updatePosition = function (initialOffset) {
          if (this.endIndex === null) {
              if (this._tokenizer._sectionStart <= initialOffset) {
                  this.startIndex = 0;
              }
              else {
                  this.startIndex = this._tokenizer._sectionStart - initialOffset;
              }
          }
          else
              this.startIndex = this.endIndex + 1;
          this.endIndex = this._tokenizer.getAbsoluteIndex();
      };
      //Tokenizer event handlers
      Parser.prototype.ontext = function (data) {
          this._updatePosition(1);
          // @ts-ignore
          this.endIndex--;
          if (this._cbs.ontext)
              this._cbs.ontext(data);
      };
      Parser.prototype.onopentagname = function (name) {
          if (this._lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          this._tagname = name;
          if (!this._options.xmlMode &&
              Object.prototype.hasOwnProperty.call(openImpliesClose, name)) {
              for (var el = void 0; 
              // @ts-ignore
              openImpliesClose[name].has((el = this._stack[this._stack.length - 1])); this.onclosetag(el))
                  ;
          }
          if (this._options.xmlMode || !voidElements.has(name)) {
              this._stack.push(name);
              if (foreignContextElements.has(name)) {
                  this._foreignContext.push(true);
              }
              else if (htmlIntegrationElements.has(name)) {
                  this._foreignContext.push(false);
              }
          }
          if (this._cbs.onopentagname)
              this._cbs.onopentagname(name);
          if (this._cbs.onopentag)
              this._attribs = {};
      };
      Parser.prototype.onopentagend = function () {
          this._updatePosition(1);
          if (this._attribs) {
              if (this._cbs.onopentag) {
                  this._cbs.onopentag(this._tagname, this._attribs);
              }
              this._attribs = null;
          }
          if (!this._options.xmlMode &&
              this._cbs.onclosetag &&
              voidElements.has(this._tagname)) {
              this._cbs.onclosetag(this._tagname);
          }
          this._tagname = "";
      };
      Parser.prototype.onclosetag = function (name) {
          this._updatePosition(1);
          if (this._lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          if (foreignContextElements.has(name) ||
              htmlIntegrationElements.has(name)) {
              this._foreignContext.pop();
          }
          if (this._stack.length &&
              (this._options.xmlMode || !voidElements.has(name))) {
              var pos = this._stack.lastIndexOf(name);
              if (pos !== -1) {
                  if (this._cbs.onclosetag) {
                      pos = this._stack.length - pos;
                      // @ts-ignore
                      while (pos--)
                          this._cbs.onclosetag(this._stack.pop());
                  }
                  else
                      this._stack.length = pos;
              }
              else if (name === "p" && !this._options.xmlMode) {
                  this.onopentagname(name);
                  this._closeCurrentTag();
              }
          }
          else if (!this._options.xmlMode && (name === "br" || name === "p")) {
              this.onopentagname(name);
              this._closeCurrentTag();
          }
      };
      Parser.prototype.onselfclosingtag = function () {
          if (this._options.xmlMode ||
              this._options.recognizeSelfClosing ||
              this._foreignContext[this._foreignContext.length - 1]) {
              this._closeCurrentTag();
          }
          else {
              this.onopentagend();
          }
      };
      Parser.prototype._closeCurrentTag = function () {
          var name = this._tagname;
          this.onopentagend();
          //self-closing tags will be on the top of the stack
          //(cheaper check than in onclosetag)
          if (this._stack[this._stack.length - 1] === name) {
              if (this._cbs.onclosetag) {
                  this._cbs.onclosetag(name);
              }
              this._stack.pop();
          }
      };
      Parser.prototype.onattribname = function (name) {
          if (this._lowerCaseAttributeNames) {
              name = name.toLowerCase();
          }
          this._attribname = name;
      };
      Parser.prototype.onattribdata = function (value) {
          this._attribvalue += value;
      };
      Parser.prototype.onattribend = function () {
          if (this._cbs.onattribute)
              this._cbs.onattribute(this._attribname, this._attribvalue);
          if (this._attribs &&
              !Object.prototype.hasOwnProperty.call(this._attribs, this._attribname)) {
              this._attribs[this._attribname] = this._attribvalue;
          }
          this._attribname = "";
          this._attribvalue = "";
      };
      Parser.prototype._getInstructionName = function (value) {
          var idx = value.search(reNameEnd);
          var name = idx < 0 ? value : value.substr(0, idx);
          if (this._lowerCaseTagNames) {
              name = name.toLowerCase();
          }
          return name;
      };
      Parser.prototype.ondeclaration = function (value) {
          if (this._cbs.onprocessinginstruction) {
              var name_1 = this._getInstructionName(value);
              this._cbs.onprocessinginstruction("!" + name_1, "!" + value);
          }
      };
      Parser.prototype.onprocessinginstruction = function (value) {
          if (this._cbs.onprocessinginstruction) {
              var name_2 = this._getInstructionName(value);
              this._cbs.onprocessinginstruction("?" + name_2, "?" + value);
          }
      };
      Parser.prototype.oncomment = function (value) {
          this._updatePosition(4);
          if (this._cbs.oncomment)
              this._cbs.oncomment(value);
          if (this._cbs.oncommentend)
              this._cbs.oncommentend();
      };
      Parser.prototype.oncdata = function (value) {
          this._updatePosition(1);
          if (this._options.xmlMode || this._options.recognizeCDATA) {
              if (this._cbs.oncdatastart)
                  this._cbs.oncdatastart();
              if (this._cbs.ontext)
                  this._cbs.ontext(value);
              if (this._cbs.oncdataend)
                  this._cbs.oncdataend();
          }
          else {
              this.oncomment("[CDATA[" + value + "]]");
          }
      };
      Parser.prototype.onerror = function (err) {
          if (this._cbs.onerror)
              this._cbs.onerror(err);
      };
      Parser.prototype.onend = function () {
          if (this._cbs.onclosetag) {
              for (var i = this._stack.length; i > 0; this._cbs.onclosetag(this._stack[--i]))
                  ;
          }
          if (this._cbs.onend)
              this._cbs.onend();
      };
      //Resets the parser to a blank state, ready to parse a new HTML document
      Parser.prototype.reset = function () {
          if (this._cbs.onreset)
              this._cbs.onreset();
          this._tokenizer.reset();
          this._tagname = "";
          this._attribname = "";
          this._attribs = null;
          this._stack = [];
          if (this._cbs.onparserinit)
              this._cbs.onparserinit(this);
      };
      //Parses a complete HTML document and pushes it to the handler
      Parser.prototype.parseComplete = function (data) {
          this.reset();
          this.end(data);
      };
      Parser.prototype.write = function (chunk) {
          this._tokenizer.write(chunk);
      };
      Parser.prototype.end = function (chunk) {
          this._tokenizer.end(chunk);
      };
      Parser.prototype.pause = function () {
          this._tokenizer.pause();
      };
      Parser.prototype.resume = function () {
          this._tokenizer.resume();
      };
      return Parser;
  }(events__default['default'].EventEmitter));
  exports.Parser = Parser;
  });

  unwrapExports(Parser_1);
  var Parser_2 = Parser_1.Parser;

  var node = createCommonjsModule(function (module, exports) {
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });
  var nodeTypes = new Map([
      ["tag" /* Tag */, 1],
      ["script" /* Script */, 1],
      ["style" /* Style */, 1],
      ["directive" /* Directive */, 1],
      ["text" /* Text */, 3],
      ["cdata" /* CDATA */, 4],
      ["comment" /* Comment */, 8]
  ]);
  // This object will be used as the prototype for Nodes when creating a
  // DOM-Level-1-compliant structure.
  var Node = /** @class */ (function () {
      /**
       *
       * @param type The type of the node.
       */
      function Node(type) {
          this.type = type;
          /** Parent of the node */
          this.parent = null;
          /** Previous sibling */
          this.prev = null;
          /** Next sibling */
          this.next = null;
          /** The start index of the node. Requires `withStartIndices` on the handler to be `true. */
          this.startIndex = null;
          /** The end index of the node. Requires `withEndIndices` on the handler to be `true. */
          this.endIndex = null;
      }
      Object.defineProperty(Node.prototype, "nodeType", {
          // Read-only aliases
          get: function () {
              return nodeTypes.get(this.type) || 1;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "parentNode", {
          // Read-write aliases for properties
          get: function () {
              return this.parent || null;
          },
          set: function (parent) {
              this.parent = parent;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "previousSibling", {
          get: function () {
              return this.prev || null;
          },
          set: function (prev) {
              this.prev = prev;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(Node.prototype, "nextSibling", {
          get: function () {
              return this.next || null;
          },
          set: function (next) {
              this.next = next;
          },
          enumerable: true,
          configurable: true
      });
      return Node;
  }());
  exports.Node = Node;
  var DataNode = /** @class */ (function (_super) {
      __extends(DataNode, _super);
      /**
       *
       * @param type The type of the node
       * @param data The content of the data node
       */
      function DataNode(type, data) {
          var _this = _super.call(this, type) || this;
          _this.data = data;
          return _this;
      }
      Object.defineProperty(DataNode.prototype, "nodeValue", {
          get: function () {
              return this.data;
          },
          set: function (data) {
              this.data = data;
          },
          enumerable: true,
          configurable: true
      });
      return DataNode;
  }(Node));
  exports.DataNode = DataNode;
  var ProcessingInstruction = /** @class */ (function (_super) {
      __extends(ProcessingInstruction, _super);
      function ProcessingInstruction(name, data) {
          var _this = _super.call(this, "directive" /* Directive */, data) || this;
          _this.name = name;
          return _this;
      }
      return ProcessingInstruction;
  }(DataNode));
  exports.ProcessingInstruction = ProcessingInstruction;
  var NodeWithChildren = /** @class */ (function (_super) {
      __extends(NodeWithChildren, _super);
      /**
       *
       * @param type Type of the node.
       * @param children Children of the node. Only certain node types can have children.
       */
      function NodeWithChildren(type, children) {
          var _this = _super.call(this, type) || this;
          _this.children = children;
          return _this;
      }
      Object.defineProperty(NodeWithChildren.prototype, "firstChild", {
          // Aliases
          get: function () {
              return this.children[0] || null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(NodeWithChildren.prototype, "lastChild", {
          get: function () {
              return this.children[this.children.length - 1] || null;
          },
          enumerable: true,
          configurable: true
      });
      Object.defineProperty(NodeWithChildren.prototype, "childNodes", {
          get: function () {
              return this.children;
          },
          set: function (children) {
              this.children = children;
          },
          enumerable: true,
          configurable: true
      });
      return NodeWithChildren;
  }(Node));
  exports.NodeWithChildren = NodeWithChildren;
  var Element = /** @class */ (function (_super) {
      __extends(Element, _super);
      /**
       *
       * @param name Name of the tag, eg. `div`, `span`
       * @param attribs Object mapping attribute names to attribute values
       */
      function Element(name, attribs) {
          var _this = _super.call(this, name === "script"
              ? "script" /* Script */
              : name === "style"
                  ? "style" /* Style */
                  : "tag" /* Tag */, []) || this;
          _this.name = name;
          _this.attribs = attribs;
          _this.attribs = attribs;
          return _this;
      }
      Object.defineProperty(Element.prototype, "tagName", {
          // DOM Level 1 aliases
          get: function () {
              return this.name;
          },
          set: function (name) {
              this.name = name;
          },
          enumerable: true,
          configurable: true
      });
      return Element;
  }(NodeWithChildren));
  exports.Element = Element;
  });

  unwrapExports(node);
  var node_1 = node.Node;
  var node_2 = node.DataNode;
  var node_3 = node.ProcessingInstruction;
  var node_4 = node.NodeWithChildren;
  var node_5 = node.Element;

  var lib$1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });

  exports.Node = node.Node;
  exports.Element = node.Element;
  exports.DataNode = node.DataNode;
  exports.NodeWithChildren = node.NodeWithChildren;
  var reWhitespace = /\s+/g;
  // Default options
  var defaultOpts = {
      normalizeWhitespace: false,
      withStartIndices: false,
      withEndIndices: false
  };
  var DomHandler = /** @class */ (function () {
      /**
       * Initiate a new DomHandler.
       *
       * @param callback Called once parsing has completed.
       * @param options Settings for the handler.
       * @param elementCB Callback whenever a tag is closed.
       */
      function DomHandler(callback, options, elementCB) {
          /** The constructed DOM */
          this.dom = [];
          /** Indicated whether parsing has been completed. */
          this._done = false;
          /** Stack of open tags. */
          this._tagStack = [];
          /** A data node that is still being written to. */
          this._lastNode = null;
          /** Reference to the parser instance. Used for location information. */
          this._parser = null;
          // Make it possible to skip arguments, for backwards-compatibility
          if (typeof options === "function") {
              elementCB = options;
              options = defaultOpts;
          }
          if (typeof callback === "object") {
              options = callback;
              callback = undefined;
          }
          this._callback = callback || null;
          this._options = options || defaultOpts;
          this._elementCB = elementCB || null;
      }
      DomHandler.prototype.onparserinit = function (parser) {
          this._parser = parser;
      };
      // Resets the handler back to starting state
      DomHandler.prototype.onreset = function () {
          this.dom = [];
          this._done = false;
          this._tagStack = [];
          this._lastNode = null;
          this._parser = this._parser || null;
      };
      // Signals the handler that parsing is done
      DomHandler.prototype.onend = function () {
          if (this._done)
              return;
          this._done = true;
          this._parser = null;
          this.handleCallback(null);
      };
      DomHandler.prototype.onerror = function (error) {
          this.handleCallback(error);
      };
      DomHandler.prototype.onclosetag = function () {
          this._lastNode = null;
          // If(this._tagStack.pop().name !== name) this.handleCallback(Error("Tagname didn't match!"));
          var elem = this._tagStack.pop();
          if (!elem || !this._parser) {
              return;
          }
          if (this._options.withEndIndices) {
              elem.endIndex = this._parser.endIndex;
          }
          if (this._elementCB)
              this._elementCB(elem);
      };
      DomHandler.prototype.onopentag = function (name, attribs) {
          var element = new node.Element(name, attribs);
          this.addNode(element);
          this._tagStack.push(element);
      };
      DomHandler.prototype.ontext = function (data) {
          var normalize = this._options.normalizeWhitespace;
          var _lastNode = this._lastNode;
          if (_lastNode && _lastNode.type === "text" /* Text */) {
              if (normalize) {
                  _lastNode.data = (_lastNode.data + data).replace(reWhitespace, " ");
              }
              else {
                  _lastNode.data += data;
              }
          }
          else {
              if (normalize) {
                  data = data.replace(reWhitespace, " ");
              }
              var node$1 = new node.DataNode("text" /* Text */, data);
              this.addNode(node$1);
              this._lastNode = node$1;
          }
      };
      DomHandler.prototype.oncomment = function (data) {
          if (this._lastNode && this._lastNode.type === "comment" /* Comment */) {
              this._lastNode.data += data;
              return;
          }
          var node$1 = new node.DataNode("comment" /* Comment */, data);
          this.addNode(node$1);
          this._lastNode = node$1;
      };
      DomHandler.prototype.oncommentend = function () {
          this._lastNode = null;
      };
      DomHandler.prototype.oncdatastart = function () {
          var text = new node.DataNode("text" /* Text */, "");
          var node$1 = new node.NodeWithChildren("cdata" /* CDATA */, [text]);
          this.addNode(node$1);
          text.parent = node$1;
          this._lastNode = text;
      };
      DomHandler.prototype.oncdataend = function () {
          this._lastNode = null;
      };
      DomHandler.prototype.onprocessinginstruction = function (name, data) {
          var node$1 = new node.ProcessingInstruction(name, data);
          this.addNode(node$1);
      };
      DomHandler.prototype.handleCallback = function (error) {
          if (typeof this._callback === "function") {
              this._callback(error, this.dom);
          }
          else if (error) {
              throw error;
          }
      };
      DomHandler.prototype.addNode = function (node) {
          var parent = this._tagStack[this._tagStack.length - 1];
          var siblings = parent ? parent.children : this.dom;
          var previousSibling = siblings[siblings.length - 1];
          if (this._parser) {
              if (this._options.withStartIndices) {
                  node.startIndex = this._parser.startIndex;
              }
              if (this._options.withEndIndices) {
                  node.endIndex = this._parser.endIndex;
              }
          }
          siblings.push(node);
          if (previousSibling) {
              node.prev = previousSibling;
              previousSibling.next = node;
          }
          if (parent) {
              node.parent = parent;
          }
          this._lastNode = null;
      };
      DomHandler.prototype.addDataNode = function (node) {
          this.addNode(node);
          this._lastNode = node;
      };
      return DomHandler;
  }());
  exports.DomHandler = DomHandler;
  exports.default = DomHandler;
  });

  unwrapExports(lib$1);
  var lib_1 = lib$1.Node;
  var lib_2 = lib$1.Element;
  var lib_3 = lib$1.DataNode;
  var lib_4 = lib$1.NodeWithChildren;
  var lib_5 = lib$1.DomHandler;

  var lib$2 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  /**
   * Tests whether an element is a tag or not.
   *
   * @param elem Element to test
   */
  function isTag(elem) {
      return (elem.type === "tag" /* Tag */ ||
          elem.type === "script" /* Script */ ||
          elem.type === "style" /* Style */);
  }
  exports.isTag = isTag;
  // Exports for backwards compatibility
  exports.Text = "text" /* Text */; //Text
  exports.Directive = "directive" /* Directive */; //<? ... ?>
  exports.Comment = "comment" /* Comment */; //<!-- ... -->
  exports.Script = "script" /* Script */; //<script> tags
  exports.Style = "style" /* Style */; //<style> tags
  exports.Tag = "tag" /* Tag */; //Any tag
  exports.CDATA = "cdata" /* CDATA */; //<![CDATA[ ... ]]>
  exports.Doctype = "doctype" /* Doctype */;
  });

  unwrapExports(lib$2);
  var lib_1$1 = lib$2.isTag;
  var lib_2$1 = lib$2.Text;
  var lib_3$1 = lib$2.Directive;
  var lib_4$1 = lib$2.Comment;
  var lib_5$1 = lib$2.Script;
  var lib_6 = lib$2.Style;
  var lib_7 = lib$2.Tag;
  var lib_8 = lib$2.CDATA;
  var lib_9 = lib$2.Doctype;

  var tagtypes = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.hasChildren = exports.isComment = exports.isText = exports.isCDATA = exports.isTag = void 0;

  function isTag(node) {
      return lib$2.isTag(node);
  }
  exports.isTag = isTag;
  function isCDATA(node) {
      return node.type === "cdata" /* CDATA */;
  }
  exports.isCDATA = isCDATA;
  function isText(node) {
      return node.type === "text" /* Text */;
  }
  exports.isText = isText;
  function isComment(node) {
      return node.type === "comment" /* Comment */;
  }
  exports.isComment = isComment;
  function hasChildren(node) {
      return Object.prototype.hasOwnProperty.call(node, "children");
  }
  exports.hasChildren = hasChildren;
  });

  unwrapExports(tagtypes);
  var tagtypes_1 = tagtypes.hasChildren;
  var tagtypes_2 = tagtypes.isComment;
  var tagtypes_3 = tagtypes.isText;
  var tagtypes_4 = tagtypes.isCDATA;
  var tagtypes_5 = tagtypes.isTag;

  var decode$2 = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.decodeHTML = exports.decodeHTMLStrict = exports.decodeXML = void 0;
  var entities_json_1 = __importDefault(require$$1);
  var legacy_json_1 = __importDefault(require$$1$1);
  var xml_json_1 = __importDefault(require$$0$1);
  var decode_codepoint_1 = __importDefault(decode_codepoint);
  exports.decodeXML = getStrictDecoder(xml_json_1.default);
  exports.decodeHTMLStrict = getStrictDecoder(entities_json_1.default);
  function getStrictDecoder(map) {
      var keys = Object.keys(map).join("|");
      var replace = getReplacer(map);
      keys += "|#[xX][\\da-fA-F]+|#\\d+";
      var re = new RegExp("&(?:" + keys + ");", "g");
      return function (str) { return String(str).replace(re, replace); };
  }
  var sorter = function (a, b) { return (a < b ? 1 : -1); };
  exports.decodeHTML = (function () {
      var legacy = Object.keys(legacy_json_1.default).sort(sorter);
      var keys = Object.keys(entities_json_1.default).sort(sorter);
      for (var i = 0, j = 0; i < keys.length; i++) {
          if (legacy[j] === keys[i]) {
              keys[i] += ";?";
              j++;
          }
          else {
              keys[i] += ";";
          }
      }
      var re = new RegExp("&(?:" + keys.join("|") + "|#[xX][\\da-fA-F]+;?|#\\d+;?)", "g");
      var replace = getReplacer(entities_json_1.default);
      function replacer(str) {
          if (str.substr(-1) !== ";")
              str += ";";
          return replace(str);
      }
      //TODO consider creating a merged map
      return function (str) { return String(str).replace(re, replacer); };
  })();
  function getReplacer(map) {
      return function replace(str) {
          if (str.charAt(1) === "#") {
              var secondChar = str.charAt(2);
              if (secondChar === "X" || secondChar === "x") {
                  return decode_codepoint_1.default(parseInt(str.substr(3), 16));
              }
              return decode_codepoint_1.default(parseInt(str.substr(2), 10));
          }
          return map[str.slice(1, -1)];
      };
  }
  });

  unwrapExports(decode$2);
  var decode_1 = decode$2.decodeHTML;
  var decode_2 = decode$2.decodeHTMLStrict;
  var decode_3 = decode$2.decodeXML;

  var encode = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.escape = exports.encodeHTML = exports.encodeXML = void 0;
  var xml_json_1 = __importDefault(require$$0$1);
  var inverseXML = getInverseObj(xml_json_1.default);
  var xmlReplacer = getInverseReplacer(inverseXML);
  exports.encodeXML = getInverse(inverseXML, xmlReplacer);
  var entities_json_1 = __importDefault(require$$1);
  var inverseHTML = getInverseObj(entities_json_1.default);
  var htmlReplacer = getInverseReplacer(inverseHTML);
  exports.encodeHTML = getInverse(inverseHTML, htmlReplacer);
  function getInverseObj(obj) {
      return Object.keys(obj)
          .sort()
          .reduce(function (inverse, name) {
          inverse[obj[name]] = "&" + name + ";";
          return inverse;
      }, {});
  }
  function getInverseReplacer(inverse) {
      var single = [];
      var multiple = [];
      for (var _i = 0, _a = Object.keys(inverse); _i < _a.length; _i++) {
          var k = _a[_i];
          if (k.length === 1) {
              // Add value to single array
              single.push("\\" + k);
          }
          else {
              // Add value to multiple array
              multiple.push(k);
          }
      }
      // Add ranges to single characters.
      single.sort();
      for (var start = 0; start < single.length - 1; start++) {
          // Find the end of a run of characters
          var end = start;
          while (end < single.length - 1 &&
              single[end].charCodeAt(1) + 1 === single[end + 1].charCodeAt(1)) {
              end += 1;
          }
          var count = 1 + end - start;
          // We want to replace at least three characters
          if (count < 3)
              continue;
          single.splice(start, count, single[start] + "-" + single[end]);
      }
      multiple.unshift("[" + single.join("") + "]");
      return new RegExp(multiple.join("|"), "g");
  }
  var reNonASCII = /(?:[\x80-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF])/g;
  function singleCharReplacer(c) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      return "&#x" + c.codePointAt(0).toString(16).toUpperCase() + ";";
  }
  function getInverse(inverse, re) {
      return function (data) {
          return data
              .replace(re, function (name) { return inverse[name]; })
              .replace(reNonASCII, singleCharReplacer);
      };
  }
  var reXmlChars = getInverseReplacer(inverseXML);
  function escape(data) {
      return data
          .replace(reXmlChars, singleCharReplacer)
          .replace(reNonASCII, singleCharReplacer);
  }
  exports.escape = escape;
  });

  unwrapExports(encode);
  var encode_1 = encode.escape;
  var encode_2 = encode.encodeHTML;
  var encode_3 = encode.encodeXML;

  var lib$3 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.encode = exports.decodeStrict = exports.decode = void 0;


  /**
   * Decodes a string with entities.
   *
   * @param data String to decode.
   * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
   */
  function decode(data, level) {
      return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTML)(data);
  }
  exports.decode = decode;
  /**
   * Decodes a string with entities. Does not allow missing trailing semicolons for entities.
   *
   * @param data String to decode.
   * @param level Optional level to decode at. 0 = XML, 1 = HTML. Default is 0.
   */
  function decodeStrict(data, level) {
      return (!level || level <= 0 ? decode$2.decodeXML : decode$2.decodeHTMLStrict)(data);
  }
  exports.decodeStrict = decodeStrict;
  /**
   * Encodes a string with entities.
   *
   * @param data String to encode.
   * @param level Optional level to encode at. 0 = XML, 1 = HTML. Default is 0.
   */
  function encode$1(data, level) {
      return (!level || level <= 0 ? encode.encodeXML : encode.encodeHTML)(data);
  }
  exports.encode = encode$1;
  var encode_2 = encode;
  Object.defineProperty(exports, "encodeXML", { enumerable: true, get: function () { return encode_2.encodeXML; } });
  Object.defineProperty(exports, "encodeHTML", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  Object.defineProperty(exports, "escape", { enumerable: true, get: function () { return encode_2.escape; } });
  // Legacy aliases
  Object.defineProperty(exports, "encodeHTML4", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  Object.defineProperty(exports, "encodeHTML5", { enumerable: true, get: function () { return encode_2.encodeHTML; } });
  var decode_2 = decode$2;
  Object.defineProperty(exports, "decodeXML", { enumerable: true, get: function () { return decode_2.decodeXML; } });
  Object.defineProperty(exports, "decodeHTML", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  Object.defineProperty(exports, "decodeHTMLStrict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  // Legacy aliases
  Object.defineProperty(exports, "decodeHTML4", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  Object.defineProperty(exports, "decodeHTML5", { enumerable: true, get: function () { return decode_2.decodeHTML; } });
  Object.defineProperty(exports, "decodeHTML4Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  Object.defineProperty(exports, "decodeHTML5Strict", { enumerable: true, get: function () { return decode_2.decodeHTMLStrict; } });
  Object.defineProperty(exports, "decodeXMLStrict", { enumerable: true, get: function () { return decode_2.decodeXML; } });
  });

  unwrapExports(lib$3);
  var lib_1$2 = lib$3.encode;
  var lib_2$2 = lib$3.decodeStrict;
  var lib_3$2 = lib$3.decode;

  var foreignNames = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.elementNames = new Map([
      ["altglyph", "altGlyph"],
      ["altglyphdef", "altGlyphDef"],
      ["altglyphitem", "altGlyphItem"],
      ["animatecolor", "animateColor"],
      ["animatemotion", "animateMotion"],
      ["animatetransform", "animateTransform"],
      ["clippath", "clipPath"],
      ["feblend", "feBlend"],
      ["fecolormatrix", "feColorMatrix"],
      ["fecomponenttransfer", "feComponentTransfer"],
      ["fecomposite", "feComposite"],
      ["feconvolvematrix", "feConvolveMatrix"],
      ["fediffuselighting", "feDiffuseLighting"],
      ["fedisplacementmap", "feDisplacementMap"],
      ["fedistantlight", "feDistantLight"],
      ["fedropshadow", "feDropShadow"],
      ["feflood", "feFlood"],
      ["fefunca", "feFuncA"],
      ["fefuncb", "feFuncB"],
      ["fefuncg", "feFuncG"],
      ["fefuncr", "feFuncR"],
      ["fegaussianblur", "feGaussianBlur"],
      ["feimage", "feImage"],
      ["femerge", "feMerge"],
      ["femergenode", "feMergeNode"],
      ["femorphology", "feMorphology"],
      ["feoffset", "feOffset"],
      ["fepointlight", "fePointLight"],
      ["fespecularlighting", "feSpecularLighting"],
      ["fespotlight", "feSpotLight"],
      ["fetile", "feTile"],
      ["feturbulence", "feTurbulence"],
      ["foreignobject", "foreignObject"],
      ["glyphref", "glyphRef"],
      ["lineargradient", "linearGradient"],
      ["radialgradient", "radialGradient"],
      ["textpath", "textPath"],
  ]);
  exports.attributeNames = new Map([
      ["definitionurl", "definitionURL"],
      ["attributename", "attributeName"],
      ["attributetype", "attributeType"],
      ["basefrequency", "baseFrequency"],
      ["baseprofile", "baseProfile"],
      ["calcmode", "calcMode"],
      ["clippathunits", "clipPathUnits"],
      ["diffuseconstant", "diffuseConstant"],
      ["edgemode", "edgeMode"],
      ["filterunits", "filterUnits"],
      ["glyphref", "glyphRef"],
      ["gradienttransform", "gradientTransform"],
      ["gradientunits", "gradientUnits"],
      ["kernelmatrix", "kernelMatrix"],
      ["kernelunitlength", "kernelUnitLength"],
      ["keypoints", "keyPoints"],
      ["keysplines", "keySplines"],
      ["keytimes", "keyTimes"],
      ["lengthadjust", "lengthAdjust"],
      ["limitingconeangle", "limitingConeAngle"],
      ["markerheight", "markerHeight"],
      ["markerunits", "markerUnits"],
      ["markerwidth", "markerWidth"],
      ["maskcontentunits", "maskContentUnits"],
      ["maskunits", "maskUnits"],
      ["numoctaves", "numOctaves"],
      ["pathlength", "pathLength"],
      ["patterncontentunits", "patternContentUnits"],
      ["patterntransform", "patternTransform"],
      ["patternunits", "patternUnits"],
      ["pointsatx", "pointsAtX"],
      ["pointsaty", "pointsAtY"],
      ["pointsatz", "pointsAtZ"],
      ["preservealpha", "preserveAlpha"],
      ["preserveaspectratio", "preserveAspectRatio"],
      ["primitiveunits", "primitiveUnits"],
      ["refx", "refX"],
      ["refy", "refY"],
      ["repeatcount", "repeatCount"],
      ["repeatdur", "repeatDur"],
      ["requiredextensions", "requiredExtensions"],
      ["requiredfeatures", "requiredFeatures"],
      ["specularconstant", "specularConstant"],
      ["specularexponent", "specularExponent"],
      ["spreadmethod", "spreadMethod"],
      ["startoffset", "startOffset"],
      ["stddeviation", "stdDeviation"],
      ["stitchtiles", "stitchTiles"],
      ["surfacescale", "surfaceScale"],
      ["systemlanguage", "systemLanguage"],
      ["tablevalues", "tableValues"],
      ["targetx", "targetX"],
      ["targety", "targetY"],
      ["textlength", "textLength"],
      ["viewbox", "viewBox"],
      ["viewtarget", "viewTarget"],
      ["xchannelselector", "xChannelSelector"],
      ["ychannelselector", "yChannelSelector"],
      ["zoomandpan", "zoomAndPan"],
  ]);
  });

  unwrapExports(foreignNames);
  var foreignNames_1 = foreignNames.elementNames;
  var foreignNames_2 = foreignNames.attributeNames;

  var lib$4 = createCommonjsModule(function (module, exports) {
  var __assign = (commonjsGlobal && commonjsGlobal.__assign) || function () {
      __assign = Object.assign || function(t) {
          for (var s, i = 1, n = arguments.length; i < n; i++) {
              s = arguments[i];
              for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                  t[p] = s[p];
          }
          return t;
      };
      return __assign.apply(this, arguments);
  };
  var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
      result["default"] = mod;
      return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  /*
    Module dependencies
  */
  var ElementType = __importStar(lib$2);
  var entities = __importStar(lib$3);
  /* mixed-case SVG and MathML tags & attributes
     recognized by the HTML parser, see
     https://html.spec.whatwg.org/multipage/parsing.html#parsing-main-inforeign
  */

  var unencodedElements = new Set([
      "style",
      "script",
      "xmp",
      "iframe",
      "noembed",
      "noframes",
      "plaintext",
      "noscript",
  ]);
  /*
    Format attributes
  */
  function formatAttributes(attributes, opts) {
      if (!attributes)
          return;
      return Object.keys(attributes)
          .map(function (key) {
          var _a;
          var value = attributes[key];
          if (opts.xmlMode === "foreign") {
              /* fix up mixed-case attribute names */
              key = (_a = foreignNames.attributeNames.get(key)) !== null && _a !== void 0 ? _a : key;
          }
          if (!opts.emptyAttrs &&
              !opts.xmlMode &&
              (value === null || value === "")) {
              return key;
          }
          return key + "=\"" + (opts.decodeEntities
              ? entities.encodeXML(value)
              : value.replace(/"/g, "&quot;")) + "\"";
      })
          .join(" ");
  }
  /*
    Self-enclosing tags
  */
  var singleTag = new Set([
      "area",
      "base",
      "basefont",
      "br",
      "col",
      "command",
      "embed",
      "frame",
      "hr",
      "img",
      "input",
      "isindex",
      "keygen",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
  ]);
  /**
   * Renders a DOM node or an array of DOM nodes to a string.
   *
   * Can be thought of as the equivalent of the `outerHTML` of the passed node(s).
   *
   * @param node Node to be rendered.
   * @param options Changes serialization behavior
   */
  function render(node, options) {
      if (options === void 0) { options = {}; }
      // TODO: This is a bit hacky.
      var nodes = Array.isArray(node) || node.cheerio ? node : [node];
      var output = "";
      for (var i = 0; i < nodes.length; i++) {
          output += renderNode(nodes[i], options);
      }
      return output;
  }
  exports.default = render;
  function renderNode(node, options) {
      switch (node.type) {
          case "root":
              return render(node.children, options);
          case ElementType.Directive:
              return renderDirective(node);
          case ElementType.Comment:
              return renderComment(node);
          case ElementType.CDATA:
              return renderCdata(node);
          default:
              return ElementType.isTag(node)
                  ? renderTag(node, options)
                  : renderText(node, options);
      }
  }
  var foreignModeIntegrationPoints = new Set([
      "mi",
      "mo",
      "mn",
      "ms",
      "mtext",
      "annotation-xml",
      "foreignObject",
      "desc",
      "title",
  ]);
  var foreignElements = new Set(["svg", "math"]);
  function renderTag(elem, opts) {
      var _a;
      // Handle SVG / MathML in HTML
      if (opts.xmlMode === "foreign") {
          /* fix up mixed-case element names */
          elem.name = (_a = foreignNames.elementNames.get(elem.name)) !== null && _a !== void 0 ? _a : elem.name;
          /* exit foreign mode at integration points */
          if (elem.parent &&
              foreignModeIntegrationPoints.has(elem.parent.name))
              opts = __assign(__assign({}, opts), { xmlMode: false });
      }
      if (!opts.xmlMode && foreignElements.has(elem.name)) {
          opts = __assign(__assign({}, opts), { xmlMode: "foreign" });
      }
      var tag = "<" + elem.name;
      var attribs = formatAttributes(elem.attribs, opts);
      if (attribs) {
          tag += " " + attribs;
      }
      if ((!elem.children || elem.children.length === 0) &&
          (opts.xmlMode
              ? // in XML mode or foreign mode, and user hasn't explicitly turned off self-closing tags
                  opts.selfClosingTags !== false
              : // user explicitly asked for self-closing tags, even in HTML mode
                  opts.selfClosingTags && singleTag.has(elem.name))) {
          if (!opts.xmlMode)
              tag += " ";
          tag += "/>";
      }
      else {
          tag += ">";
          if (elem.children) {
              tag += render(elem.children, opts);
          }
          if (opts.xmlMode || !singleTag.has(elem.name)) {
              tag += "</" + elem.name + ">";
          }
      }
      return tag;
  }
  function renderDirective(elem) {
      return "<" + elem.data + ">";
  }
  function renderText(elem, opts) {
      var data = elem.data || "";
      // if entities weren't decoded, no need to encode them back
      if (opts.decodeEntities &&
          !(elem.parent && unencodedElements.has(elem.parent.name))) {
          data = entities.encodeXML(data);
      }
      return data;
  }
  function renderCdata(elem) {
      return "<![CDATA[" + elem.children[0].data + "]]>";
  }
  function renderComment(elem) {
      return "<!--" + elem.data + "-->";
  }
  });

  unwrapExports(lib$4);

  var stringify = createCommonjsModule(function (module, exports) {
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getText = exports.getInnerHTML = exports.getOuterHTML = void 0;

  var dom_serializer_1 = __importDefault(lib$4);
  function getOuterHTML(node, options) {
      return dom_serializer_1.default(node, options);
  }
  exports.getOuterHTML = getOuterHTML;
  function getInnerHTML(node, options) {
      return tagtypes.hasChildren(node)
          ? node.children.map(function (node) { return getOuterHTML(node, options); }).join("")
          : "";
  }
  exports.getInnerHTML = getInnerHTML;
  function getText(node) {
      if (Array.isArray(node))
          return node.map(getText).join("");
      if (tagtypes.isTag(node))
          return node.name === "br" ? "\n" : getText(node.children);
      if (tagtypes.isCDATA(node))
          return getText(node.children);
      if (tagtypes.isText(node))
          return node.data;
      return "";
  }
  exports.getText = getText;
  });

  unwrapExports(stringify);
  var stringify_1$1 = stringify.getText;
  var stringify_2 = stringify.getInnerHTML;
  var stringify_3 = stringify.getOuterHTML;

  var traversal = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.nextElementSibling = exports.getName = exports.hasAttrib = exports.getAttributeValue = exports.getSiblings = exports.getParent = exports.getChildren = void 0;
  function getChildren(elem) {
      return elem.children || null;
  }
  exports.getChildren = getChildren;
  function getParent(elem) {
      return elem.parent || null;
  }
  exports.getParent = getParent;
  function getSiblings(elem) {
      var parent = getParent(elem);
      return parent ? getChildren(parent) : [elem];
  }
  exports.getSiblings = getSiblings;
  function getAttributeValue(elem, name) {
      var _a;
      return (_a = elem.attribs) === null || _a === void 0 ? void 0 : _a[name];
  }
  exports.getAttributeValue = getAttributeValue;
  function hasAttrib(elem, name) {
      return (!!elem.attribs &&
          Object.prototype.hasOwnProperty.call(elem.attribs, name) &&
          elem.attribs[name] != null);
  }
  exports.hasAttrib = hasAttrib;
  /***
   * Returns the name property of an element
   *
   * @param elem The element to get the name for
   */
  function getName(elem) {
      return elem.name;
  }
  exports.getName = getName;
  function nextElementSibling(elem) {
      var node = elem.next;
      while (node !== null && node.type !== "tag")
          node = node.next;
      return node;
  }
  exports.nextElementSibling = nextElementSibling;
  });

  unwrapExports(traversal);
  var traversal_1 = traversal.nextElementSibling;
  var traversal_2 = traversal.getName;
  var traversal_3 = traversal.hasAttrib;
  var traversal_4 = traversal.getAttributeValue;
  var traversal_5 = traversal.getSiblings;
  var traversal_6 = traversal.getParent;
  var traversal_7 = traversal.getChildren;

  var manipulation = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.prepend = exports.append = exports.appendChild = exports.replaceElement = exports.removeElement = void 0;
  /***
   * Remove an element from the dom
   *
   * @param elem The element to be removed
   */
  function removeElement(elem) {
      if (elem.prev)
          elem.prev.next = elem.next;
      if (elem.next)
          elem.next.prev = elem.prev;
      if (elem.parent) {
          var childs = elem.parent.children;
          childs.splice(childs.lastIndexOf(elem), 1);
      }
  }
  exports.removeElement = removeElement;
  /***
   * Replace an element in the dom
   *
   * @param elem The element to be replaced
   * @param replacement The element to be added
   */
  function replaceElement(elem, replacement) {
      var prev = (replacement.prev = elem.prev);
      if (prev) {
          prev.next = replacement;
      }
      var next = (replacement.next = elem.next);
      if (next) {
          next.prev = replacement;
      }
      var parent = (replacement.parent = elem.parent);
      if (parent) {
          var childs = parent.children;
          childs[childs.lastIndexOf(elem)] = replacement;
      }
  }
  exports.replaceElement = replaceElement;
  /***
   * Append a child to an element
   *
   * @param elem The element to append to
   * @param child The element to be added as a child
   */
  function appendChild(elem, child) {
      removeElement(child);
      child.parent = elem;
      if (elem.children.push(child) !== 1) {
          var sibling = elem.children[elem.children.length - 2];
          sibling.next = child;
          child.prev = sibling;
          child.next = null;
      }
  }
  exports.appendChild = appendChild;
  /***
   * Append an element after another
   *
   * @param elem The element to append to
   * @param next The element be added
   */
  function append(elem, next) {
      removeElement(next);
      var parent = elem.parent;
      var currNext = elem.next;
      next.next = currNext;
      next.prev = elem;
      elem.next = next;
      next.parent = parent;
      if (currNext) {
          currNext.prev = next;
          if (parent) {
              var childs = parent.children;
              childs.splice(childs.lastIndexOf(currNext), 0, next);
          }
      }
      else if (parent) {
          parent.children.push(next);
      }
  }
  exports.append = append;
  /***
   * Prepend an element before another
   *
   * @param elem The element to append to
   * @param prev The element be added
   */
  function prepend(elem, prev) {
      var parent = elem.parent;
      if (parent) {
          var childs = parent.children;
          childs.splice(childs.lastIndexOf(elem), 0, prev);
      }
      if (elem.prev) {
          elem.prev.next = prev;
      }
      prev.parent = parent;
      prev.prev = elem.prev;
      prev.next = elem;
      elem.prev = prev;
  }
  exports.prepend = prepend;
  });

  unwrapExports(manipulation);
  var manipulation_1 = manipulation.prepend;
  var manipulation_2 = manipulation.append;
  var manipulation_3 = manipulation.appendChild;
  var manipulation_4 = manipulation.replaceElement;
  var manipulation_5 = manipulation.removeElement;

  var querying = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.findAll = exports.existsOne = exports.findOne = exports.findOneChild = exports.find = exports.filter = void 0;

  /**
   * Search a node and its children for nodes passing a test function.
   *
   * @param test Function to test nodes on.
   * @param element Element to search. Will be included in the result set if it matches.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   */
  function filter(test, node, recurse, limit) {
      if (recurse === void 0) { recurse = true; }
      if (limit === void 0) { limit = Infinity; }
      if (!Array.isArray(node))
          node = [node];
      return find(test, node, recurse, limit);
  }
  exports.filter = filter;
  /**
   * Like `filter`, but only works on an array of nodes.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @param recurse Also consider child nodes.
   * @param limit Maximum number of nodes to return.
   */
  function find(test, nodes, recurse, limit) {
      var result = [];
      for (var _i = 0, nodes_1 = nodes; _i < nodes_1.length; _i++) {
          var elem = nodes_1[_i];
          if (test(elem)) {
              result.push(elem);
              if (--limit <= 0)
                  break;
          }
          if (recurse && tagtypes.hasChildren(elem) && elem.children.length > 0) {
              var children = find(test, elem.children, recurse, limit);
              result.push.apply(result, children);
              limit -= children.length;
              if (limit <= 0)
                  break;
          }
      }
      return result;
  }
  exports.find = find;
  /**
   * Finds the first element inside of an array that matches a test function.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   */
  function findOneChild(test, nodes) {
      return nodes.find(test);
  }
  exports.findOneChild = findOneChild;
  /**
   * Finds one element in a tree that passes a test.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   * @param recurse Also consider child nodes.
   */
  function findOne(test, nodes, recurse) {
      if (recurse === void 0) { recurse = true; }
      var elem = null;
      for (var i = 0; i < nodes.length && !elem; i++) {
          var checked = nodes[i];
          if (!tagtypes.isTag(checked)) {
              continue;
          }
          else if (test(checked)) {
              elem = checked;
          }
          else if (recurse && checked.children.length > 0) {
              elem = findOne(test, checked.children);
          }
      }
      return elem;
  }
  exports.findOne = findOne;
  /**
   * Returns whether a tree of nodes contains at least one node passing a test.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   */
  function existsOne(test, nodes) {
      return nodes.some(function (checked) {
          return tagtypes.isTag(checked) &&
              (test(checked) ||
                  (checked.children.length > 0 &&
                      existsOne(test, checked.children)));
      });
  }
  exports.existsOne = existsOne;
  /**
   * Search and array of nodes and its children for nodes passing a test function.
   *
   * Same as `find`, only with less options, leading to reduced complexity.
   *
   * @param test Function to test nodes on.
   * @param nodes Array of nodes to search.
   */
  function findAll(test, nodes) {
      var _a;
      var result = [];
      var stack = nodes.filter(tagtypes.isTag);
      var elem;
      while ((elem = stack.shift())) {
          var children = (_a = elem.children) === null || _a === void 0 ? void 0 : _a.filter(tagtypes.isTag);
          if (children && children.length > 0) {
              stack.unshift.apply(stack, children);
          }
          if (test(elem))
              result.push(elem);
      }
      return result;
  }
  exports.findAll = findAll;
  });

  unwrapExports(querying);
  var querying_1 = querying.findAll;
  var querying_2 = querying.existsOne;
  var querying_3 = querying.findOne;
  var querying_4 = querying.findOneChild;
  var querying_5 = querying.find;
  var querying_6 = querying.filter;

  var legacy$2 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.getElementsByTagType = exports.getElementsByTagName = exports.getElementById = exports.getElements = exports.testElement = void 0;


  function isTextNode(node) {
      return node.type === "text" /* Text */;
  }
  /* eslint-disable @typescript-eslint/camelcase */
  var Checks = {
      tag_name: function (name) {
          if (typeof name === "function") {
              return function (elem) { return tagtypes.isTag(elem) && name(elem.name); };
          }
          else if (name === "*") {
              return tagtypes.isTag;
          }
          else {
              return function (elem) { return tagtypes.isTag(elem) && elem.name === name; };
          }
      },
      tag_type: function (type) {
          if (typeof type === "function") {
              return function (elem) { return type(elem.type); };
          }
          else {
              return function (elem) { return elem.type === type; };
          }
      },
      tag_contains: function (data) {
          if (typeof data === "function") {
              return function (elem) { return isTextNode(elem) && data(elem.data); };
          }
          else {
              return function (elem) { return isTextNode(elem) && elem.data === data; };
          }
      },
  };
  /* eslint-enable @typescript-eslint/camelcase */
  function getAttribCheck(attrib, value) {
      if (typeof value === "function") {
          return function (elem) { return tagtypes.isTag(elem) && value(elem.attribs[attrib]); };
      }
      else {
          return function (elem) { return tagtypes.isTag(elem) && elem.attribs[attrib] === value; };
      }
  }
  function combineFuncs(a, b) {
      return function (elem) { return a(elem) || b(elem); };
  }
  function compileTest(options) {
      var funcs = Object.keys(options).map(function (key) {
          var value = options[key];
          return key in Checks
              ? Checks[key](value)
              : getAttribCheck(key, value);
      });
      return funcs.length === 0 ? null : funcs.reduce(combineFuncs);
  }
  function testElement(options, element) {
      var test = compileTest(options);
      return test ? test(element) : true;
  }
  exports.testElement = testElement;
  function getElements(options, element, recurse, limit) {
      if (limit === void 0) { limit = Infinity; }
      var test = compileTest(options);
      return test ? querying.filter(test, element, recurse, limit) : [];
  }
  exports.getElements = getElements;
  function getElementById(id, element, recurse) {
      if (recurse === void 0) { recurse = true; }
      if (!Array.isArray(element))
          element = [element];
      return querying.findOne(getAttribCheck("id", id), element, recurse);
  }
  exports.getElementById = getElementById;
  function getElementsByTagName(name, element, recurse, limit) {
      if (limit === void 0) { limit = Infinity; }
      return querying.filter(Checks.tag_name(name), element, recurse, limit);
  }
  exports.getElementsByTagName = getElementsByTagName;
  function getElementsByTagType(type, element, recurse, limit) {
      if (recurse === void 0) { recurse = true; }
      if (limit === void 0) { limit = Infinity; }
      return querying.filter(Checks.tag_type(type), element, recurse, limit);
  }
  exports.getElementsByTagType = getElementsByTagType;
  });

  unwrapExports(legacy$2);
  var legacy_1 = legacy$2.getElementsByTagType;
  var legacy_2 = legacy$2.getElementsByTagName;
  var legacy_3 = legacy$2.getElementById;
  var legacy_4 = legacy$2.getElements;
  var legacy_5 = legacy$2.testElement;

  var helpers = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.uniqueSort = exports.compareDocumentPosition = exports.removeSubsets = void 0;

  /**
   * Given an array of nodes, remove any member that is contained by another.
   *
   * @param nodes Nodes to filter.
   */
  function removeSubsets(nodes) {
      var idx = nodes.length;
      // Check if each node (or one of its ancestors) is already contained in the
      // array.
      while (--idx >= 0) {
          var node = nodes[idx];
          // Remove the node if it is not unique.
          // We are going through the array from the end, so we only
          // have to check nodes that preceed the node under consideration in the array.
          if (idx > 0 && nodes.lastIndexOf(node, idx - 1) >= 0) {
              nodes.splice(idx, 1);
              continue;
          }
          for (var ancestor = node.parent; ancestor; ancestor = ancestor.parent) {
              if (nodes.indexOf(ancestor) > -1) {
                  nodes.splice(idx, 1);
                  break;
              }
          }
      }
      return nodes;
  }
  exports.removeSubsets = removeSubsets;
  /***
   * Compare the position of one node against another node in any other document.
   * The return value is a bitmask with the following values:
   *
   * document order:
   * > There is an ordering, document order, defined on all the nodes in the
   * > document corresponding to the order in which the first character of the
   * > XML representation of each node occurs in the XML representation of the
   * > document after expansion of general entities. Thus, the document element
   * > node will be the first node. Element nodes occur before their children.
   * > Thus, document order orders element nodes in order of the occurrence of
   * > their start-tag in the XML (after expansion of entities). The attribute
   * > nodes of an element occur after the element and before its children. The
   * > relative order of attribute nodes is implementation-dependent./
   *
   * Source:
   * http://www.w3.org/TR/DOM-Level-3-Core/glossary.html#dt-document-order
   * @param nodaA The first node to use in the comparison
   * @param nodeB The second node to use in the comparison
   *
   * @return A bitmask describing the input nodes' relative position.
   *
   *        See http://dom.spec.whatwg.org/#dom-node-comparedocumentposition for
   *        a description of these values.
   */
  function compareDocumentPosition(nodeA, nodeB) {
      var aParents = [];
      var bParents = [];
      if (nodeA === nodeB) {
          return 0;
      }
      var current = tagtypes.hasChildren(nodeA) ? nodeA : nodeA.parent;
      while (current) {
          aParents.unshift(current);
          current = current.parent;
      }
      current = tagtypes.hasChildren(nodeB) ? nodeB : nodeB.parent;
      while (current) {
          bParents.unshift(current);
          current = current.parent;
      }
      var idx = 0;
      while (aParents[idx] === bParents[idx]) {
          idx++;
      }
      if (idx === 0) {
          return 1 /* DISCONNECTED */;
      }
      var sharedParent = aParents[idx - 1];
      var siblings = sharedParent.children;
      var aSibling = aParents[idx];
      var bSibling = bParents[idx];
      if (siblings.indexOf(aSibling) > siblings.indexOf(bSibling)) {
          if (sharedParent === nodeB) {
              return 4 /* FOLLOWING */ | 16 /* CONTAINED_BY */;
          }
          return 4 /* FOLLOWING */;
      }
      else {
          if (sharedParent === nodeA) {
              return 2 /* PRECEDING */ | 8 /* CONTAINS */;
          }
          return 2 /* PRECEDING */;
      }
  }
  exports.compareDocumentPosition = compareDocumentPosition;
  /***
   * Sort an array of nodes based on their relative position in the document and
   * remove any duplicate nodes. If the array contains nodes that do not belong
   * to the same document, sort order is unspecified.
   *
   * @param nodes Array of DOM nodes
   * @returns collection of unique nodes, sorted in document order
   */
  function uniqueSort(nodes) {
      nodes = nodes.filter(function (node, i, arr) { return !arr.includes(node, i + 1); });
      nodes.sort(function (a, b) {
          var relative = compareDocumentPosition(a, b);
          if (relative & 2 /* PRECEDING */) {
              return -1;
          }
          else if (relative & 4 /* FOLLOWING */) {
              return 1;
          }
          return 0;
      });
      return nodes;
  }
  exports.uniqueSort = uniqueSort;
  });

  unwrapExports(helpers);
  var helpers_1 = helpers.uniqueSort;
  var helpers_2 = helpers.compareDocumentPosition;
  var helpers_3 = helpers.removeSubsets;

  var lib$5 = createCommonjsModule(function (module, exports) {
  var __createBinding = (commonjsGlobal && commonjsGlobal.__createBinding) || (Object.create ? (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
  }) : (function(o, m, k, k2) {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
  }));
  var __exportStar = (commonjsGlobal && commonjsGlobal.__exportStar) || function(m, exports) {
      for (var p in m) if (p !== "default" && !exports.hasOwnProperty(p)) __createBinding(exports, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(stringify, exports);
  __exportStar(traversal, exports);
  __exportStar(manipulation, exports);
  __exportStar(querying, exports);
  __exportStar(legacy$2, exports);
  __exportStar(helpers, exports);
  __exportStar(tagtypes, exports);
  });

  unwrapExports(lib$5);

  var FeedHandler_1 = createCommonjsModule(function (module, exports) {
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
      result["default"] = mod;
      return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var domhandler_1 = __importDefault(lib$1);
  var DomUtils = __importStar(lib$5);

  //TODO: Consume data as it is coming in
  var FeedHandler = /** @class */ (function (_super) {
      __extends(FeedHandler, _super);
      /**
       *
       * @param callback
       * @param options
       */
      function FeedHandler(callback, options) {
          var _this = this;
          if (typeof callback === "object" && callback !== null) {
              callback = undefined;
              options = callback;
          }
          _this = _super.call(this, callback, options) || this;
          return _this;
      }
      FeedHandler.prototype.onend = function () {
          var feed = {};
          var feedRoot = getOneElement(isValidFeed, this.dom);
          if (feedRoot) {
              if (feedRoot.name === "feed") {
                  var childs = feedRoot.children;
                  feed.type = "atom";
                  addConditionally(feed, "id", "id", childs);
                  addConditionally(feed, "title", "title", childs);
                  var href = getAttribute("href", getOneElement("link", childs));
                  if (href) {
                      feed.link = href;
                  }
                  addConditionally(feed, "description", "subtitle", childs);
                  var updated = fetch("updated", childs);
                  if (updated) {
                      feed.updated = new Date(updated);
                  }
                  addConditionally(feed, "author", "email", childs, true);
                  feed.items = getElements("entry", childs).map(function (item) {
                      var entry = {};
                      var children = item.children;
                      addConditionally(entry, "id", "id", children);
                      addConditionally(entry, "title", "title", children);
                      var href = getAttribute("href", getOneElement("link", children));
                      if (href) {
                          entry.link = href;
                      }
                      var description = fetch("summary", children) ||
                          fetch("content", children);
                      if (description) {
                          entry.description = description;
                      }
                      var pubDate = fetch("updated", children);
                      if (pubDate) {
                          entry.pubDate = new Date(pubDate);
                      }
                      return entry;
                  });
              }
              else {
                  var childs = getOneElement("channel", feedRoot.children)
                      .children;
                  feed.type = feedRoot.name.substr(0, 3);
                  feed.id = "";
                  addConditionally(feed, "title", "title", childs);
                  addConditionally(feed, "link", "link", childs);
                  addConditionally(feed, "description", "description", childs);
                  var updated = fetch("lastBuildDate", childs);
                  if (updated) {
                      feed.updated = new Date(updated);
                  }
                  addConditionally(feed, "author", "managingEditor", childs, true);
                  feed.items = getElements("item", feedRoot.children).map(function (item) {
                      var entry = {};
                      var children = item.children;
                      addConditionally(entry, "id", "guid", children);
                      addConditionally(entry, "title", "title", children);
                      addConditionally(entry, "link", "link", children);
                      addConditionally(entry, "description", "description", children);
                      var pubDate = fetch("pubDate", children);
                      if (pubDate)
                          entry.pubDate = new Date(pubDate);
                      return entry;
                  });
              }
          }
          this.feed = feed;
          this.handleCallback(feedRoot ? null : Error("couldn't find root of feed"));
      };
      return FeedHandler;
  }(domhandler_1.default));
  exports.FeedHandler = FeedHandler;
  function getElements(what, where) {
      return DomUtils.getElementsByTagName(what, where, true);
  }
  function getOneElement(what, where) {
      return DomUtils.getElementsByTagName(what, where, true, 1)[0];
  }
  function fetch(what, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      return DomUtils.getText(DomUtils.getElementsByTagName(what, where, recurse, 1)).trim();
  }
  function getAttribute(name, elem) {
      if (!elem) {
          return null;
      }
      var attribs = elem.attribs;
      return attribs[name];
  }
  function addConditionally(obj, prop, what, where, recurse) {
      if (recurse === void 0) { recurse = false; }
      var tmp = fetch(what, where, recurse);
      // @ts-ignore
      if (tmp)
          obj[prop] = tmp;
  }
  function isValidFeed(value) {
      return value === "rss" || value === "feed" || value === "rdf:RDF";
  }
  var defaultOptions = { xmlMode: true };
  /**
   * Parse a feed.
   *
   * @param feed The feed that should be parsed, as a string.
   * @param options Optionally, options for parsing. When using this option, you probably want to set `xmlMode` to `true`.
   */
  function parseFeed(feed, options) {
      if (options === void 0) { options = defaultOptions; }
      var handler = new FeedHandler(options);
      new Parser_1.Parser(handler, options).end(feed);
      return handler.feed;
  }
  exports.parseFeed = parseFeed;
  });

  unwrapExports(FeedHandler_1);
  var FeedHandler_2 = FeedHandler_1.FeedHandler;
  var FeedHandler_3 = FeedHandler_1.parseFeed;

  var WritableStream_1 = createCommonjsModule(function (module, exports) {
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  Object.defineProperty(exports, "__esModule", { value: true });



  // Following the example in https://nodejs.org/api/stream.html#stream_decoding_buffers_in_a_writable_stream
  function isBuffer(_chunk, encoding) {
      return encoding === "buffer";
  }
  /**
   * WritableStream makes the `Parser` interface available as a NodeJS stream.
   *
   * @see Parser
   */
  var WritableStream = /** @class */ (function (_super) {
      __extends(WritableStream, _super);
      function WritableStream(cbs, options) {
          var _this = _super.call(this, { decodeStrings: false }) || this;
          _this._decoder = new string_decoder__default['default'].StringDecoder();
          _this._parser = new Parser_1.Parser(cbs, options);
          return _this;
      }
      WritableStream.prototype._write = function (chunk, encoding, cb) {
          if (isBuffer(chunk, encoding))
              chunk = this._decoder.write(chunk);
          this._parser.write(chunk);
          cb();
      };
      WritableStream.prototype._final = function (cb) {
          this._parser.end(this._decoder.end());
          cb();
      };
      return WritableStream;
  }(stream__default['default'].Writable));
  exports.WritableStream = WritableStream;
  });

  unwrapExports(WritableStream_1);
  var WritableStream_2 = WritableStream_1.WritableStream;

  var MultiplexHandler_1 = createCommonjsModule(function (module, exports) {
  Object.defineProperty(exports, "__esModule", { value: true });
  /**
   * Calls a specific handler function for all events that are encountered.
   *
   * @param func — The function to multiplex all events to.
   */
  var MultiplexHandler = /** @class */ (function () {
      function MultiplexHandler(func) {
          this._func = func;
      }
      /* Format: eventname: number of arguments */
      MultiplexHandler.prototype.onattribute = function (name, value) {
          this._func("onattribute", name, value);
      };
      MultiplexHandler.prototype.oncdatastart = function () {
          this._func("oncdatastart");
      };
      MultiplexHandler.prototype.oncdataend = function () {
          this._func("oncdataend");
      };
      MultiplexHandler.prototype.ontext = function (text) {
          this._func("ontext", text);
      };
      MultiplexHandler.prototype.onprocessinginstruction = function (name, value) {
          this._func("onprocessinginstruction", name, value);
      };
      MultiplexHandler.prototype.oncomment = function (comment) {
          this._func("oncomment", comment);
      };
      MultiplexHandler.prototype.oncommentend = function () {
          this._func("oncommentend");
      };
      MultiplexHandler.prototype.onclosetag = function (name) {
          this._func("onclosetag", name);
      };
      MultiplexHandler.prototype.onopentag = function (name, attribs) {
          this._func("onopentag", name, attribs);
      };
      MultiplexHandler.prototype.onopentagname = function (name) {
          this._func("onopentagname", name);
      };
      MultiplexHandler.prototype.onerror = function (error) {
          this._func("onerror", error);
      };
      MultiplexHandler.prototype.onend = function () {
          this._func("onend");
      };
      MultiplexHandler.prototype.onparserinit = function (parser) {
          this._func("onparserinit", parser);
      };
      MultiplexHandler.prototype.onreset = function () {
          this._func("onreset");
      };
      return MultiplexHandler;
  }());
  exports.default = MultiplexHandler;
  });

  unwrapExports(MultiplexHandler_1);

  var CollectingHandler_1 = createCommonjsModule(function (module, exports) {
  var __extends = (commonjsGlobal && commonjsGlobal.__extends) || (function () {
      var extendStatics = function (d, b) {
          extendStatics = Object.setPrototypeOf ||
              ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
              function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
          return extendStatics(d, b);
      };
      return function (d, b) {
          extendStatics(d, b);
          function __() { this.constructor = d; }
          d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
      };
  })();
  var __importDefault = (commonjsGlobal && commonjsGlobal.__importDefault) || function (mod) {
      return (mod && mod.__esModule) ? mod : { "default": mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  var MultiplexHandler_1$1 = __importDefault(MultiplexHandler_1);
  var CollectingHandler = /** @class */ (function (_super) {
      __extends(CollectingHandler, _super);
      function CollectingHandler(cbs) {
          if (cbs === void 0) { cbs = {}; }
          var _this = _super.call(this, function (name) {
              var _a;
              var args = [];
              for (var _i = 1; _i < arguments.length; _i++) {
                  args[_i - 1] = arguments[_i];
              }
              _this.events.push([name].concat(args));
              // @ts-ignore
              if (_this._cbs[name])
                  (_a = _this._cbs)[name].apply(_a, args);
          }) || this;
          _this._cbs = cbs;
          _this.events = [];
          return _this;
      }
      CollectingHandler.prototype.onreset = function () {
          this.events = [];
          if (this._cbs.onreset)
              this._cbs.onreset();
      };
      CollectingHandler.prototype.restart = function () {
          var _a;
          if (this._cbs.onreset)
              this._cbs.onreset();
          for (var i = 0; i < this.events.length; i++) {
              var _b = this.events[i], name_1 = _b[0], args = _b.slice(1);
              if (!this._cbs[name_1]) {
                  continue;
              }
              // @ts-ignore
              (_a = this._cbs)[name_1].apply(_a, args);
          }
      };
      return CollectingHandler;
  }(MultiplexHandler_1$1.default));
  exports.CollectingHandler = CollectingHandler;
  });

  unwrapExports(CollectingHandler_1);
  var CollectingHandler_2 = CollectingHandler_1.CollectingHandler;

  var lib$6 = createCommonjsModule(function (module, exports) {
  function __export(m) {
      for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
  }
  var __importStar = (commonjsGlobal && commonjsGlobal.__importStar) || function (mod) {
      if (mod && mod.__esModule) return mod;
      var result = {};
      if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
      result["default"] = mod;
      return result;
  };
  Object.defineProperty(exports, "__esModule", { value: true });

  exports.Parser = Parser_1.Parser;

  exports.DomHandler = lib$1.DomHandler;
  exports.DefaultHandler = lib$1.DomHandler;
  // Helper methods
  /**
   * Parses data, returns the resulting DOM.
   *
   * @param data The data that should be parsed.
   * @param options Optional options for the parser and DOM builder.
   */
  function parseDOM(data, options) {
      var handler = new lib$1.DomHandler(void 0, options);
      new Parser_1.Parser(handler, options).end(data);
      return handler.dom;
  }
  exports.parseDOM = parseDOM;
  /**
   * Creates a parser instance, with an attached DOM handler.
   *
   * @param cb A callback that will be called once parsing has been completed.
   * @param options Optional options for the parser and DOM builder.
   * @param elementCb An optional callback that will be called every time a tag has been completed inside of the DOM.
   */
  function createDomStream(cb, options, elementCb) {
      var handler = new lib$1.DomHandler(cb, options, elementCb);
      return new Parser_1.Parser(handler, options);
  }
  exports.createDomStream = createDomStream;

  exports.Tokenizer = Tokenizer_1.default;
  var ElementType = __importStar(lib$2);
  exports.ElementType = ElementType;
  /**
   * List of all events that the parser emits.
   *
   * Format: eventname: number of arguments.
   */
  exports.EVENTS = {
      attribute: 2,
      cdatastart: 0,
      cdataend: 0,
      text: 1,
      processinginstruction: 2,
      comment: 1,
      commentend: 0,
      closetag: 1,
      opentag: 2,
      opentagname: 1,
      error: 1,
      end: 0
  };
  /*
      All of the following exports exist for backwards-compatibility.
      They should probably be removed eventually.
  */
  __export(FeedHandler_1);
  __export(WritableStream_1);
  __export(CollectingHandler_1);
  var DomUtils = __importStar(lib$5);
  exports.DomUtils = DomUtils;
  var FeedHandler_1$1 = FeedHandler_1;
  exports.RssHandler = FeedHandler_1$1.FeedHandler;
  });

  unwrapExports(lib$6);
  var lib_1$3 = lib$6.Parser;
  var lib_2$3 = lib$6.DomHandler;
  var lib_3$3 = lib$6.DefaultHandler;
  var lib_4$2 = lib$6.parseDOM;
  var lib_5$2 = lib$6.createDomStream;
  var lib_6$1 = lib$6.Tokenizer;
  var lib_7$1 = lib$6.ElementType;
  var lib_8$1 = lib$6.EVENTS;
  var lib_9$1 = lib$6.DomUtils;
  var lib_10 = lib$6.RssHandler;

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

    let parser = new lib_1$3({
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

  function xml$2(itag, iattrs, ...ichildren) {
    let { tag, attrs, children } = hArgumentParser(itag, iattrs, ichildren);
    return markup(true, tag, attrs, children)
  }

  xml$2.firstLine = '<?xml version="1.0" encoding="utf-8"?>';
  xml$2.xml = true;

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
  exports.xml = xml$2;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
