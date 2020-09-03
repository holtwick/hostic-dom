import {h} from "./xml";
describe("HTML", () => {
  it("should xml", () => {
    let s = h("a", {
      href: "example.com",
      empty: null,
      x: true,
      false: false
    }, h("hr"), h("b", {}, "Welcome"));
    expect(s).toEqual('<a href="example.com" x="x"><hr /><b>Welcome</b></a>');
  });
  it("should use JSX", () => {
    let spread = {
      title: "Hello",
      id: "greeting"
    };
    let s = /* @__PURE__ */ h("a", {
      href: "example.com",
      x: true,
      ...spread
    }, /* @__PURE__ */ h("hr", null), /* @__PURE__ */ h("b", null, "Welcome"));
    expect(s).toEqual('<a href="example.com" x="x" title="Hello" id="greeting"><hr /><b>Welcome</b></a>');
  });
});
//# sourceMappingURL=xml.spec.js.map
