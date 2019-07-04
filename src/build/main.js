import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import json from 'rollup-plugin-json'
import { uglify } from 'rollup-plugin-uglify'
import fs from 'fs'
import _ from 'lodash'
import 'newbot/src/transpiler/load'
import Transpiler from 'newbot/src/transpiler/lexer'

function asset(options = {}) {
    const path = process.cwd()
    let dep = {}
    try {
        dep = require(`${path}/package.json`).dependencies || {}
    } catch (err) {}
    const dependencies = Object.keys(dep)
        .filter(d => !/newbot/.test(d))
    let config = {}
    try {
        const configFile = `${path}/newbot.config.js`
        fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK);
        config = require(configFile)
    } catch (err) {}

    const {
        map,
        root
    } = config

    const resolveOptions = {
        preferBuiltins: false
    }
    if (options.type == 'node') {
        resolveOptions.only = [/newbot/]
    }

    const _root = options.root || root

    const optionsRollup = {
        input: _root ? `${path}/${_root}` : `${path}/bot/main.js`,
        external: [...dependencies],
        onwarn(warning, warn) {
            if (warning.code == 'UNRESOLVED_IMPORT') {
                return
            }
            warn(warning)
        },
        plugins: [
            commonjs(),
            resolve(resolveOptions),
            json(),
            {
                name: 'converse',
                async transform(code, id) {
                    if (/converse$/.test(id)) {
                        const transpiler = new Transpiler(code, id)
                        const obj = transpiler.run()
                        const compiled = JSON.stringify(obj)
                        code = code.replace(/`/g, '\\`')
                        code = `
export default {
    code: \`${code}\`,
    compiled: ${compiled}
}
                        `
                        return {
                            code
                        }
                    }
                    const baseUrl = path
                    const converseUrlRegex = /file\s*:\s*(['"`](.*?)['"`])/g
                    const relativePathRegex = /^\.{1,2}\//i
                    const pathToApp = id
                        .replace(baseUrl, "")
                        .replace(new RegExp("[^/]+$"), "")

                    if (map) {
                        for (let pkg in map) {
                            let platform = map[pkg]
                            if (!_.isString(platform)) {
                                platform = platform[options.type]
                            }
                            const regexp = new RegExp(`${pkg}(['"])`, 'g')
                            code = code.replace(regexp, platform + '$1')
                        }
                    }

                    return { code }

                    if (options.type != 'node') {
                        let match = /['"`]browser:(.*?)['"`]/g.exec(code)
                        if (match) {
                            let name = match[1]
                            let _module = name.split('/')
                            let file = _module[_module.length - 1]
                            let pkg = '__' + file
                            code = code.replace(match[0], pkg)
                            if (/modules|packages/.test(id) && name[0] != '.') {
                                name = './' + file
                            }
                            code = `import ${pkg} from '${name}'
                            ${code}
                            `
                        }
                    }

                    code = code.replace(
                        converseUrlRegex,
                        function replaceMatch($0, quotedUrl, url) {
                            const absoluteUrl = relativePathRegex.test(url) ?
                                (pathToApp + url) :
                                url;
                            const converse = fs.readFileSync(path + '/' + absoluteUrl, 'utf-8')
                            const fileurl = absoluteUrl.replace(/^\//, '')
                            // (`file: "${ absoluteUrl.replace(/^\//, '') }"`)
                            return (`code: \`${converse}\``)
                        }
                    )

                    return {
                        code
                    }
                }
            }
        ]
    }

    /*if (options.type == 'browser') {
        optionsRollup.plugins.push(uglify())
    }*/

    return optionsRollup

}

export default asset