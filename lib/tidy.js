import {VNode} from "./vdom.js";
import {VTextNode} from "./vdom.js";
function level(element) {
  let indent = "";
  while (element.parentNode) {
    indent += "  ";
    element = element.parentNode;
  }
  return indent.substr(2);
}
export function tidyDOM(document, opt) {
  let selector = "meta,link,script,p,h1,h2,h3,h4,h5,h6,blockquote,div,ul,ol,li,article,section,footer,head,body,title,nav,section,article,hr,form";
  document.handle(selector, (e) => {
    var _a, _b, _c, _d, _e, _f;
    let ee = e;
    while (ee) {
      if (["PRE", "CODE", "SCRIPT", "STYLE", "TT"].includes(ee.tagName))
        return;
      ee = ee.parentNode;
    }
    let prev = e.previousSibling;
    if (!prev || prev.nodeType !== VNode.TEXT_NODE || !((_a = prev.nodeValue) == null ? void 0 : _a.endsWith("\n"))) {
      (_b = e.parentNode) == null ? void 0 : _b.insertBefore(new VTextNode("\n"), e);
    }
    (_c = e.parentNode) == null ? void 0 : _c.insertBefore(new VTextNode(level(e)), e);
    let next = e.nextSibling;
    if (!next || next.nodeType !== VNode.TEXT_NODE || !((_d = next.nodeValue) == null ? void 0 : _d.startsWith("\n"))) {
      if (next) {
        (_e = e.parentNode) == null ? void 0 : _e.insertBefore(new VTextNode("\n"), next);
      } else {
        (_f = e.parentNode) == null ? void 0 : _f.appendChild(new VTextNode("\n"));
      }
    }
    if (e.childNodes.length) {
      let first = e.firstChild;
      if (first.nodeType === VNode.TEXT_NODE) {
        e.insertBefore(new VTextNode("\n" + level(e) + "  "));
      }
      e.appendChild(new VTextNode("\n" + level(e)));
    }
  });
}
//# sourceMappingURL=tidy.js.map
