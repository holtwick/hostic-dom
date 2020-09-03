import {parse} from "css-what";
let cache = {};
export function parseSelector(selector) {
  let ast = cache[selector];
  if (ast == null) {
    ast = parse(selector);
    cache[selector] = ast;
  }
  return ast;
}
export function matchSelector(selector, element, {debug = false} = {}) {
  for (let rules of parseSelector(selector)) {
    if (debug) {
      console.log("Selector:", selector);
      console.log("Rules:", rules);
      console.log("Element:", element);
    }
    function handleRules(element2, rules2) {
      var _a, _b, _c;
      let success = false;
      for (let part of rules2) {
        const {type, name, action, value, ignoreCase = true, data} = part;
        if (type === "attribute") {
          if (action === "equals") {
            success = element2.getAttribute(name) === value;
            if (debug)
              console.log("Attribute equals", success);
          } else if (action === "start") {
            success = (_a = element2.getAttribute(name)) == null ? void 0 : _a.startsWith(value);
            if (debug)
              console.log("Attribute start", success);
          } else if (action === "end") {
            success = (_b = element2.getAttribute(name)) == null ? void 0 : _b.endsWith(value);
            if (debug)
              console.log("Attribute start", success);
          } else if (action === "element") {
            if (name === "class") {
              success = element2.classList.contains(value);
              if (debug)
                console.log("Attribute class", success);
            } else {
              success = (_c = element2.getAttribute(name)) == null ? void 0 : _c.includes(value);
              if (debug)
                console.log("Attribute element", success);
            }
          } else if (action === "exists") {
            success = element2.hasAttribute(name);
            if (debug)
              console.log("Attribute exists", success);
          } else {
            console.warn("Unknown CSS selector action", action);
          }
        } else if (type === "tag") {
          success = element2.tagName === name.toUpperCase();
          if (debug)
            console.log("Is tag", success);
        } else if (type === "universal") {
          success = true;
          if (debug)
            console.log("Is universal", success);
        } else if (type === "pseudo") {
          if (name === "not") {
            let ok = true;
            data.forEach((rules3) => {
              if (!handleRules(element2, rules3)) {
                ok = false;
              }
            });
            success = !ok;
          }
          if (debug)
            console.log("Is :not", success);
        } else {
          console.warn("Unknown CSS selector type", type, selector, rules2);
        }
        if (!success)
          break;
      }
      return success;
    }
    if (handleRules(element, rules)) {
      return true;
    }
  }
  return false;
}
//# sourceMappingURL=vcss.js.map
