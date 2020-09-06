// @ts-nocheck
import babel from 'rollup-plugin-babel'
import pkg from './package.json'

export default [

  // package.json
  //  "browser": "dist/hostic-dom.umd.js",

  // browser-friendly UMD build
  // {
  //   input: 'src/index.js',
  //   output: {
  //     name: pkg.name,
  //     file: pkg.browser,
  //     format: 'umd',
  //   },
  //   plugins: [
  //     resolve(),   // so Rollup can find `ms`
  //     commonjs(),  // so Rollup can convert `ms` to an ES module
  //     json(),
  //     typescript(), // so Rollup can convert TypeScript to JavaScript
  //   ],
  // },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // an array for the `output` option, where we can specify
  // `file` and `format` for each target)
  {
    input: 'src/index.js',
    // external: ['ms'],
    plugins: [
      // typescript(), // so Rollup can convert TypeScript to JavaScript
      babel({
        exclude: ['node_modules/**'],
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs' },
      { file: pkg.module, format: 'es' },
    ],
  },
]
