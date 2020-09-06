'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var cssWhat = require('css-what');
var htmlparser2 = require('htmlparser2');

function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function ownKeys(object, enumerableOnly) {
  var keys = Object.keys(object);

  if (Object.getOwnPropertySymbols) {
    var symbols = Object.getOwnPropertySymbols(object);
    if (enumerableOnly) symbols = symbols.filter(function (sym) {
      return Object.getOwnPropertyDescriptor(object, sym).enumerable;
    });
    keys.push.apply(keys, symbols);
  }

  return keys;
}

function _objectSpread2(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};

    if (i % 2) {
      ownKeys(Object(source), true).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    } else if (Object.getOwnPropertyDescriptors) {
      Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
    } else {
      ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
  }

  return target;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}

function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function _isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  return _assertThisInitialized(self);
}

function _createSuper(Derived) {
  var hasNativeReflectConstruct = _isNativeReflectConstruct();

  return function _createSuperInternal() {
    var Super = _getPrototypeOf(Derived),
        result;

    if (hasNativeReflectConstruct) {
      var NewTarget = _getPrototypeOf(this).constructor;

      result = Reflect.construct(Super, arguments, NewTarget);
    } else {
      result = Super.apply(this, arguments);
    }

    return _possibleConstructorReturn(this, result);
  };
}

function _superPropBase(object, property) {
  while (!Object.prototype.hasOwnProperty.call(object, property)) {
    object = _getPrototypeOf(object);
    if (object === null) break;
  }

  return object;
}

function _get(target, property, receiver) {
  if (typeof Reflect !== "undefined" && Reflect.get) {
    _get = Reflect.get;
  } else {
    _get = function _get(target, property, receiver) {
      var base = _superPropBase(target, property);

      if (!base) return;
      var desc = Object.getOwnPropertyDescriptor(base, property);

      if (desc.get) {
        return desc.get.call(receiver);
      }

      return desc.value;
    };
  }

  return _get(target, property, receiver || target);
}

function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}

function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}

function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}

function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter);
}

function _iterableToArrayLimit(arr, i) {
  if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _e = undefined;

  try {
    for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);

      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }

  return _arr;
}

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}

function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;

  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

  return arr2;
}

function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}

function _createForOfIteratorHelper(o, allowArrayLike) {
  var it;

  if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) {
    if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") {
      if (it) o = it;
      var i = 0;

      var F = function () {};

      return {
        s: F,
        n: function () {
          if (i >= o.length) return {
            done: true
          };
          return {
            done: false,
            value: o[i++]
          };
        },
        e: function (e) {
          throw e;
        },
        f: F
      };
    }

    throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var normalCompletion = true,
      didErr = false,
      err;
  return {
    s: function () {
      it = o[Symbol.iterator]();
    },
    n: function () {
      var step = it.next();
      normalCompletion = step.done;
      return step;
    },
    e: function (e) {
      didErr = true;
      err = e;
    },
    f: function () {
      try {
        if (!normalCompletion && it.return != null) it.return();
      } finally {
        if (didErr) throw err;
      }
    }
  };
}

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

/*
 * Abstraction for h/jsx like DOM descriptions.
 * It is used in DOM, VDOM
 *
 */
