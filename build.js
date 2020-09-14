#!/usr/bin/env node

const pkg = require('./package.json')
const common = require('./build.config.js')

const { build } = require('estrella')

common.sitemap = true

build({
  ...common,
  entry: 'src/index.js',
  outfile: pkg.main,
  format: 'cjs',
})

build({
  ...common,
  entry: 'src/index.js',
  outfile: pkg.module,
  target: 'esnext',
  format: 'esm',
})

// Browser, Unpkg

build({
  ...common,
  entry: 'src/index.js',
  outfile: pkg.unpkg,
  globalName: 'hosticDOM',
  format: 'iife',
})
