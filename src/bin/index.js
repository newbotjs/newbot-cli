#!/usr/bin/env node

var modulesToCompile = (modules) => new RegExp(
    `^((?!node_modules).)*$|(${modules.join('|')})(?!\/node_modules)`);
  
  var ifDoesntMatch = (pattern) => (input) => !pattern.test(input);

require("babel-register")({
    presets: [
        ["env", {
            "targets": {
                "node": "current"
            }
        }]
    ],
    ignore: ifDoesntMatch(modulesToCompile(['newbot-formats'])),
    plugins: [
        'transform-object-rest-spread',
       ["babel-plugin-inline-import", {
            "extensions": [
                ".converse"
            ]
        }]
    ],
    cache: false
})
require("./main.js")