function _h(context, tag, attrs, children) {
  if (typeof tag === 'function') {
    return tag.call(null, {
      props: _objectSpread2(_objectSpread2({}, attrs), {}, {
        children: children
      }),
      attrs: attrs,
      children: children,
      h: context.h,
      context: context
    });
  } else {
    var _ret = function () {
      var el;

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
        for (var _i = 0, _Object$entries = Object.entries(attrs); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
              key = _Object$entries$_i[0],
              value = _Object$entries$_i[1];

          if (key && typeof key === 'string') {
            key = key.toLowerCase();
          }

          if (key === 'classname') {
            el.className = value;
          } else if (key === 'on') {
            Object.entries(value).forEach(function (_ref) {
              var _ref2 = _slicedToArray(_ref, 2),
                  name = _ref2[0],
                  value = _ref2[1];

              el.setAttribute('on' + name, value);
            }); // else if (key.indexOf('on') === 0) {
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
        var _iterator = _createForOfIteratorHelper(children),
            _step;

        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var childOuter = _step.value;
            var cc = Array.isArray(childOuter) ? _toConsumableArray(childOuter) : [childOuter];

            var _iterator2 = _createForOfIteratorHelper(cc),
                _step2;

            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var child = _step2.value;

                if (child) {
                  if (child !== false && child != null) {
                    if (_typeof(child) !== 'object') {
                      el.appendChild(context.document.createTextNode(child.toString()));
                    } else {
                      el.appendChild(child);
                    }
                  }
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }

      return {
        v: el
      };
    }();

    if (_typeof(_ret) === "object") return _ret.v;
  }
}

function hArgumentParser(tag, attrs) {
  for (var _len = arguments.length, children = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    children[_key - 2] = arguments[_key];
  }

  if (_typeof(tag) === 'object') {
    tag = 'fragment';
    children = tag.children;
    attrs = tag.attrs;
  }

  if (Array.isArray(attrs)) {
    children = attrs;
    attrs = {};
  } else if (attrs) {
    if (attrs.attrs) {
      attrs = _objectSpread2(_objectSpread2({}, attrs.attrs), attrs);
      delete attrs.attrs;
    }
  } else {
    attrs = {};
  }

  return {
    tag: tag,
    attrs: attrs,
    // @ts-ignore
    children: children.flat(Infinity)
  };
} // global.hh = function (...args) {
//   console.log('hh', args)
// }

function hFactory(context) {
  // let context = { document }
  context.h = function h(itag, iattrs) {
    for (var _len2 = arguments.length, ichildren = new Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
      ichildren[_key2 - 2] = arguments[_key2];
    }

    var _hArgumentParser = hArgumentParser(itag, iattrs, ichildren),
        tag = _hArgumentParser.tag,
        attrs = _hArgumentParser.attrs,
        children = _hArgumentParser.children;

    return _h(context, tag, attrs, children);
  };

  return context.h;
}

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright
//   escape as escapeHTML,
//   unescape as unescapeHTML,
// } from 'he'

function escapeHTML(s) {
  if (!s) return s;
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/'/g, '&apos;').replace(/"/g, '&quot;');
}
function unescapeHTML(s) {
  if (!s) return s;
  return s.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&quot;/gi, '"').replace(/&apos;/gi, '\'').replace(/&amp;/gi, '&');
}

var USED_JSX = []; // HACK:dholtwick:2016-08-23

function CDATA(s) {
  s = '<![CDATA[' + s + ']]>';
  USED_JSX.push(s);
  return s;
}
//   return '<?xml version="1.0" encoding="utf-8"?>\n' + s
// }
// https://reactjs.org/docs/jsx-in-depth.html

function markup(xmlMode, tag, attrs, children) {
  // console.log('markup', xmlMode, tag, attrs, children)
  var hasChildren = children && children.length > 0;
  var s = '';
  tag = tag.replace(/__/g, ':');

  if (tag !== 'noop') {
    if (tag !== 'cdata') {
      s += "<".concat(tag);
    } else {
      s += '<![CDATA[';
    } // Add attributes


    for (var name in attrs) {
      if (name && attrs.hasOwnProperty(name)) {
        var _ret = function () {
          var v = attrs[name];

          if (name === 'html') {
            return "continue";
          }

          if (name.toLowerCase() === 'classname') {
            name = 'class';
          }

          name = name.replace(/__/g, ':');

          if (v === true) {
            s += " ".concat(name, "=\"").concat(name, "\"");
          } else if (name === 'style' && _typeof(v) === 'object') {
            s += " ".concat(name, "=\"").concat(Object.keys(v).filter(function (k) {
              return v[k] != null;
            }).map(function (k) {
              var vv = v[k];
              vv = typeof vv === 'number' ? vv + 'px' : vv;
              return "".concat(k.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase(), ":").concat(vv);
            }).join(';'), "\"");
          } else if (v !== false && v != null) {
            s += " ".concat(name, "=\"").concat(escapeHTML(v.toString()), "\"");
          }
        }();

        if (_ret === "continue") continue;
      }
    }

    if (tag !== 'cdata') {
      if (xmlMode && !hasChildren) {
        s += ' />';
        USED_JSX.push(s);
        return s;
      } else {
        s += ">";
      }
    }

    if (!xmlMode) {
      if (['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'source', 'track', 'wbr'].indexOf(tag) !== -1) {
        USED_JSX.push(s);
        return s;
      }
    }
  } // Append children


  if (hasChildren) {
    var _iterator = _createForOfIteratorHelper(children),
        _step;

    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var child = _step.value;

        if (child != null && child !== false) {
          if (!Array.isArray(child)) {
            child = [child];
          }

          var _iterator2 = _createForOfIteratorHelper(child),
              _step2;

          try {
            for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
              var c = _step2.value;

              if (USED_JSX.indexOf(c) !== -1 || tag === 'script' || tag === 'style') {
                s += c;
              } else {
                s += escapeHTML(c.toString());
              }
            }
          } catch (err) {
            _iterator2.e(err);
          } finally {
            _iterator2.f();
          }
        }
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }

  if (attrs.html) {
    s += attrs.html;
  }

  if (tag !== 'noop') {
    if (tag !== 'cdata') {
      s += "</".concat(tag, ">");
    } else {
      s += ']]>';
    }
  }

  USED_JSX.push(s);
  return s;
}
function html(itag, iattrs) {
  for (var _len = arguments.length, ichildren = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    ichildren[_key - 2] = arguments[_key];
  }

  var _hArgumentParser = hArgumentParser(itag, iattrs, ichildren),
      tag = _hArgumentParser.tag,
      attrs = _hArgumentParser.attrs,
      children = _hArgumentParser.children;

  return markup(false, tag, attrs, children);
}
html.firstLine = '<!DOCTYPE html>';
html.html = true;

var cache = {};
function parseSelector(selector) {
  var ast = cache[selector];

  if (ast == null) {
    ast = cssWhat.parse(selector);
    cache[selector] = ast;
  }

  return ast;
} // Just a very small subset for now: https://github.com/fb55/css-what#api

function matchSelector(selector, element) {
  var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
      _ref$debug = _ref.debug,
      debug = _ref$debug === void 0 ? false : _ref$debug;

  var _iterator = _createForOfIteratorHelper(parseSelector(selector)),
      _step;

  try {
    var _loop = function _loop() {
      var rules = _step.value;

      if (debug) {
        console.log('Selector:', selector);
        console.log('Rules:', rules);
        console.log('Element:', element);
      }

      function handleRules(element, rules) {
        var success = false;

        var _iterator2 = _createForOfIteratorHelper(rules),
            _step2;

        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var part = _step2.value;
            var type = part.type,
                name = part.name,
                action = part.action,
                value = part.value,
                _part$ignoreCase = part.ignoreCase,
                ignoreCase = _part$ignoreCase === void 0 ? true : _part$ignoreCase,
                data = part.data;

            if (type === 'attribute') {
              if (action === 'equals') {
                success = element.getAttribute(name) === value;
                if (debug) console.log('Attribute equals', success);
              } else if (action === 'start') {
                var _element$getAttribute;

                success = (_element$getAttribute = element.getAttribute(name)) === null || _element$getAttribute === void 0 ? void 0 : _element$getAttribute.startsWith(value);
                if (debug) console.log('Attribute start', success);
              } else if (action === 'end') {
                var _element$getAttribute2;

                success = (_element$getAttribute2 = element.getAttribute(name)) === null || _element$getAttribute2 === void 0 ? void 0 : _element$getAttribute2.endsWith(value);
                if (debug) console.log('Attribute start', success);
              } else if (action === 'element') {
                if (name === 'class') {
                  success = element.classList.contains(value);
                  if (debug) console.log('Attribute class', success);
                } else {
                  var _element$getAttribute3;

                  success = (_element$getAttribute3 = element.getAttribute(name)) === null || _element$getAttribute3 === void 0 ? void 0 : _element$getAttribute3.includes(value);
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
                var ok = true;
                data.forEach(function (rules) {
                  if (!handleRules(element, rules)) {
                    ok = false;
                  }
                });
                success = !ok;
              }

              if (debug) console.log('Is :not', success); // } else if (type === 'descendant') {
              //   element = element.
            } else {
              console.warn('Unknown CSS selector type', type, selector, rules);
            } // console.log(success, selector, part, element)


            if (!success) break;
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }

        return success;
      }

      if (handleRules(element, rules)) {
        return {
          v: true
        };
      }
    };

    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _ret = _loop();

      if (_typeof(_ret) === "object") return _ret.v;
    }
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }

  return false;
}

