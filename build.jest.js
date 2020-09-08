const fs = require('fs')
const esbuild = require('esbuild')
const pkg = require('./package.json')
const common = require('./build.config.js')

const external = [
  ...Object.keys(pkg.dependencies ?? {}),
  ...Object.keys(pkg.devDependencies ?? {}),
  ...Object.keys(pkg.peerDependencies ?? {}),
]

module.exports = {

  // https://jestjs.io/docs/en/troubleshooting#caching-issues
  getCacheKey() {
    return Math.random().toString()
  },

  process(content, filename) {
    let result = esbuild.buildSync({
      ...common,
      write: false,
      entryPoints: [filename],
      external,
    })

    let contents = result.outputFiles[0].contents
    return new TextDecoder('utf-8').decode(contents)
  },
}
