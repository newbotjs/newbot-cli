const path = require('path')
const _ = require('lodash')

var modulesToCompile = (modules) => new RegExp(
    `^((?!node_modules).)*$|(${modules.join('|')})(?!\/node_modules)`);

var ifDoesntMatch = (pattern) => (input) => !pattern.test(input);

const resolvePath = p => path.resolve(__dirname, `../../node_modules/babel-${p}`)

export default (skill) => {
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
            return {
                default: ret.default()
            }
        }
        return ret
    }
}