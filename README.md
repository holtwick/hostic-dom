# hostic-dom

- Lightweight virtual DOM in pure Javascript
- Generates HTML and XML
- Parses HTML
- Supports CSS selectors and queries
- Can be used with JSX

**Does not aim for completeness!**

This is a side project of [hostic](https://github.com/holtwick/hostic), the static website generator. 

## Example



## JSX

Usually JSX is optimized for React i.e. it expect `React.creatElement` to exist and be the factory for generating the nodes. You can of course get the same effect here if you set up a helper like this:

```js
import { html } from 'hostic-dom'

var React = {
    createElement: html
}
```

But more common is the use of `h` as the factory function. Here is how you can set up this behavior for various environments:

### Babel.js

Add required plugins:

```shell script
npm i -D @babel/plugin-syntax-jsx @babel/plugin-transform-react-jsx
```

Then add this to `.babelrc`:

```json
{
  "plugins": [
    "@babel/plugin-syntax-jsx",
    [
      "@babel/plugin-transform-react-jsx",
      {
        "pragma": "h"
      }
    ]
  ]
}
```

### TypeScript

In [`tsconfig.json`](https://www.typescriptlang.org/docs/handbook/compiler-options-in-msbuild.html#mappings):

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "h"
  }
}
```

### ESBuild

In options:

```js
{
 jsxFactory: 'h'
}
```

Or alternatively as [command line option](https://github.com/evanw/esbuild#command-line-usage): `--jsx-factory=h`

## Tidy

An example for post processing is the `tidy` function that comes with the module. It adds line feeds and spaces to get a pretty printed output of HTML. You can apply ot like this:

```
import { h } from 'hostic'


```
