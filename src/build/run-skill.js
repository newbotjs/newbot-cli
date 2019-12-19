const path = require('path')
const _ = require('lodash')
const isPromise = require('../utils/is-promise')

var ifDoesntMatch = function ifDoesntMatch(test) {  
    return function (input) {
        const pattern = /node_modules\/newbot-[^\/]+\/(?!(node_modules))/g
        if (pattern.test(input)) return false;
        if (input.includes('node_modules')) return true;
        return false;
    };
};

const resolvePath = p => require.resolve(p)

export default async (skill) => {
    require("@babel/register")({
        presets: [
            [resolvePath('@babel/preset-env'), {
                "targets": {
                    "node": "current"
                }
            }],
            [resolvePath('@babel/preset-typescript')]
        ],
        ignore: [ifDoesntMatch()],
        plugins: [
            [resolvePath("babel-plugin-inline-import"), {
                "extensions": [
                    ".converse"
                ]
            }]
        ],
        extensions: ['.js', '.ts'],
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