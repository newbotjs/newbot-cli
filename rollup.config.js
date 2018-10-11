import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import json from 'rollup-plugin-json'
import { dependencies } from './package.json'

export default {
    input: 'src/bin/main.js',
    output: {
        file: 'dist/main.js',
        format: 'cjs'
    },
    external: Object.keys(dependencies),
    plugins: [
        json(),
        commonjs()
    ]
}