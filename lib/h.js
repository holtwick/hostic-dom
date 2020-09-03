const log = require("debug")("hostic:h");
function _h(context, tag, attrs, children) {
  if (typeof tag === "function") {
    return tag.call(null, {
      props: {...attrs, children},
      attrs,
      children,
      h: context.h,
      context
    });
  } else {
    let el;
    if (tag) {
      if (tag.toLowerCase() === "fragment") {
        el = context.document.createDocumentFragment();
      } else {
        el = context.document.createElement(tag);
      }
    } else {
      el = context.document.createElement("div");
    }
    if (attrs) {
      for (let [key, value] of Object.entries(attrs)) {
        if (key && typeof key === "string") {
          key = key.toLowerCase();
        }
        if (key === "classname") {
          el.className = value;
        } else if (key === "on") {
          Object.entries(value).forEach(([name, value2]) => {
            el.setAttribute("on" + name, value2);
          });
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
              if (typeof child !== "object") {
                el.appendChild(context.document.createTextNode(child.toString()));
              } else {
                el.appendChild(child);
              }
            }
          }
        }
      }
    }
    return el;
  }
}
export function hArgumentParser(tag, attrs, ...children) {
  if (typeof tag === "object") {
    tag = "fragment";
    children = tag.children;
    attrs = tag.attrs;
  }
  if (Array.isArray(attrs)) {
    children = attrs;
    attrs = {};
  } else if (attrs) {
    if (attrs.attrs) {
      attrs = {...attrs.attrs, ...attrs};
      delete attrs.attrs;
    }
  } else {
    attrs = {};
  }
  return {
    tag,
    attrs,
    children: children.flat(Infinity)
  };
}
export function hFactory(context) {
  context.h = function h(itag, iattrs, ...ichildren) {
    let {tag, attrs, children} = hArgumentParser(itag, iattrs, ichildren);
    return _h(context, tag, attrs, children);
  };
  return context.h;
}
//# sourceMappingURL=h.js.map
