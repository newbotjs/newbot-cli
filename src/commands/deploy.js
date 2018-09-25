import rp from 'request-promise'
import fs from 'fs'
import inquirer from 'inquirer'
import archiver from 'archiver'
import Listr from 'listr'
import login from './login'
import config from '../config'
import build from '../build/main'

const rollup = require('rollup')

export default async () => {
    const env = process.env.NODE_ENV
    const directory = process.cwd()
    try {
        const {
            userToken
        } = await login()
        const cloudFile = directory + '/.newbot-cloud' + (env ? '-' + env : '')
        let configCloud
        try {
            configCloud = fs.readFileSync(cloudFile, 'utf-8')
            configCloud = JSON.parse(configCloud)
        } catch (err) {
            if (err.code == 'ENOENT') {
                const bots = await rp({
                    url: `${config.urlCloud}/api/bots`,
                    json: true,
                    headers: {
                        'x-access-token': userToken
                    }
                })

                let botId

                if (bots.length > 0) {
                    let choice = await inquirer.prompt([{
                        type: 'list',
                        name: 'botId',
                        message: 'Which bot do you want to deploy?',
                        choices: [{
                                name: 'Create a chatbot',
                                value: 'create'
                            },
                            new inquirer.Separator(),
                            ...bots.map(bot => {
                                return {
                                    name: bot.name,
                                    value: bot._id
                                }
                            })
                        ]
                    }])
                    botId = choice.botId
                } else {
                    botId = 'create'
                }

                if (botId == 'create') {
                    const {
                        botName
                    } = await inquirer.prompt([{
                        type: 'input',
                        name: 'botName',
                        message: 'What is the name for your new chatbot?'
                    }])
                    const newBot = await rp({
                        url: `${config.urlCloud}/api/bots`,
                        method: 'POST',
                        json: true,
                        body: {
                            name: botName
                        },
                        headers: {
                            'x-access-token': userToken
                        }
                    })
                    botId = newBot._id
                }
                configCloud = {
                    botId
                }
                fs.writeFileSync(cloudFile, JSON.stringify(configCloud))
            }
        }

        const zipFile = __dirname + '/../../tmp/bot.zip'

        const tasks = new Listr([{
                title: 'Build',
                async task() {
                    const optionsRollup = build({
                        type: 'node'
                    })
                    const bundle = await rollup.rollup(optionsRollup)
                    await bundle.write({
                        format: 'cjs',
                        dir: 'dist',
                        file: 'dist/bot.js',
                        strict: false
                    })
                }
            },
            {
                title: 'Packaging',
                task() {
                    return new Promise((resolve, reject) => {
                        const output = fs.createWriteStream(zipFile)
                        const archive = archiver('zip', {
                            zlib: {
                                level: 9
                            }
                        })

                        output.on('close', function () {
                            resolve()
                        })

                        archive.on('warning', reject)
                        archive.on('error', reject)

                        archive.directory(`${directory}/.build`, '.build')
                        archive.glob('**/*', {
                            cwd: directory,
                            ignore: ['node_modules/**/*', 'node_modules']
                        }, {})
                        archive.pipe(output);
                        archive.finalize()
                    })
                }
            },
            {
                title: 'Deploy on NewBot Cloud', 
                task() {
                    return rp({
                        url: `${config.urlCloud}/api/bots/${configCloud.botId}/deploy`,
                        method: 'POST',
                        formData: {
                            archive: fs.createReadStream(zipFile)
                        },
                        json: true,
                        headers: {
                            'x-access-token': userToken
                        }
                    })
                }
            }
        ])
        await tasks.run()
        console.log('[NewBot Cloud] The chatbot has been successfully deployed'.green)
    } catch (err) {
        console.log(err.message.red)
    }
}