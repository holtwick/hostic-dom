import {hArgumentParser} from "./h.js";
import {escapeHTML} from "./encoding";
let USED_JSX = [];
export function CDATA(s) {
  s = "<![CDATA[" + s + "]]>";
  USED_JSX.push(s);
  return s;
}
export function HTML(s) {
  USED_JSX.push(s);
  return s;
}
export function markup(xmlMode, tag, attrs, children) {
  const hasChildren = children && children.length > 0;
  let s = "";
  tag = tag.replace(/__/g, ":");
  if (tag !== "noop") {
    if (tag !== "cdata") {
      s += `<${tag}`;
    } else {
      s += "<![CDATA[";
    }
    for (let name in attrs) {
      if (name && attrs.hasOwnProperty(name)) {
        let v = attrs[name];
        if (name === "html") {
          continue;
        }
        if (name.toLowerCase() === "classname") {
          name = "class";
        }
        name = name.replace(/__/g, ":");
        if (v === true) {
          s += ` ${name}="${name}"`;
        } else if (name === "style" && typeof v === "object") {
          s += ` ${name}="${Object.keys(v).filter((k) => v[k] != null).map((k) => {
            let vv = v[k];
            vv = typeof vv === "number" ? vv + "px" : vv;
            return `${k.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase()}:${vv}`;
          }).join(";")}"`;
        } else if (v !== false && v != null) {
          s += ` ${name}="${escapeHTML(v.toString())}"`;
        }
      }
    }
    if (tag !== "cdata") {
      if (xmlMode && !hasChildren) {
        s += " />";
        USED_JSX.push(s);
        return s;
      } else {
        s += `>`;
      }
    }
    if (!xmlMode) {
      if (["area", "base", "br", "col", "embed", "hr", "img", "input", "keygen", "link", "meta", "param", "source", "track", "wbr"].indexOf(tag) !== -1) {
        USED_JSX.push(s);
        return s;
      }
    }
  }
  if (hasChildren) {
    for (let child of children) {
      if (child != null && child !== false) {
        if (!Array.isArray(child)) {
          child = [child];
        }
        for (let c of child) {
          if (USED_JSX.indexOf(c) !== -1 || tag === "script" || tag === "style") {
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
  if (tag !== "noop") {
    if (tag !== "cdata") {
      s += `</${tag}>`;
    } else {
      s += "]]>";
    }
  }
  USED_JSX.push(s);
  return s;
}
export function html(itag, iattrs, ...ichildren) {
  let {tag, attrs, children} = hArgumentParser(itag, iattrs, ichildren);
  return markup(false, tag, attrs, children);
}
html.firstLine = "<!DOCTYPE html>";
html.html = true;
export let h = html;
//# sourceMappingURL=html.js.map
