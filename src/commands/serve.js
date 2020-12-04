import express from 'express'
import http from 'http'
import fs from 'fs'

import Path from 'path'
import _ from 'lodash'

import rp from 'request-promise'
import chokidar from 'chokidar'
import decache from 'decache'
import Listr from 'listr'
import moment from 'moment'
import Table from 'cli-table'
import ngrokModule from 'ngrok'
import execa from 'execa'
import stringify from 'json-stringify-safe';
import expressNewBot from 'newbot-express'
import converseOutput from 'newbot-express/output'
import langAll from '@nlpjs/lang-all'

import mainConfig from '../config'
import serverApp from '../server/app';
import serverLog from '../server/log';
import runSkill from '../build/run-skill'
import connectCloud from '../core/cloud'
import build from '../build/main'
import socketIo from 'socket.io'

import analysis from './analysis'

import getConfigFile from '../core/get-config-file'
import getConverse from '../core/get-newbot'

import trainTasks from './train'

import replaceBlankChar from '../utils/link-cli'

import webhookViber from '../webhooks/viber'
import webhookTelegram from '../webhooks/telegram'

const rollup = require('rollup')

export default async ({
    port = 3000,
    ngrok = true,
    cloud = false,
    entry = 'main.js',
    config: configFile,
    path = process.cwd()
} = {}) => {
    try {

        const Converse = getConverse()

        global.logs = []

        let apiFile = false
        let disposeCode = false
        let socket
        let ngrokIgnore = false

        const app = express()
        const server = http.Server(app)
        const io = socketIo(server)

        const files = path

        let newbotCloud

        if (cloud) {
            newbotCloud = await connectCloud()
        }

        let config = getConfigFile(configFile)

        let watcher
        
        const tasks = new Listr([
            {
                title: `NewBot Framework Version : ${Converse.version}`,
                task() {

                }
            },

            {
                title: 'Train Bot',
                task() {
                    return trainTasks({
                        onlyTasks: true,
                        path,
                        entry
                    })
                }
            },

            {
                title: `Connect to Ngrok`,
                skip(ctx) {
                    const { platforms } = config
                    if (!platforms || (platforms && Object.keys(platforms).length == 0)) {
                        process.env.SERVER_URL = ctx.url = 'http://localhost:' + port
                        ngrokIgnore = true
                        return 'ngrok is not launched because no external platform'
                    }
                    if (!ngrok) {
                        return 'ngrok is disabled'
                    }
                },
                async task(ctx) {
                    if (config.ngrok && config.ngrok.url) {
                        ctx.url = config.ngrok.url
                    }
                    else {
                        ctx.url = await ngrokModule.connect(_.merge({
                            addr: port
                        }, config.ngrok))
                    }
                    process.env.SERVER_URL = ctx.url
                }
            },
            
            {
            title: `Listen your bot in port ${port}`.green,
            task() {
                return new Promise((resolve, reject) => {
                    watcher = chokidar.watch(`${files}/bot/**/*`, {
                        ignored: '*.spec.js',
                        persistent: true
                    })
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
                await buildRemoteSkill()
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
                                actionPackages += ' --action_package ' + replaceBlankChar(file)
                    12        })
                            const binPath = replaceBlankChar(gactions.binPath || Path.resolve(__dirname, '../bin/gactions'))
                            const shell = `${binPath} update ${actionPackages} --project ${gactions.projectId}`
                            try {
                                fs.accessSync(`${files}/creds.data`, fs.constants.R_OK | fs.constants.W_OK)
                                await execa.shell(shell)
                            } catch (e) {
                                setTimeout(_ => {
                                   /* execa.shell(shell, {
                                        input: process.stdin
                                    }).stdout.pipe(process.stdout)*/
                                    console.log(e)
                                    console.log('Shell Command: ', shell)
                                }, 2000)
                                
                            }
                        }
                    }
                ])
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

        const buildRemoteSkill = async () => {
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
        }

        const loadApp = async (resolve, reject) => {
            try {
                let skill
                do {
                    const p = `${files}/bot/${entry}`
                    decache(p)
                    skill = await runSkill(p)
                } while (!skill.default)
                global.converse = new Converse(skill.default, {
                    model: files + '/bot/model/model.nlp',
                    modelLangs: [langAll]
                })
                global.converse.debug = true
                if (disposeCode) {
                    await buildRemoteSkill()
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
                resolve()
            } catch (err) {
                console.log(err)
                reject(err)
            }
        }

        
        serverLog(app,  {
            Converse,
            path: files
        })

        const output = {
            debug(type, val) {
                const user = val.user
                val.user = {
                    adress: user.address,
                    _infoAddress: user._infoAddress,
                    varFn: user.varFn,
                    magicVar: user.magicVar,
                    variables: user.variables,
                    id: user.id,
                    lang: user.lang
                }
                if (val.data && val.data.session) {
                    val.platform = val.data.session.message.source
                    val.data = undefined
                }
                val._instructions = undefined
                

                if (type == 'begin') {
                    global.logs.push([])
                }

                const last =  global.logs.length - 1

                if (val.level == 'root' &&  global.logs[last] &&  global.logs[last].findIndex(p => p.level == 'root') !=
                    1) {
                    return
                }

                const event = {
                    type,
                    date: new Date(),
                    val: stringify(val)
                }

                global.logs[last].push(event)

                if (socket) socket.emit('debug', {
                    event, 
                    index: last
                })
            }
        }

        io.on('connection', (sock) => {
            socket = sock
            socket.on('message', (data) => {
                const { event } = data
                const userId = 'emulator-user'
                const options = converseOutput({
                    message: {
                        source: 'website'
                    },
                    source: 'website',
                    send(output) {
                        socket.emit('message', output)
                    },
                    user: {
                        id: userId
                    }
                }, { output })
                if (event) {
                    global.converse.event(event.name, event.data, userId, options).catch(console.log)
                } else {
                    global.converse.exec(data, userId, options).catch(console.log)
                }
            })
        })
        

        const expressBot = expressNewBot({
            botPath: files,
            botConfigFile: config,
            botframework: {
                path: '/emulator'
            },
            messenger: {
                path: '/emulator/messenger'
            },
            viber: {
                path: '/emulator/viber'
            },
            messenger: {
                path: '/emulator/messenger'
            },
            telegram: {
                path: '/emulator/telegram'
            },
            line: {
                path: '/emulator/line'
            },
            slack: {
                path: '/emulator/slack'
            },
            gactions: {
                path: '/emulator/gactions'
            },
            twitter: {
                path: '/emulator/twitter'
            },
            alexa: {
                path: '/emulator/alexa'
            },
            output
        }, app, true)

        serverApp(app, socket, files)

        const serverRoutes  = `${files}/server/routes.js`

        try {
            fs.accessSync(serverRoutes, fs.constants.R_OK | fs.constants.W_OK)
            const routesModule = require(serverRoutes)
            routesModule(app, expressBot)
        } catch (err) {
            if (err.code != 'ENOENT') {
                console.log(err)
            }
            else {
                console.log(`File not found : ${serverRoutes}. Ignored file`)
            }
        }

        tasks.run().then((ctx) => {

            if (!ctx.url || ngrokIgnore) return

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

    } catch (err) {
        console.log(err)
    }

}