import express from 'express'
import http from 'http'
import fs from 'fs'
import _ from 'lodash'
import {
    Converse
} from 'newbot'
import build from '../build/main'
import {
    ChatConnector,
    UniversalBot
} from 'botbuilder'
import chokidar from 'chokidar'
import decache from 'decache'
import reload from 'reload'
import Listr from 'listr'
import moment from 'moment'

import {
    MessengerBot
} from 'bottender'
import {
    registerRoutes
} from 'bottender/express'
import Session from 'newbot-formats/session/bottender'

import serverApp from '../server/app';


export default async ({
    port = 3000,
    ngrok = false
} = {}) => {
    try {

        let converse, config

        const app = express()
        const reloadServer = reload(app)
        const files = process.cwd()

        try {
            const configFile = `${files}/newbot.config.js`
            fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK);
            config = require(configFile)
        } catch (err) {
            console.log(err)
        }

        var watcher = chokidar.watch(`${files}/bot/**/*`, {
            ignored: '*.spec.js',
            persistent: true
        })

        const tasks = new Listr([{
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
                        app.listen(port, (err) => {
                             if (err) return reject(err)
                             resolve()
                        })
                    })
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

        const loadApp = (resolve, reject) => {
            try {
                let skill
                do {
                    const p = `${files}/bot/main.js`
                    decache(p)
                    skill = require(p)
                } while (!skill.default)
                converse = new Converse(skill.default)
                converse.debug = true
                reloadServer.reload()
                resolve()
            } catch (err) {
                reject(err)
            }
        }

        tasks.run()

        const connector = new ChatConnector()
        const bot = new UniversalBot(connector, (session) => {
            const {
                text,
                user
            } = session.message
            converse.exec(text, user.id, {
                output(msg, next) {
                    session.send(msg)
                    next()
                },
                data: {
                    session
                }
            })
        })

        serverApp(app, files)

        app.post('/emulator', connector.listen())

        const handler = async context => {
            const {
                text
            } = context.event
            const session = new Session(context)
            await converse.exec(text, context.session.user.id, {
                output(str, next) {
                    session.send(str)
                    next()
                },
                data: {
                    session
                }
            })
        }

        if (config.platforms) {
            if (config.platforms.messenger) {
                const messengerBot = new MessengerBot(config.platforms.messenger).onEvent(handler)
                registerRoutes(app, messengerBot, {
                    path: '/emulator/messenger',
                    verifyToken: config.platforms.messenger.verifyToken,
                    ngrok: true
                })
            }
        }
        

    } catch (err) {
        console.log(err)
    }

}