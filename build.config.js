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
    'htmlparser2',
    'css-what',
  ],
}