var inspect = Symbol.for('nodejs.util.inspect.custom');
var B = {
  'fontWeight': 'bold'
};
var I = {
  'fontStyle': 'italic'
};
var M = {
  'backgroundColor': 'rgb(255, 250, 165)'
};
var U = {
  'textDecorations': 'underline'
};
var S = {
  'textDecorations': 'line-through'
}; // let C = {}

var DEFAULTS = {
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
  'strike': S // 'code': C,
  // 'tt': C

};

function cloneObject(obj) {
  return JSON.parse(JSON.stringify(obj));
}

var VNode = /*#__PURE__*/function () {
  _createClass(VNode, [{
    key: "nodeType",
    get: function get() {
      console.error('Subclasses should define nodeType!');
      return 0;
    }
  }, {
    key: "nodeName",
    get: function get() {
      console.error('Subclasses should define nodeName!');
      return '';
    }
  }, {
    key: "nodeValue",
    get: function get() {
      return null;
    }
  }]);

  function VNode() {
    _classCallCheck(this, VNode);

    this._parentNode = null;
    this._childNodes = [];
  }

  _createClass(VNode, [{
    key: "_fixChildNodesParent",
    value: function _fixChildNodesParent() {
      var _this = this;

      this._childNodes.forEach(function (node) {
        return node._parentNode = _this;
      });
    }
  }, {
    key: "insertBefore",
    value: function insertBefore(newNode) {
      var node = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

      if (newNode !== node) {
        var index = node ? this._childNodes.indexOf(node) : 0;
        if (index < 0) index = 0;

        this._childNodes.splice(index, 0, newNode);

        this._fixChildNodesParent();
      }
    }
  }, {
    key: "appendChild",
    value: function appendChild(node) {
      if (node === this) {
        console.warn('Cannot appendChild to self');
        return;
      } // log('appendChild', node, this)


      if (node instanceof VDocument) {
        console.warn('No defined how to append a document to a node!', node);
      }

      if (node instanceof VDocumentFragment) {
        for (var _i = 0, _arr = _toConsumableArray(node._childNodes); _i < _arr.length; _i++) {
          var c = _arr[_i];
          // Don't iterate over the original! Do [...el]
          this.appendChild(c);
        }
      } else if (node instanceof VNode) {
        node.remove();

        this._childNodes.push(node);
      } else {
        // Fallback for unknown data
        try {
          this._childNodes.push(new VTextNode(JSON.stringify(node, null, 2)));
        } catch (err) {
          console.error("The data ".concat(node, " to be added to ").concat(this.render(), " is problematic: ").concat(err));
        }
      }

      this._fixChildNodesParent();
    }
  }, {
    key: "removeChild",
    value: function removeChild(node) {
      var i = this._childNodes.indexOf(node);

      if (i >= 0) {
        node._parentNode = null;

        this._childNodes.splice(i, 1);

        this._fixChildNodesParent();
      }
    }
  }, {
    key: "remove",
    value: function remove() {
      var _this$parentNode;

      this === null || this === void 0 ? void 0 : (_this$parentNode = this.parentNode) === null || _this$parentNode === void 0 ? void 0 : _this$parentNode.removeChild(this);
      return this;
    }
  }, {
    key: "replaceChildren",
    value: function replaceChildren() {
      for (var _len = arguments.length, nodes = new Array(_len), _key = 0; _key < _len; _key++) {
        nodes[_key] = arguments[_key];
      }

      this._childNodes = nodes.map(function (n) {
        return typeof n === 'string' ? new VTextNode(n) : n.remove();
      });

      this._fixChildNodesParent();
    }
  }, {
    key: "replaceWith",
    value: function replaceWith() {
      for (var _len2 = arguments.length, nodes = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        nodes[_key2] = arguments[_key2];
      }

      var p = this._parentNode;

      if (p) {
        var index = this._indexInParent();

        if (index >= 0) {
          var _p$_childNodes;

          nodes = nodes.map(function (n) {
            return typeof n === 'string' ? new VTextNode(n) : n.remove();
          });

          (_p$_childNodes = p._childNodes).splice.apply(_p$_childNodes, [index, 1].concat(_toConsumableArray(nodes)));

          this._parentNode = null;

          p._fixChildNodesParent();
        }
      }
    }
  }, {
    key: "_indexInParent",
    value: function _indexInParent() {
      if (this._parentNode) {
        return this._parentNode.childNodes.indexOf(this);
      }

      return -1;
    }
  }, {
    key: "flatten",
    value: function flatten() {
      var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
          _ref$condition = _ref.condition,
          condition = _ref$condition === void 0 ? function (node) {
        return node instanceof VElement;
      } : _ref$condition;

      var elements = [];

      if (condition(this)) {
        elements.push(this);
      }

      var _iterator = _createForOfIteratorHelper(this._childNodes),
          _step;

      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var child = _step.value;
          elements.push.apply(elements, _toConsumableArray(child.flatten({
            condition: condition
          })));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }

      return elements;
    }
  }, {
    key: "render",
    value: function render() {
      return '';
    }
  }, {
    key: "contains",
    value: function contains(otherNode) {
      if (otherNode === this) return true; // if (this._childNodes.includes(otherNode)) return true

      return this._childNodes.some(function (n) {
        return n.contains(otherNode);
      });
    }
  }, {
    key: "toString",
    // cloneNode(deep) {
    //   return _.cloneDeep(this)
    // }
    value: function toString() {
      return "".concat(this.nodeName); // return `${this.nodeName}: ${JSON.stringify(this.nodeValue)}`
    }
  }, {
    key: inspect,
    value: function value() {
      return "".concat(this.constructor.name, " \"").concat(this.render(), "\"");
    }
  }, {
    key: "parentNode",
    get: function get() {
      return this._parentNode;
    }
  }, {
    key: "childNodes",
    get: function get() {
      return this._childNodes || [];
    }
  }, {
    key: "firstChild",
    get: function get() {
      return this._childNodes[0];
    }
  }, {
    key: "lastChild",
    get: function get() {
      return this._childNodes[this._childNodes.length - 1];
    }
  }, {
    key: "nextSibling",
    get: function get() {
      var i = this._indexInParent();

      if (i != null) {
        return this.parentNode.childNodes[i + 1] || null;
      }

      return null;
    }
  }, {
    key: "previousSibling",
    get: function get() {
      var i = this._indexInParent();

      if (i > 0) {
        return this.parentNode.childNodes[i - 1] || null;
      }

      return null;
    }
  }, {
    key: "textContent",
    get: function get() {
      return this._childNodes.map(function (c) {
        return c.textContent;
      }).join('');
    },
    set: function set(text) {
      this._childNodes = [];

      if (text) {
        this.appendChild(new VTextNode(text.toString()));
      }
    }
  }, {
    key: "ownerDocument",
    get: function get() {
      var _this$_parentNode;

      if (this.nodeType === VNode.DOCUMENT_NODE || this.nodeType === VNode.DOCUMENT_FRAGMENT_NODE) {
        return this;
      }

      return this === null || this === void 0 ? void 0 : (_this$_parentNode = this._parentNode) === null || _this$_parentNode === void 0 ? void 0 : _this$_parentNode.ownerDocument;
    }
  }]);

  return VNode;
}();

