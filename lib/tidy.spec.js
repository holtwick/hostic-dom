import {h} from "./vdom.js";
import {createHTMLDocument} from "./vdom.js";
import {tidyDOM} from "./tidy.js";
let _keepH = h;
describe("Tidy", () => {
  it("should look nicer", () => {
    let document = createHTMLDocument();
    document.head.appendChild(/* @__PURE__ */ h("fragment", null, /* @__PURE__ */ h("link", {
      rel: "alternate",
      hrefLang: "de",
      href: "https://holtwick.de/de/"
    }), /* @__PURE__ */ h("meta", {
      name: "twitter:site",
      content: "@holtwick"
    })));
    document.body.appendChild(/* @__PURE__ */ h("fragment", null, /* @__PURE__ */ h("h1", null, "Hello"), /* @__PURE__ */ h("p", null, "This is a ", /* @__PURE__ */ h("b", null, "sample"), ". And a link ", /* @__PURE__ */ h("a", {
      href: "example"
    }, "example"), "."), /* @__PURE__ */ h("p", null, "Some lines ", /* @__PURE__ */ h("br", null), " line ", /* @__PURE__ */ h("br", null), " line "), /* @__PURE__ */ h("ol", null, /* @__PURE__ */ h("li", null, "One"), /* @__PURE__ */ h("li", null, "Two")), /* @__PURE__ */ h("pre", null, /* @__PURE__ */ h("p", null, "Do nothing"))));
    expect(document.render()).toEqual('<!DOCTYPE html>\n<html><head><title></title><link rel="alternate" hreflang="de" href="https://holtwick.de/de/"><meta name="twitter:site" content="@holtwick"></head><body><h1>Hello</h1><p>This is a <b>sample</b>. And a link <a href="example">example</a>.</p><p>Some lines <br> line <br> line </p><ol><li>One</li><li>Two</li></ol><pre><p>Do nothing</p></pre></body></html>');
    tidyDOM(document);
    expect(document.render()).toEqual(`<!DOCTYPE html>
<html>
  <head>
    <title></title>
    <link rel="alternate" hreflang="de" href="https://holtwick.de/de/">
    <meta name="twitter:site" content="@holtwick">
  </head>
  <body>
    <h1>
      Hello
    </h1>
    <p>
      This is a <b>sample</b>. And a link <a href="example">example</a>.
    </p>
    <p>
      Some lines <br> line <br> line 
    </p>
    <ol>
      <li>
        One
      </li>
      <li>
        Two
      </li>
    </ol>
<pre><p>Do nothing</p></pre>
  </body>
</html>`);
  });
});
//# sourceMappingURL=tidy.spec.js.map
