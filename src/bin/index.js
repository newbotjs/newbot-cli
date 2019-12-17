#!/usr/bin/env node
const path = require('path')

var modulesToCompile = (modules) => new RegExp(
    `^((?!node_modules).)*$|(${modules.join('|')})(?!\/node_modules)`);

var ifDoesntMatch = (pattern) => (input) => !pattern.test(input);

const resolvePath = p => path.resolve(__dirname, `../../node_modules/babel-${p}`)

require("@babel/register")({
    presets: [
        [resolvePath('preset-env'), {
            "targets": {
                "node": "current"
            }
        }]
    ],
    ignore: ifDoesntMatch(modulesToCompile(['newbot-formats'])),
    plugins: [
        resolvePath('plugin-transform-object-rest-spread'),
        [resolvePath("plugin-inline-import"), {
            "extensions": [
                ".converse"
            ]
        }]
    ],
    cache: false
})

require("./main")