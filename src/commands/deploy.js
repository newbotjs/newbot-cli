import rp from 'request-promise'
import fs from 'fs'
import archiver from 'archiver'
import Listr from 'listr'
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

        const zipFile = __dirname + '/../../tmp/bot.zip'

        const tasks = new Listr([{
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
        console.log(err[0])
    }
}