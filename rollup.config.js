import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';
import pkg from './package.json';

export default {
  input: 'src/index.js',
  output: [ // https://rollupjs.org/guide/en/#outputexports
    { file: pkg.main, format: 'cjs', exports: 'default' },
    { file: pkg.module, format: 'es', exports: 'default' }
  ],
  external: [],
  plugins: [json(), terser()]
};
