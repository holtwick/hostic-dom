"use strict";
// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright
var __assign = (this && this.__assign) || function () {
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
exports.__esModule = true;
// import Sizzle from './sizzle'
var vdom_1 = require("./vdom");
var xml_js_1 = require("./xml.js");
var vdomparser_js_1 = require("./vdomparser.js");
var vdom_js_1 = require("./vdom.js");
describe('VDOM', function () {
    it('should mimic DOM', function () {
        var document = new vdom_1.VDocument();
        document.appendChild(document.createElement('p'));
        document.appendChild(document.createElement('p'));
        var html = document.render();
        expect(html).toBe('<p></p><p></p>');
    });
    it('should mimic DOM', function () {
        var document = new vdom_1.VDocument();
        var frag = new vdom_1.VDocumentFragment();
        var p = document.createElement('p');
        p.setAttribute('class', 'foo');
        p.textContent = 'Some';
        frag.appendChild(p);
        var html = frag.render();
        expect(html).toBe('<p class="foo">Some</p>');
    });
    it('should have functional factory', function () {
        var doc = vdom_js_1.createHTMLDocument();
        doc.body.replaceChildren(vdom_1.h('p', { "class": 'lorem' }, 'Hello ', vdom_1.h('b', { id: 'foo' }, 'World')), vdom_1.h('hr'));
        var r = doc.body;
        expect(r.render()).toBe('<body><p class="lorem">Hello <b id="foo">World</b></p><hr></body>');
        var elements = r.flatten().map(function (e) { return e.tagName; });
        expect(elements).toEqual(['BODY', 'P', 'B', 'HR']);
        expect(r.ownerDocument).toBe(doc);
        expect(r.getElementsByTagName('b')[0].outerHTML).toEqual('<b id="foo">World</b>');
        expect(r.getElementById('foo').outerHTML).toEqual('<b id="foo">World</b>');
        expect(r.getElementsByClassName('lorem')[0].outerHTML).toEqual('<p class="lorem">Hello <b id="foo">World</b></p>');
        expect(r.matches('body')).toBe(true);
        expect(r.matches('b')).toBe(false);
        expect(r.querySelector('b').outerHTML).toEqual('<b id="foo">World</b>');
        expect(r.querySelector('#foo').outerHTML).toEqual('<b id="foo">World</b>');
        expect(r.querySelector('.lorem').outerHTML).toEqual('<p class="lorem">Hello <b id="foo">World</b></p>');
        r.querySelector('#foo').replaceWith('Surprise');
        expect(r.render()).toBe('<body><p class="lorem">Hello Surprise</p><hr></body>');
        expect(doc.body.tagName).toBe('BODY');
        expect(doc.head.tagName).toBe('HEAD');
        expect(doc.documentElement.tagName).toBe('HTML');
        expect(doc.title).toBe('');
    });
    it('should use JSX', function () {
        var spread = {
            title: 'Hello',
            id: 'greeting'
        };
        var s = vdom_1.h("a", __assign({ href: "example.com", x: "x", hidden: false, onClick: "return false" }, spread),
            vdom_1.h("hr", null),
            null && 'This is invisible',
            vdom_1.h("b", null, "Welcome"));
        expect(s.render()).toEqual('<a href="example.com" x="x" onclick="return false" title="Hello" id="greeting"><hr><b>Welcome</b></a>');
        expect(s.render(xml_js_1.xml)).toEqual('<a href="example.com" x="x" onclick="return false" title="Hello" id="greeting"><hr /><b>Welcome</b></a>');
    });
    it('should nested JSX', function () {
        var content = vdom_1.h("div", null, "Hello");
        var title = 'World';
        var doc = vdom_1.h("body", null,
            vdom_1.h("h1", null, title),
            content);
        expect(doc.render()).toBe('<body><h1>World</h1><div>Hello</div></body>');
    });
    it('should JSX components', function () {
        function Welcome(_a) {
            var props = _a.props, h = _a.h;
            return h("h1", null,
                "Hello, ",
                props.name);
        }
        // @ts-ignore
        var x = vdom_1.h(Welcome, { name: "Sara" });
        expect(x.render()).toEqual('<h1>Hello, Sara</h1>');
    });
    it('should JSX class magic', function () {
        var x = vdom_1.h("div", { className: {
                '-active': true,
                'foo': 'bar',
                'bar': '',
                'hidden': null,
                'name': 1
            } }, "...");
        expect(x.render()).toEqual('<div class="-active foo name">...</div>');
    });
    it('should support fragments', function () {
        var ff = vdom_1.h("fragment", null,
            vdom_1.h("div", null, "One"),
            "Middle",
            vdom_1.h("div", null, "Two"));
        expect(ff).toBeInstanceOf(vdom_1.VDocumentFragment);
        expect(ff.render()).toEqual('<div>One</div>Middle<div>Two</div>');
    });
    it('should remove', function () {
        var el = vdom_1.h("div", null,
            vdom_1.h("div", { id: "a" }),
            vdom_1.h("div", { id: "b" },
                "Before",
                vdom_1.h("link", { rel: "stylesheet", href: "" }),
                vdom_1.h("span", null, "After")));
        expect(el.render()).toEqual('<div><div id="a"></div><div id="b">Before<link rel="stylesheet" href=""><span>After</span></div></div>');
        var a = el.querySelector('#a');
        el.handle('link', function (e) { return a.appendChild(e); });
        expect(el.render()).toEqual('<div><div id="a"><link rel="stylesheet" href=""></div><div id="b">Before<span>After</span></div></div>');
    });
    it('should handle dataSet stuff', function () {
        var el = vdom_1.h("div", { "data-lang": "en" }, "Test");
        expect(el.attributes).toEqual({ 'data-lang': 'en' });
        expect(el.render()).toEqual('<div data-lang="en">Test</div>');
        expect(el.querySelector('[data-lang]').textContent).toEqual('Test');
        var frag = vdomparser_js_1.parseHTML(el.render());
        expect(frag.firstChild.attributes).toEqual({ 'data-lang': 'en' });
        expect(frag.render()).toEqual('<div data-lang="en">Test</div>');
    });
    it('should insert', function () {
        var el = vdom_1.h("div", null,
            vdom_1.h("p", null, "Hallo"));
        var w = vdom_1.h("h1", null, "Welcome");
        el.insertBefore(w);
        expect(el.render()).toEqual('<div><h1>Welcome</h1><p>Hallo</p></div>');
        el.insertBefore(w, w); // fail
        el.insertBefore(vdom_1.h("div", null, "Subtitle"), el.querySelector('p'));
        expect(el.render()).toEqual('<div><h1>Welcome</h1><div>Subtitle</div><p>Hallo</p></div>');
    });
});
