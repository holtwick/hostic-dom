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
