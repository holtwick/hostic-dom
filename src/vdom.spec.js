// Copyright (c) 2020 Dirk Holtwick. All rights reserved. https://holtwick.de/copyright

// import Sizzle from './sizzle'
import { VDocument, VDocumentFragment, h } from './vdom'
import { xml } from './xml.js'
import { parseHTML } from './vdomparser.js'
import { createHTMLDocument } from './vdom.js'

describe('VDOM', () => {

  it('should mimic DOM', () => {
    let document = new VDocument()
    document.appendChild(document.createElement('p'))
    document.appendChild(document.createElement('p'))
    let html = document.render()
    expect(html).toBe('<p></p><p></p>')
  })

  it('should mimic DOM', () => {
    let document = new VDocument()
    let frag = new VDocumentFragment()
    let p = document.createElement('p')
    p.setAttribute('class', 'foo')
    p.textContent = 'Some'
    frag.appendChild(p)
    let html = frag.render()
    expect(html).toBe('<p class="foo">Some</p>')
  })

  it('should have functional factory', () => {
    let doc = createHTMLDocument()

    doc.body.replaceChildren(
      h('p', { class: 'lorem' }, 'Hello ',
        h('b', { id: 'foo' }, 'World'),
      ),
      h('hr'),
    )

    let r = doc.body

    expect(r.render()).toBe('<body><p class="lorem">Hello <b id="foo">World</b></p><hr></body>')

    let elements = r.flatten().map(e => e.tagName)
    expect(elements).toEqual(['BODY', 'P', 'B', 'HR'])

    expect(r.ownerDocument).toBe(doc)

    expect(r.getElementsByTagName('b')[0].outerHTML).toEqual('<b id="foo">World</b>')
    expect(r.getElementById('foo').outerHTML).toEqual('<b id="foo">World</b>')
    expect(r.getElementsByClassName('lorem')[0].outerHTML).toEqual('<p class="lorem">Hello <b id="foo">World</b></p>')

    expect(r.matches('body')).toBe(true)
    expect(r.matches('b')).toBe(false)

    expect(r.querySelector('b').outerHTML).toEqual('<b id="foo">World</b>')
    expect(r.querySelector('#foo').outerHTML).toEqual('<b id="foo">World</b>')
    expect(r.querySelector('.lorem').outerHTML).toEqual('<p class="lorem">Hello <b id="foo">World</b></p>')

    r.querySelector('#foo').replaceWith('Surprise')
    expect(r.render()).toBe('<body><p class="lorem">Hello Surprise</p><hr></body>')

    expect(doc.body.tagName).toBe('BODY')
    expect(doc.head.tagName).toBe('HEAD')
    expect(doc.documentElement.tagName).toBe('HTML')
    expect(doc.title).toBe('')
  })

  it('should use JSX', () => {
    let spread = {
      title: 'Hello',
      id: 'greeting',
    }
    let s = <a href="example.com" x="x" hidden={false} onClick="return false" {...spread}>
      <hr/>
      {null && 'This is invisible'}
      <b>Welcome</b></a>
    expect(s.render()).toEqual('<a href="example.com" x="x" onclick="return false" title="Hello" id="greeting"><hr><b>Welcome</b></a>')
    expect(s.render(xml)).toEqual('<a href="example.com" x="x" onclick="return false" title="Hello" id="greeting"><hr /><b>Welcome</b></a>')
  })

  it('should nested JSX', () => {
    let content = <div>Hello</div>
    let title = 'World'

    let doc = <body>
    <h1>{title}</h1>
    {content}
    </body>

    expect(doc.render()).toBe('<body><h1>World</h1><div>Hello</div></body>')
  })

  it('should JSX components', () => {
    function Welcome({ props, h }) {
      return <h1>Hello, {props.name}</h1>
    }

    let x = <Welcome name="Sara"/>
    expect(x.render()).toEqual('<h1>Hello, Sara</h1>')
  })

  it('should JSX class magic', () => {
    let x = <div className={{
      '-active': true,
      'foo': 'bar',
      'bar': '',
      'hidden': null,
      'name': 1,
    }}>...</div>
    expect(x.render()).toEqual('<div class="-active foo name">...</div>')
  })

  it('should support fragments', () => {
    let ff = <fragment>
      <div>One</div>
      Middle
      <div>Two</div>
    </fragment>
    expect(ff).toBeInstanceOf(VDocumentFragment)
    expect(ff.render()).toEqual('<div>One</div>Middle<div>Two</div>')
  })

  it('should remove', () => {
    let el = <div>
      <div id="a">
      </div>
      <div id="b">
        Before
        <link rel="stylesheet" href=""/>
        <span>After</span>
      </div>
    </div>

    expect(el.render()).toEqual('<div><div id="a"></div><div id="b">Before<link rel="stylesheet" href=""><span>After</span></div></div>')

    let a = el.querySelector('#a')
    el.handle('link', e => a.appendChild(e))

    expect(el.render()).toEqual('<div><div id="a"><link rel="stylesheet" href=""></div><div id="b">Before<span>After</span></div></div>')
  })

  it('should handle dataSet stuff', () => {
    let el = <div data-lang="en">
      Test
    </div>

    expect(el.attributes).toEqual({ 'data-lang': 'en' })
    expect(el.render()).toEqual('<div data-lang="en">Test</div>')

    expect(el.querySelector('[data-lang]').textContent).toEqual('Test')

    let frag = parseHTML(el.render())
    expect(frag.firstChild.attributes).toEqual({ 'data-lang': 'en' })
    expect(frag.render()).toEqual('<div data-lang="en">Test</div>')
  })

  it('should insert', () => {
    let el = <div>
      <p>Hallo</p>
    </div>

    let w = <h1>Welcome</h1>
    el.insertBefore(w)

    expect(el.render()).toEqual('<div><h1>Welcome</h1><p>Hallo</p></div>')

    el.insertBefore(w, w) // fail

    el.insertBefore(<div>Subtitle</div>, el.querySelector('p'))

    expect(el.render()).toEqual('<div><h1>Welcome</h1><div>Subtitle</div><p>Hallo</p></div>')
  })


})
