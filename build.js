#!/usr/bin/env node

const pkg = require("./package.json")
const common = require("./build.config.js")

const { build } = require("estrella")

common.sourcemap = true

build({
  ...common,
  entry: "src/index.js",
  outfile: pkg.main,
  format: "cjs",
})

build({
  ...common,
  entry: "src/index.js",
  outfile: pkg.module,
  format: "esm",
})

// Browser, Unpkg

build({
  ...common,
  entry: "src/index.js",
  outfile: pkg.unpkg,
  globalName: "hosticDOM",
  format: "iife",
})
