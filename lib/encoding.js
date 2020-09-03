const rxEscape = /[\-\[\]\/{}()*+?.^$|]/g;
export function escapeRegExp(value) {
  if (!value)
    return "";
  if (value instanceof RegExp) {
    return value.source;
  }
  return value.replace(rxEscape, "\\$&");
}
export {
  escape as escapeHTML,
  unescape as unescapeHTML
} from "he";
//# sourceMappingURL=encoding.js.map
