import express from 'express'
import http from 'http'
import fs from 'fs'
import Path from 'path'
import _ from 'lodash'
import {
    Converse
} from 'newbot'

import rp from 'request-promise'
import chokidar from 'chokidar'
import decache from 'decache'
import reload from 'reload'
import Listr from 'listr'
import moment from 'moment'
import Table from 'cli-table'
import ngrokModule from 'ngrok'
import execa from 'execa'

import mainConfig from '../config'
import botbuilderPlatform from '../server/platforms/botbuilder'
import bottenderPlatform from '../server/platforms/bottender'
import gactionsPlatform from '../server/platforms/gactions'
import twitterPlatform from '../server/platforms/twitter'
import serverApp from '../server/app';
import runSkill from '../build/run-skill'
import connectCloud from '../core/cloud'
import build from '../build/main'
import socketIo from 'socket.io'

import getConfigFile from '../core/get-config-file'

import webhookViber from '../webhooks/viber'
import webhookTelegram from '../webhooks/telegram'

const rollup = require('rollup')

export default async ({
    port = 3000,
    ngrok = true,
    cloud = false,
    entry = 'main.js'
} = {}) => {
    try {

        let apiFile = false
        let disposeCode = false

        const app = express()
        const server = http.Server(app)
        const io = socketIo(server)

        const reloadServer = reload(app)
        const files = process.cwd()

        let newbotCloud

        if (cloud) {
            newbotCloud = await connectCloud()
        }

        let config = getConfigFile()

        var watcher = chokidar.watch(`${files}/bot/**/*`, {
            ignored: '*.spec.js',
            persistent: true
        })

        const tasks = new Listr([
            {
                title: `NewBot Framework Version : ${Converse.version}`,
                task() {

                }
            },
            
            {
            title: `Listen your bot in port ${port}`.green,
            task() {
                return new Promise((resolve, reject) => {
                    watcher.on('ready', () => {
                        let lastDate = new Date().getTime()
                        watcher.on('all', (ev, path) => {
                            let current = new Date().getTime()
                            if (lastDate + 800 >= current) {
                                return
                            }
                            lastDate = current
                            tasksChange.run({
                                ev,
                                path
                            })
                        })
                        loadApp(resolve, reject)
                    })
                }).then(() => {
                    return new Promise((resolve, reject) => {
                        server.listen(port, (err) => {
                            if (err) return reject(err)
                            resolve()
                        })
                    })
                })
            }
        }, {
            title: `Connect to Ngrok`,
            skip() {
                if (!ngrok) {
                    return 'ngrok is disabled'
                }
            },
            async task(ctx) {
                ctx.url = await ngrokModule.connect(_.merge({
                    addr: port
                }, config.ngrok))
            }
        }, /* {
            title: `Connect to NewBot Cloud`,
            skip() {
                if (!ngrok) {
                    return 'ngrok is disabled'
                }
                if (!newbotCloud) {
                    return `Use the command "newbot serve --cloud" to test your chatbot on NewBot Cloud`
                }
            },
            async task(ctx) {
                disposeCode = true
                const {
                    configCloud,
                    userToken
                } = newbotCloud
                await rp({
                    url: `${mainConfig.urlCloud}/api/bots/${configCloud.botId}/ngrok`,
                    method: 'POST',
                    body: {
                        url: ctx.url
                    },
                    json: true,
                    headers: {
                        'x-access-token': userToken
                    }
                })
                try {
                    const configFile = `${files}/api.js`
                    fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK)
                    apiFile = true
                    watcher.add(`${files}/api.js`)
                } catch (err) {
                    if (err.code != 'ENOENT') console.log(err)
                }
            }
        }, */ {
            title: `Set WebHook to Twitter platform`,
            skip() {
                const {
                    twitter
                } = config.platforms
                if (!ngrok) {
                    return 'ngrok is disabled'
                }
                if (!twitter) {
                    return 'Add "platforms.twitter" property in "newbot.config.js" file'
                }
                if (!twitter.accessToken) {
                    return 'Add "platforms.twitter.accessToken" property in "newbot.config.js" file with authentification token'
                }
            },
            async task(ctx) {
                const {
                    consumerKey,
                    consumerSecret,
                    accessToken,
                    accessTokenSecret
                } = config.platforms.twitter
                const apiTwitter = 'https://api.twitter.com/1.1/account_activity/all/dev'
                const url = `${apiTwitter}/webhooks.json`
                const oauth = {
                    consumer_key: consumerKey,
                    consumer_secret: consumerSecret,
                    token: accessToken,
                    token_secret: accessTokenSecret
                }
                const res = await rp.get({
                    url,
                    oauth,
                    json: true
                })

                const webHook = res.find(el => /emulator/.test(el.url))

                if (webHook) {
                    await rp.delete({
                        url: `${apiTwitter}/webhooks/${webHook.id}.json`,
                        oauth
                    })
                }

                await rp.post({
                    url,
                    headers: {
                        'Content-type': 'application/x-www-form-urlencoded'
                    },
                    oauth,
                    form: {
                        url: ctx.url + '/emulator/twitter'
                    }
                })

                await rp.post({
                    url: `${apiTwitter}/subscriptions.json`,
                    oauth
                })
            }
        }, 
        webhookViber(config, { ngrok }), 
        webhookTelegram(config, { ngrok }), 
        {
            title: 'Auto configuration Google Actions',
            skip() {
                const {
                    gactions
                } = config.platforms
                if (!ngrok) {
                    return 'ngrok is disabled'
                }
                if (!gactions) {
                    return 'Add "platforms.gactions" property in "newbot.config.js" file to test Google Actions'
                }
                if (!gactions.projectId) {
                    return 'Add "platforms.gactions.projectId" property in "newbot.config.js" file with your Google Action project id value'
                }
                if (!gactions.triggers) {
                    return 'Add "platforms.gactions.triggers" property in "newbot.config.js" file. Ex : { triggers : { en: "Talk with chatbot" } }'
                }
            },
            task(ctx) {
                const {
                    gactions
                } = config.platforms
                const gactionsDir = `${files}/gactions`
                const regexp = /action\.([a-zA-Z-]+)\.json/

                try {
                    fs.mkdirSync(gactionsDir)
                } catch (err) {
                    if (err.code != 'EEXIST') throw err
                }

                const actionFiles = () => fs.readdirSync(gactionsDir).filter(filename => regexp.test(filename))

                return new Listr([{
                        title: 'Generate "action.LANG.json" files',
                        skip(ctx) {
                            const arrayFiles = actionFiles().map(filename => filename.match(regexp)[1])
                            ctx.fileToCreate = _.difference(Object.keys(gactions.triggers, arrayFiles))
                            if (ctx.fileToCreate.length == 0) {
                                return 'All files are already created'
                            }
                        },
                        task(ctx) {
                            const {
                                fileToCreate
                            } = ctx

                            for (let lang of fileToCreate) {
                                const json = {
                                    "actions": [{
                                        "description": "Default Intent",
                                        "name": "MAIN",
                                        "fulfillment": {
                                            "conversationName": "newbot"
                                        },
                                        "intent": {
                                            "name": "actions.intent.MAIN",
                                            "trigger": {
                                                "queryPatterns": gactions.triggers[lang]
                                            }
                                        }
                                    }],
                                    "conversations": {
                                        "newbot": {
                                            "name": "newbot",
                                            "url": "<URL>"
                                        }
                                    },
                                    "locale": lang
                                }
                                fs.writeFileSync(`${gactionsDir}/action.${lang}.json`, JSON.stringify(json, null, 2), 'utf-8')
                            }
                        }
                    },
                    {
                        title: 'Update Google Actions',
                        async task() {
                            const {
                                gactions
                            } = config.platforms
                            let actionPackages = ''
                            actionFiles().forEach(filename => {
                                const file = `${gactionsDir}/${filename}`
                                let json = fs.readFileSync(file, 'utf-8')
                                json = JSON.parse(json)
                                json.conversations.newbot.url = ctx.url + '/emulator/gactions'
                                fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf-8')
                                actionPackages += ' --action_package ' + file
                    12        })
                            const shell = `${gactions.binPath || Path.resolve(__dirname, '../bin/gactions')} update ${actionPackages} --project ${gactions.projectId}`
                            try {
                                fs.accessSync(`${files}/creds.data`, fs.constants.R_OK | fs.constants.W_OK)
                                await execa.shell(shell)
                            } catch (e) {
                                await execa.shell(shell, {
                                    input: process.stdin
                                }).stdout.pipe(process.stdout)
                            }
                        }
                    }
                ], {
                    concurrent: true
                })
            }
        }])

        const tasksChange = new Listr([{
            title: '',
            task({
                ev,
                path
            }, task) {
                task.title = `${moment().format()} Reload your chatbot`;
                return new Promise((resolve, reject) => {
                    loadApp(resolve, reject)
                })
            }
        }])

        const loadApp = async (resolve, reject) => {
            try {
                let skill
                do {
                    const p = `${files}/bot/${entry}`
                    decache(p)
                    skill = await runSkill(p)
                } while (!skill.default)
                global.converse = new Converse(skill.default)
                global.converse.debug = true
                if (disposeCode) {
                    const optionsRollup = build({
                        type: 'node'
                    })
                    const bundle = await rollup.rollup(optionsRollup)
                    const {
                        code,
                        map
                    } = await bundle.generate({
                        format: 'cjs',
                        strict: false
                    })
                    global.code = code

                    if (apiFile) {
                        const optionsRollupApi = build({
                            type: 'node',
                            root: 'api.js'
                        })
                        const bundleApi = await rollup.rollup(optionsRollupApi)
                        const {
                            code: codeApi
                        } = await bundleApi.generate({
                            format: 'cjs',
                            strict: false
                        })
                        global.codeApi = codeApi
                    }

                    const {
                        configCloud,
                        userToken
                    } = newbotCloud
                    await rp({
                        url: `${mainConfig.urlCloud}/api/bots/${configCloud.botId}/dev/reload`,
                        method: 'POST',
                        headers: {
                            'x-access-token': userToken
                        }
                    })
                }
                reloadServer.reload()
                resolve()
            } catch (err) {
                reject(err)
            }
        }

        tasks.run().then((ctx) => {

            if (!ctx.url) return

            var table = new Table({
                chars: {
                    'top': '═',
                    'top-mid': '╤',
                    'top-left': '╔',
                    'top-right': '╗',
                    'bottom': '═',
                    'bottom-mid': '╧',
                    'bottom-left': '╚',
                    'bottom-right': '╝',
                    'left': '║',
                    'left-mid': '╟',
                    'mid': '─',
                    'mid-mid': '┼',
                    'right': '║',
                    'right-mid': '╢',
                    'middle': '│'
                }
            });

            table.push(['Ngrok URL', ctx.url])

            if (config.platforms.slack) {
                table.push(['Slack WebHook URL', ctx.url + '/emulator/slack'])
            }

            if (config.platforms.line) {
                table.push(['Line WebHook URL', ctx.url + '/emulator/line'])
            }

            if (config.platforms.messenger) {
                table.push([
                    'Messenger WebHook URL', ctx.url + '/emulator/messenger',
                    'Messenger Verifiy Token', config.platforms.messenger.verifyToken
                ])
            }

            console.log(table.toString())
        })


        serverApp(app, io, files)

        botbuilderPlatform(app)
        bottenderPlatform(app, config)

        if (config.platforms.gactions) {
            gactionsPlatform(app)
        }

        if (config.platforms.twitter) {
            twitterPlatform(app, config)
        }

    } catch (err) {
        console.log(err)
    }

}