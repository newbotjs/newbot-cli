import Listr from 'listr'
import fs from 'fs'
import build from '../build/webpack'
import Handlebars from 'handlebars'
import { ncp } from 'ncp'

const rollup = require('rollup')

export default async ({ entry = 'main.js', node = false }) => {
    const path = process.cwd()
    const dist = `${path}/dist` 

    const tasks = new Listr([{
            title: 'Build your chatbot for NodeJS',
            task() {
                return build({
                    type: 'node',
                    dir: 'dist/node',
                    file: 'bot.js',
                    entry
                })
            }
        },
       {
            title: 'Build your chatbot for browser',
            skip() {
                return node
            },
            task() {
                return new Listr([
                    {
                        title: 'Build source',
                        task() {
                            return build({
                                type: 'browser',
                                dir: 'dist/browser',
                                file: 'main.js',
                                var: 'MainSkill',
                                entry
                            })
                        }
                    },
                    {
                        title: 'Copy model directory',
                        skip() {
                            try {
                                fs.statSync(`${path}/bot/model`)
                            }
                            catch (err) {
                                if (err && err.code === 'ENOENT') {
                                    return 'Ignore because model directory not exists'
                                }
                            }
                        },
                        task() {
                            return new Promise((resolve, reject) => {
                                ncp(`${path}/bot/model`, `${dist}/browser/model`, (err) => {
                                    if (err) {
                                        return reject(err)
                                    }
                                    resolve()
                                })
                            })
                        }
                    },
                    {
                        title: 'Create HTML template',
                        task() {
                            const pathTpl = `${__dirname}/../../templates/browser`

                            const copy = (file) => {
                                let tpl = fs.readFileSync(`${pathTpl}/${file}`, 'utf-8')
                                const tplCompiled = Handlebars.compile(tpl)
                                tpl = tplCompiled()
                                fs.writeFileSync(`${dist}/browser/${file}`, tpl)
                            }

                            copy('index.html')
                        }
                    }
                ])
            }
        }
    ])

   try {
        await tasks.run()
   }
   catch (err) {
       console.log(err[0])
   }

}