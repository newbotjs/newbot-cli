const path = require('path')
const _ = require('lodash')
const isPromise = require('../utils/is-promise')

var modulesToCompile = (modules) => new RegExp(
    `^((?!node_modules).)*$|(${modules.join('|')})(?!\/node_modules)`);

var ifDoesntMatch = (pattern) => (input) => !pattern.test(input);

const resolvePath = p => path.resolve(__dirname, `../../node_modules/babel-${p}`)

export default async (skill) => {
    require("babel-register")({
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
    if (skill) {
        const ret = require(skill)
        if (_.isFunction(ret.default)) {
            let retFunc = ret.default()
            if (isPromise(retFunc)) {
                retFunc = await retFunc
            }
            return {
                default: retFunc
            }
        }
        return ret
    }
}