const pkg = require('./package.json')

module.exports = {
  bundle: true,
  sitemap: true,
  minify: true,
  target: 'es2017',
  loader: {
    '.js': 'jsx',
  },
  jsxFactory: 'h',
  external: [
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
    ...Object.keys(pkg.peerDependencies ?? {}),
  ],
}
