const esbuild = require("esbuild")
const common = require("./build.config.js")

module.exports = {
  // https://jestjs.io/docs/en/troubleshooting#caching-issues
  getCacheKey() {
    return Math.random().toString()
  },

  process(content, filename) {
    let result = esbuild.buildSync({
      ...common,
      sourcemap: "inline",
      write: false,
      entryPoints: [filename],
    })

    return new TextDecoder("utf-8").decode(result.outputFiles[0].contents)
  },
}
