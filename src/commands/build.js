import Listr from 'listr'
import fs from 'fs'
import build from '../build/webpack'
import Handlebars from 'handlebars'
import trainTasks from './train'
import {
    ncp
} from 'ncp'

export default async ({
    entry = 'main.js',
    node = false,
    path
}) => {
    path = path ||  process.cwd()
    const dist = `${path}/dist`

    const tasks = new Listr([{
            title: 'Train Bot',
            task() {
                return trainTasks({
                    onlyTasks: true,
                    path
                })
            }
        },

        {
            title: 'Build your chatbot for NodeJS',
            task() {
                return build({
                    type: 'node',
                    dir: 'dist/node',
                    file: 'bot.js',
                    entry,
                    path
                })
            }
        },
        {
            title: 'Build your chatbot for browser',
            skip() {
                return node
            },
            task() {
                return new Listr([{
                        title: 'Build source',
                        task() {
                            return new Listr([{
                                title: 'Gloval var',
                                task() {
                                    return build({
                                        type: 'browser',
                                        dir: 'dist/browser',
                                        file: 'skill.js',
                                        var: 'MainSkill',
                                        entry,
                                        path
                                    })
                                }
                            }, {
                                title: 'CommonJS',
                                task() {
                                    return build({
                                        type: 'cjs',
                                        dir: 'dist/browser',
                                        file: 'skill.cjs.js',
                                        entry,
                                        path
                                    })
                                }
                            }])
                        }
                    },

                    {
                        title: 'Copy model directory',
                        skip() {
                            try {
                                fs.statSync(`${path}/bot/model`)
                            } catch (err) {
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

    await tasks.run()

}