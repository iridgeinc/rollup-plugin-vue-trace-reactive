import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import json from '@rollup/plugin-json'
import terser from '@rollup/plugin-terser'

const libraryName = 'rollup-plugin-vue-trace-reactive'

const output = (name) => [
  { 
    file: `dist/${name}.umd.js`,
    name: libraryName,
    format: 'umd',
    sourcemap: true },
  {
    file: `dist/${name}.umd.min.js`,
    name: libraryName,
    format: 'umd',
    sourcemap: true,
    plugins: [terser()],
  },
  {
    file: `dist/${name}.es5.js`,
    format: 'es',
    sourcemap: true
  },
  {
    file: `dist/${name}.es5.min.js`,
    format: 'es',
    sourcemap: true,
    plugins: [terser()]
  }
]

export default [
  {
    input: `src/plugin.ts`,
    output: output('plugin'),
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: ['path'],
    watch: {
      include: 'src/**',
    },
    plugins: [
      // Allow json resolution
      json(),
      // Compile TypeScript files
      typescript(),
      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs({ extensions: ['.js', '.ts'] }),

      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve({
        preferBuiltins: true
      }),
    ],
  },
  {
    input: `src/tracker.ts`,
    output: output('tracker'),
    // Indicate here external modules you don't wanna include in your bundle (i.e.: 'lodash')
    external: [],
    watch: {
      include: 'src/**',
    },
    plugins: [
      // Allow json resolution
      json(),
      // Compile TypeScript files
      typescript(),
      // Allow bundling cjs modules (unlike webpack, rollup doesn't understand cjs)
      commonjs({ extensions: ['.js', '.ts'] }),

      // Allow node_modules resolution, so you can use 'external' to control
      // which external modules to include in the bundle
      // https://github.com/rollup/rollup-plugin-node-resolve#usage
      resolve({
        browser: true,
        preferBuiltins: false
      }),
    ],
  }
]
