import {matchSelector} from "./vcss.js";
import {h} from "./vdom.js";
import {createHTMLDocument} from "./vdom.js";
let _keepH = h;
describe("CSS", () => {
  it("should parse", () => {
    let element = /* @__PURE__ */ h("div", {
      id: "foo",
      className: "foo bar",
      foo: "bar",
      "data-lang": "en"
    }, "...");
    expect(matchSelector("#foo", element)).toBe(true);
    expect(matchSelector(".foo", element)).toBe(true);
    expect(matchSelector("div", element)).toBe(true);
    expect(matchSelector("[id=foo]", element)).toBe(true);
    expect(matchSelector("[id]", element)).toBe(true);
    expect(matchSelector("div, p", element)).toBe(true);
    expect(matchSelector(":not(h1)", element)).toBe(true);
    expect(matchSelector("*[data-lang]", element)).toBe(true);
    expect(matchSelector("#foo, #bar", element)).toBe(true);
    expect(matchSelector("#bar, #foo", element)).toBe(true);
  });
  it("should parse and fail", () => {
    let element = /* @__PURE__ */ h("h1", null, "...");
    expect(matchSelector("#foo", element)).toBe(false);
    expect(matchSelector(".foo", element)).toBe(false);
    expect(matchSelector("div", element)).toBe(false);
    expect(matchSelector("[id=foo]", element)).toBe(false);
    expect(matchSelector("[id]", element)).toBe(false);
    expect(matchSelector("div, p", element)).toBe(false);
    expect(matchSelector(":not(h1)", element)).toBe(false);
    expect(matchSelector("*[data-lang]", element)).toBe(false);
    expect(matchSelector("#foo, #bar", element)).toBe(false);
    expect(matchSelector("#bar, #foo", element)).toBe(false);
  });
  it("should handle hierarchy", () => {
    let element = /* @__PURE__ */ h("a", null, /* @__PURE__ */ h("b", null, /* @__PURE__ */ h("c", null, /* @__PURE__ */ h("d", null, "xxx"))));
    expect(element.querySelector("a").tagName).toBe("A");
  });
  it("should complex attributes", () => {
    let element = /* @__PURE__ */ h("div", {
      title: "abcdefg"
    });
    expect(matchSelector("[title]", element)).toBe(true);
    expect(matchSelector("[title=abcdefg]", element)).toBe(true);
    expect(matchSelector("[title=xxx]", element)).toBe(false);
    expect(matchSelector('div[title="abcdefg"]', element)).toBe(true);
    expect(matchSelector('div[title="xxx"]', element)).toBe(false);
    expect(matchSelector('[title~="cd"]', element)).toBe(true);
    expect(matchSelector('[title~="xxx"]', element)).toBe(false);
    expect(matchSelector('[title^="ab"]', element)).toBe(true);
    expect(matchSelector('[title^="xxx"]', element)).toBe(false);
    expect(matchSelector('[title$="fg"]', element)).toBe(true);
    expect(matchSelector('[title$="xxx"]', element)).toBe(false);
  });
  it("should specific meta", () => {
    let element = /* @__PURE__ */ h("meta", {
      name: "viewport",
      content: "width=device-width, initial-scale=1, shrink-to-fit=no"
    });
    expect(matchSelector("meta[name=viewport]", element)).toBe(true);
    element = /* @__PURE__ */ h("meta", {
      name: "xviewport",
      content: "width=device-width, initial-scale=1, shrink-to-fit=no"
    });
    expect(matchSelector("meta[name=viewport]", element)).toBe(false);
  });
  it("should query meta", () => {
    let document = createHTMLDocument();
    document.head.replaceWith(/* @__PURE__ */ h("head", null, /* @__PURE__ */ h("meta", {
      charSet: "utf-8"
    }), /* @__PURE__ */ h("meta", {
      "http-equiv": "X-UA-Compatible",
      content: "IE=edge"
    }), /* @__PURE__ */ h("meta", {
      name: "viewport",
      content: "width=device-width, initial-scale=1, shrink-to-fit=no"
    }), /* @__PURE__ */ h("title", null, "PDFify - Help"), /* @__PURE__ */ h("link", {
      rel: "canonical",
      href: "https://pdfify.app/en/help"
    }), /* @__PURE__ */ h("meta", {
      property: "og:url",
      content: "https://pdfify.app/en/help"
    }), /* @__PURE__ */ h("link", {
      rel: "alternate",
      hrefLang: "en",
      href: "https://pdfify.app/en/help"
    }), /* @__PURE__ */ h("link", {
      rel: "alternate",
      hrefLang: "de",
      href: "https://pdfify.app/de/help"
    }), /* @__PURE__ */ h("link", {
      rel: "alternate",
      hrefLang: "x-default",
      href: "https://pdfify.app/help"
    }), /* @__PURE__ */ h("meta", {
      property: "og:title",
      content: "Help"
    }), /* @__PURE__ */ h("meta", {
      name: "description",
      property: "og:description",
      content: "Online help of PDFify help"
    }), /* @__PURE__ */ h("meta", {
      name: "keywords",
      property: "og:keywords",
      content: "help, doc, documentation, collect, app, macos, ios"
    }), /* @__PURE__ */ h("meta", {
      name: "twitter:site",
      content: "@holtwick"
    }), /* @__PURE__ */ h("meta", {
      name: "twitter:creator",
      content: "@holtwick"
    }), /* @__PURE__ */ h("meta", {
      name: "twitter:card",
      content: "summary"
    }), /* @__PURE__ */ h("meta", {
      name: "generator",
      content: "Hostic, https://github.com/holtwick/hostic/"
    }), /* @__PURE__ */ h("meta", {
      property: "og:type",
      content: "text/html"
    }), /* @__PURE__ */ h("meta", {
      charSet: "utf-8"
    }), /* @__PURE__ */ h("meta", {
      "http-equiv": "X-UA-Compatible",
      content: "IE=edge"
    }), /* @__PURE__ */ h("meta", {
      name: "viewport",
      content: "width=device-width, initial-scale=1, shrink-to-fit=no"
    }), /* @__PURE__ */ h("link", {
      media: "all",
      rel: "stylesheet",
      href: "/assets/bootstrap.min-cd5525bc.css"
    }), /* @__PURE__ */ h("link", {
      media: "all",
      rel: "stylesheet",
      href: "/assets/custom-06a1f2ce.css"
    }), /* @__PURE__ */ h("link", {
      rel: "shortcut icon",
      href: "/assets/favicon-1268689e.png",
      type: "image/png"
    }), /* @__PURE__ */ h("link", {
      rel: "icon",
      type: "image/png",
      href: "/assets/favicon-32-3192cb36.png",
      sizes: "32x32"
    }), /* @__PURE__ */ h("link", {
      rel: "icon",
      type: "image/png",
      href: "/assets/favicon-96-b036137d.png",
      sizes: "96x96"
    }), /* @__PURE__ */ h("link", {
      rel: "apple-touch-icon",
      href: "/assets/apple-touch-icon-2ac9c5f9.png"
    }), /* @__PURE__ */ h("link", {
      rel: "apple-touch-icon",
      sizes: "144x144",
      href: "/assets/apple-touch-icon-2ac9c5f9.png"
    }), /* @__PURE__ */ h("meta", {
      property: "og:video",
      content: "https://youtu.be/k4pOgDWYm2U"
    }), /* @__PURE__ */ h("meta", {
      property: "og:video",
      content: "https://youtu.be/TJTsAQguaVE"
    })));
    expect(!document.querySelector("meta[charset]")).toBe(false);
  });
});
//# sourceMappingURL=vcss.spec.js.map
