#!/usr/bin/env node

const { build } = require('estrella')

const pkg = require('./package.json')

const common = {
  bundle: true,
  sitemap: true,
  minify: true,
  target: 'es2017',
  loader: {
    '.js': 'jsx',
  },
  jsxFactory: 'h',
  external: [
    'htmlparser2',
    'css-what',
  ],
}

build({
  ...common,
  entry: 'src/index.js',
  outfile: pkg.main, //  "dist/hostic-dom.cjs.js",
  format: 'cjs',
})

build({
  ...common,
  entry: 'src/index.js',
  outfile: pkg.module, // "dist/hostic-dom.esm.js",
  format: 'esm',
})

// const fs = require('fs')
// const esbuild = require('esbuild')
//
// const external = [
//   ...Object.keys(pkg.dependencies ?? {}),
//   ...Object.keys(pkg.devDependencies ?? {}),
//   ...Object.keys(pkg.peerDependencies ?? {}),
// ]
//
// module.exports = {
//
//   // https://jestjs.io/docs/en/troubleshooting#caching-issues
//   getCacheKey() {
//     return Math.random().toString()
//   },
//
//   process(content, filename) {
//     let file = `.hostic/${Math.random()}.js`
//
//     esbuild.buildSync({
//       ...common,
//       outfile: file,
//       entryPoints: [filename],
//       external,
//     })
//
//     let js = fs.readFileSync(file, 'utf-8')
//     fs.unlinkSync(file)
//
//     return js
//   },
// }
