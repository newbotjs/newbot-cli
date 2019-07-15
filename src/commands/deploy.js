import rp from 'request-promise'
import fs from 'fs'
import archiver from 'archiver'
import {
    Converse
} from 'newbot'
import Listr from 'listr'
import runSkill from '../build/run-skill'
import config from '../config'
import cloud from '../core/cloud'
import build from '../build/webpack'

export default async ({ entry = 'main.js' }) => {
    const directory = process.cwd()
    try {

        const {
            userToken,
            configCloud
        } = await cloud()

        const mainSkill = `${directory}/bot/main.js`

        const zipFile = __dirname + '/../../tmp/bot.zip'

        const tasks = new Listr([
             {
                title: 'Build',
                async task() {
                    return build({
                        type: 'node',
                        dir: 'dist/node',
                        file: 'bot.js',
                        entry
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

                        //archive.directory(`${directory}/.build`, '.build')
                        archive.glob('**/*', {
                            cwd: directory,
                            ignore: ['node_modules/**/*', 'node_modules', 'package-lock.json']
                        }, {})
                        archive.pipe(output);
                        archive.finalize()
                    })
                }
            }, 
            {
                title: 'Get Intents',
                async skip(ctx) {
                    const skill = await runSkill(mainSkill)
                    const converse = new Converse()
                    await converse.loadOptions(skill.default)
                    ctx.intents = await converse.getAllIntents()
                    if (ctx.intents.length == 0) {
                        return 'No intentions found'
                    }
                },
                async task(ctx) {
                    const { intents } = ctx
                    const intentsObj = {}
                    for (let intent of intents) {
                        let [intentName, utterances] = intent.params
                        if (!utterances) continue 
                        if (!intentsObj[intentName]) intentsObj[intentName] = []
                        intentsObj[intentName] = intentsObj[intentName].concat(utterances)
                    }
                    await rp({
                        url: `${config.urlCloud}/api/bots/${configCloud.botId}/deployIntents`,
                        method: 'POST',
                        body: {
                            intents: intentsObj
                        },
                        json: true,
                        headers: {
                            'x-access-token': userToken
                        }
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
                    }).catch(err => {
                        if (err.statusCode == 403) {
                            switch (err.error.message) {
                                case 'ROLE_NOT_AUTHORIZED':
                                    throw 'Your role does not allow you to create deploy code. Please contact the chatbot owner for permission'
                                default:
                                    throw 'You do not have permission to deploy code'
                            }
                           
                        }
                        throw err
                    })
                }
            }
        ])
        await tasks.run()
        console.log('[NewBot Cloud] The chatbot has been successfully deployed'.green)
    } catch (err) {
        console.log(err)
    }
}