import _ from 'lodash'
import fs from 'fs'
import webpack from "webpack";
import Path from 'path'
import nodeExternals from 'webpack-node-externals'

function asset(options = {}) {
    return new Promise((resolve, reject) => {
        const path = process.cwd()

        let config = {}
        try {
            const configFile = `${path}/newbot.config.js`
            fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK);
            config = require(configFile)
        } catch (err) {}

        const {
            map,
            root,
            plugins
        } = config

        const _root = options.root || root

        const alias = {}

        if (map) {
            for (let pkg in map) {
                let platform = map[pkg]
                if (!_.isString(platform)) {
                    platform = platform[options.type]
                }
                alias[pkg] = platform
            }
        }

        let entry = []
        const rules = [
            {
                test: /\.converse$/,
                use: [{
                    loader: Path.resolve(__dirname, '../loader/converse.js')
                }]
            }
        ]

        if (options.type == 'browser') {
            entry.push(Path.resolve(__dirname, '../../node_modules/babel-polyfill'))
            entry.push(Path.resolve(__dirname, 'bundles/init-browser'))
            rules.push({
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: Path.resolve(__dirname, '../../node_modules/babel-loader'),
                    options: {
                        presets: require('babel-preset-env')
                    }
                }
            })
            if (plugins) {
                const bundles = plugins.filter(p => p.bundle)
                entry = entry.concat(bundles.map(b => Path.resolve(path, b.bundle)))
            }
        }

        entry.push(root ? `${path}/${_root}` : `${path}/bot/main.js`)

        const webpackOptions = {
            mode: 'production',
            target: 'node',
            entry,
            output: {
                path: `${path}/${options.dir}`,
                filename: options.file,
                libraryTarget: options.type == 'node' ? 'umd' : 'var',
                libraryExport: 'default'
            },
            module: {
                rules
            },
            resolve: {
                alias
            }
        }

        if (options.type == 'node') {
            webpackOptions.externals = [nodeExternals()]
            webpackOptions.node = {
                __dirname: false
            }
        } else {
            webpackOptions.output.library = 'MainSkill'
            webpackOptions.node = {
                __dirname: false
            }
        }

        webpack(webpackOptions, (err, stats) => {
            if (err || stats.hasErrors()) {
                const info = stats.toJson()
                if (err) return reject(err)
                else return reject(info.errors)
            }
            resolve()
        })
    })
}

export default asset