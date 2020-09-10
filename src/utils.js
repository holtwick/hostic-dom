import { vdom } from './vdomparser.js'

export function removeBodyContainer(body) {
  let ehead = body.querySelector('head')
  let ebody = body.querySelector('body')
  if (ebody || ehead) {
    body = vdom()
    ehead && body.appendChild(ehead.childNodes)
    ebody && body.appendChild(ebody.children)
  }
  return body
}