_defineProperty(VNode, "ELEMENT_NODE", 1);

_defineProperty(VNode, "TEXT_NODE", 3);

_defineProperty(VNode, "CDATA_SECTION_NODE", 4);

_defineProperty(VNode, "PROCESSING_INSTRUCTION_NODE", 7);

_defineProperty(VNode, "COMMENT_NODE", 8);

_defineProperty(VNode, "DOCUMENT_NODE", 9);

_defineProperty(VNode, "DOCUMENT_TYPE_NODE", 10);

_defineProperty(VNode, "DOCUMENT_FRAGMENT_NODE", 11);

var VTextNode = /*#__PURE__*/function (_VNode) {
  _inherits(VTextNode, _VNode);

  var _super = _createSuper(VTextNode);

  _createClass(VTextNode, [{
    key: "nodeType",
    get: function get() {
      return VNode.TEXT_NODE;
    }
  }, {
    key: "nodeName",
    get: function get() {
      return '#text';
    }
  }, {
    key: "nodeValue",
    get: function get() {
      return this._text || '';
    }
  }, {
    key: "textContent",
    get: function get() {
      return this.nodeValue;
    }
  }]);

  function VTextNode() {
    var _this2;

    var text = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';

    _classCallCheck(this, VTextNode);

    _this2 = _super.call(this);
    _this2._text = text;
    return _this2;
  }

  _createClass(VTextNode, [{
    key: "render",
    value: function render() {
      return this._text;
    }
  }]);

  return VTextNode;
}(VNode);
var VNodeQuery = /*#__PURE__*/function (_VNode2) {
  _inherits(VNodeQuery, _VNode2);

  var _super2 = _createSuper(VNodeQuery);

  function VNodeQuery() {
    _classCallCheck(this, VNodeQuery);

    return _super2.apply(this, arguments);
  }

  _createClass(VNodeQuery, [{
    key: "getElementById",
    value: function getElementById(name) {
      return this.flatten().find(function (e) {
        return e._attributes['id'] === name;
      });
    }
  }, {
    key: "getElementsByClassName",
    value: function getElementsByClassName(name) {
      return this.flatten().filter(function (e) {
        return e.classList.contains(name);
      });
    }
  }, {
    key: "matches",
    value: function matches(selector) {
      return matchSelector(selector, this);
    }
  }, {
    key: "querySelectorAll",
    value: function querySelectorAll(selector) {
      return this.flatten().filter(function (e) {
        return e.matches(selector);
      });
    }
  }, {
    key: "querySelector",
    value: function querySelector(selector) {
      return this.flatten().find(function (e) {
        return e.matches(selector);
      });
    } //

  }, {
    key: "parent",
    value: function parent(selector) {
      var _this$parentNode2;

      if (this.matches(selector)) {
        return this;
      }

      if (this.parentNode == null) {
        return null;
      }

      return (_this$parentNode2 = this.parentNode) === null || _this$parentNode2 === void 0 ? void 0 : _this$parentNode2.parent(selector);
    }
  }, {
    key: "handle",
    value: function handle(selector, handler) {
      var i = 0;

      var _iterator2 = _createForOfIteratorHelper(this.querySelectorAll(selector)),
          _step2;

      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var el = _step2.value;
          handler(el, i++);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }]);

  return VNodeQuery;
}(VNode);
var VElement = /*#__PURE__*/function (_VNodeQuery) {
  _inherits(VElement, _VNodeQuery);

  var _super3 = _createSuper(VElement);

  _createClass(VElement, [{
    key: "nodeType",
    get: function get() {
      return VNode.ELEMENT_NODE;
    }
  }, {
    key: "nodeName",
    get: function get() {
      return this._nodeName;
    }
  }]);

  function VElement() {
    var _this3;

    var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'div';
    var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    _classCallCheck(this, VElement);

    _this3 = _super3.call(this);
    _this3._nodeName = (name || '').toUpperCase();
    _this3._attributes = attrs || {};
    _this3._styles = null;
    return _this3;
  }

  _createClass(VElement, [{
    key: "setAttribute",
    value: function setAttribute(name, value) {
      this._attributes[name] = value;
      this._styles = null;
    }
  }, {
    key: "getAttribute",
    value: function getAttribute(name) {
      return this._attributes[name];
    }
  }, {
    key: "removeAttribute",
    value: function removeAttribute(name) {
      delete this._attributes[name];
    }
  }, {
    key: "hasAttribute",
    value: function hasAttribute(name) {
      return this._attributes[name] != null;
    }
  }, {
    key: "getElementsByTagName",
    //
    value: function getElementsByTagName(name) {
      name = name.toUpperCase();
      var elements = this.flatten();

      if (name !== '*') {
        return elements.filter(function (e) {
          return e.tagName === name;
        });
      }

      return elements;
    } // html

  }, {
    key: "render",
    //
    value: function render() {
      var h = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : html;
      return h(this.tagName.toLowerCase(), this.attributes, this.childNodes.map(function (c) {
        return c.render(h);
      }));
    }
  }, {
    key: "attributes",
    get: function get() {
      return this._attributes;
    }
  }, {
    key: "style",
    get: function get() {
      if (this._styles == null) {
        var styles = cloneObject(DEFAULTS[this.tagName.toLowerCase()]) || {};
        var styleString = this.getAttribute('style');

        if (styleString) {
          var m;
          var re = /\s*([\w-]+)\s*:\s*([^;]+)/g;

          while (m = re.exec(styleString)) {
            var name = m[1];
            var value = m[2].trim();
            styles[name] = value;

            var camel = function camel(s) {
              return s.replace(/[A-Z]/g, '-$&').toLowerCase();
            };

            styles[camel] = value;
          }
        }

        this._styles = styles;
      }

      return this._styles;
    }
  }, {
    key: "tagName",
    get: function get() {
      return this._nodeName;
    }
  }, {
    key: "id",
    get: function get() {
      return this._attributes.id;
    },
    set: function set(value) {
      this._attributes.id = value;
    }
  }, {
    key: "src",
    get: function get() {
      return this._attributes.src;
    },
    set: function set(value) {
      this._attributes.src = value;
    }
  }, {
    key: "innerHTML",
    get: function get() {
      return this._childNodes.map(function (c) {
        return c.render(html);
      }).join('');
    },
    set: function set(html) {
      if (this.setInnerHTML) {
        this.setInnerHTML(html);
      } else {
        throw 'set innerHTML not implemented';
      }
    }
  }, {
    key: "outerHTML",
    get: function get() {
      return this.render(html);
    } // class

  }, {
    key: "className",
    get: function get() {
      return this._attributes['class'] || '';
    },
    set: function set(name) {
      if (Array.isArray(name)) {
        name = name.filter(function (n) {
          return !!n;
        }).join(' ');
      } else if (_typeof(name) === 'object') {
        name = Object.entries(name).filter(function (_ref2) {
          var _ref3 = _slicedToArray(_ref2, 2),
              k = _ref3[0],
              v = _ref3[1];

          return !!v;
        }).map(function (_ref4) {
          var _ref5 = _slicedToArray(_ref4, 2),
              k = _ref5[0],
              v = _ref5[1];

          return k;
        }).join(' ');
      }

      this._attributes['class'] = name;
    }
  }, {
    key: "classList",
    get: function get() {
      var self = this;
      var classNames = (this.className || '').trim().split(/\s+/g) || []; // log('classList', classNames)

      return {
        contains: function contains(s) {
          return classNames.includes(s);
        },
        add: function add(s) {
          if (!classNames.includes(s)) {
            classNames.push(s);
            self.className = classNames;
          }
        },
        remove: function remove(s) {
          var index = classNames.indexOf(s);

          if (index >= 0) {
            classNames.splice(index, 1);
            self.className = classNames;
          }
        }
      };
    }
  }]);

  return VElement;
}(VNodeQuery);
var VDocumentFragment = /*#__PURE__*/function (_VNodeQuery2) {
  _inherits(VDocumentFragment, _VNodeQuery2);

  var _super4 = _createSuper(VDocumentFragment);

  function VDocumentFragment() {
    _classCallCheck(this, VDocumentFragment);

    return _super4.apply(this, arguments);
  }

  _createClass(VDocumentFragment, [{
    key: "render",
    value: function render() {
      var h = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : html;
      return this._childNodes.map(function (c) {
        return c.render(h) || [];
      }).join('');
    }
  }, {
    key: "createElement",
    value: function createElement(name) {
      var attrs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      return new VElement(name, attrs);
    }
  }, {
    key: "createDocumentFragment",
    value: function createDocumentFragment() {
      return new VDocumentFragment();
    }
  }, {
    key: "createTextNode",
    value: function createTextNode(text) {
      return new VTextNode(text);
    }
  }, {
    key: "nodeType",
    get: function get() {
      return VNode.DOCUMENT_FRAGMENT_NODE;
    }
  }, {
    key: "nodeName",
    get: function get() {
      return '#document-fragment';
    }
  }, {
    key: "innerHTML",
    get: function get() {
      // for debug
      return this._childNodes.map(function (c) {
        return c.render(html);
      }).join('');
    }
  }]);

  return VDocumentFragment;
}(VNodeQuery);
var VDocument = /*#__PURE__*/function (_VDocumentFragment) {
  _inherits(VDocument, _VDocumentFragment);

  var _super5 = _createSuper(VDocument);

  function VDocument() {
    _classCallCheck(this, VDocument);

    return _super5.apply(this, arguments);
  }

  _createClass(VDocument, [{
    key: "nodeType",
    get: function get() {
      return VNode.DOCUMENT_NODE;
    }
  }, {
    key: "nodeName",
    get: function get() {
      return '#document';
    }
  }, {
    key: "documentElement",
    get: function get() {
      return this.firstChild;
    } // render(h = html) {
    //   let content =  super.render(h)
    //   if (h.firstLine) {
    //     content = h.firstLine + '\n' + content
    //   }
    //   return content
    // }

  }]);

  return VDocument;
}(VDocumentFragment);
var VHTMLDocument = /*#__PURE__*/function (_VDocument) {
  _inherits(VHTMLDocument, _VDocument);

  var _super6 = _createSuper(VHTMLDocument);

  function VHTMLDocument() {
    var _this4;

    _classCallCheck(this, VHTMLDocument);

    _this4 = _super6.call(this);
    var html = new VElement('html');
    var body = new VElement('body');
    var head = new VElement('head');
    var title = new VElement('title');
    html.appendChild(head);
    head.appendChild(title);
    html.appendChild(body);

    _this4.appendChild(html);

    return _this4;
  }

  _createClass(VHTMLDocument, [{
    key: "render",
    value: function render() {
      var h = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : html;

      var content = _get(_getPrototypeOf(VHTMLDocument.prototype), "render", this).call(this, h);

      if (h.firstLine) {
        content = h.firstLine + '\n' + content;
      }

      return content;
    }
  }, {
    key: "body",
    get: function get() {
      return this.querySelector('body');
    }
  }, {
    key: "title",
    get: function get() {
      var _this$querySelector;

      return (_this$querySelector = this.querySelector('title')) === null || _this$querySelector === void 0 ? void 0 : _this$querySelector.textContent;
    },
    set: function set(title) {
      this.querySelector('title').textContent = title;
    }
  }, {
    key: "head",
    get: function get() {
      return this.querySelector('head');
    }
  }]);

  return VHTMLDocument;
}(VDocument);
function createDocument() {
  return new VDocument();
}
function createHTMLDocument() {
  return new VHTMLDocument();
}
var document = createDocument();
var h = hFactory({
  document: document
});

// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

function vdom() {
  var obj = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

  if (obj instanceof VNode) {
    return obj;
  }

  if (obj instanceof Buffer) {
    obj = obj.toString('utf-8');
  }

  if (typeof obj === 'string') {
    return parseHTML(obj);
  } // console.warn('Cannot convert to VDOM:', obj)


  return new VElement('div');
}
function parseHTML(html) {
  var frag = new VDocumentFragment();
  var stack = [frag];
  var currentElement = frag;
  var parser = new htmlparser2.Parser({
    onopentag: function onopentag(name, attrs) {
      var element = document.createElement(name, attrs);
      stack.push(element);
      currentElement.appendChild(element);
      currentElement = element;
    },
    ontext: function ontext(text) {
      var _currentElement, _currentElement$lastC;

      if (((_currentElement = currentElement) === null || _currentElement === void 0 ? void 0 : (_currentElement$lastC = _currentElement.lastChild) === null || _currentElement$lastC === void 0 ? void 0 : _currentElement$lastC.nodeType) === VNode.TEXT_NODE) {
        currentElement.lastChild._text += text;
      } else {
        currentElement.appendChild(new VTextNode(text));
      }
    },
    onclosetag: function onclosetag(name) {
      var element = stack.pop();
      currentElement = stack[stack.length - 1]; // if (element.nodeName !== currentElement.nodeName) {
      //   console.log('error', element, currentElement)
      // }
    }
  }, {
    decodeEntities: true
  });
  parser.write(html);
  parser.end(); // console.log('frag', frag.innerHTML)

  return frag;
}

VElement.prototype.setInnerHTML = function (html) {
  var frag = parseHTML(html);
  this._childNodes = frag._childNodes;

  this._fixChildNodesParent();
};

function level(element) {
  var indent = '';

  while (element.parentNode) {
    indent += '  ';
    element = element.parentNode;
  }

  return indent.substr(2);
}

function tidyDOM(document, opt) {
  var selector = 'meta,link,script,p,h1,h2,h3,h4,h5,h6,blockquote,div,ul,ol,li,article,section,footer,head,body,title,nav,section,article,hr,form';
  document.handle(selector, function (e) {
    var _prev$nodeValue, _e$parentNode2, _next$nodeValue;

    // Ignore if inside PRE etc.
    var ee = e;

    while (ee) {
      if (['PRE', 'CODE', 'SCRIPT', 'STYLE', 'TT'].includes(ee.tagName)) return;
      ee = ee.parentNode;
    }

    var prev = e.previousSibling;

    if (!prev || prev.nodeType !== VNode.TEXT_NODE || !((_prev$nodeValue = prev.nodeValue) === null || _prev$nodeValue === void 0 ? void 0 : _prev$nodeValue.endsWith('\n'))) {
      var _e$parentNode;

      (_e$parentNode = e.parentNode) === null || _e$parentNode === void 0 ? void 0 : _e$parentNode.insertBefore(new VTextNode('\n'), e);
    }

    (_e$parentNode2 = e.parentNode) === null || _e$parentNode2 === void 0 ? void 0 : _e$parentNode2.insertBefore(new VTextNode(level(e)), e);
    var next = e.nextSibling;

    if (!next || next.nodeType !== VNode.TEXT_NODE || !((_next$nodeValue = next.nodeValue) === null || _next$nodeValue === void 0 ? void 0 : _next$nodeValue.startsWith('\n'))) {
      if (next) {
        var _e$parentNode3;

        (_e$parentNode3 = e.parentNode) === null || _e$parentNode3 === void 0 ? void 0 : _e$parentNode3.insertBefore(new VTextNode('\n'), next);
      } else {
        var _e$parentNode4;

        (_e$parentNode4 = e.parentNode) === null || _e$parentNode4 === void 0 ? void 0 : _e$parentNode4.appendChild(new VTextNode('\n'));
      }
    }

    if (e.childNodes.length) {
      var first = e.firstChild;

      if (first.nodeType === VNode.TEXT_NODE) {
        e.insertBefore(new VTextNode('\n' + level(e) + '  '));
      }

      e.appendChild(new VTextNode('\n' + level(e)));
    }
  });
}

function xml(itag, iattrs) {
  for (var _len = arguments.length, ichildren = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
    ichildren[_key - 2] = arguments[_key];
  }

  var _hArgumentParser = hArgumentParser(itag, iattrs, ichildren),
      tag = _hArgumentParser.tag,
      attrs = _hArgumentParser.attrs,
      children = _hArgumentParser.children;

  return markup(true, tag, attrs, children);
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
exports.h = h;
exports.html = html;
exports.parseHTML = parseHTML;
exports.tidyDOM = tidyDOM;
exports.unescapeHTML = unescapeHTML;
exports.vdom = vdom;
exports.xml = xml;
