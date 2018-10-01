import express from 'express'
import http from 'http'
import fs from 'fs'
import Path from 'path'
import _ from 'lodash'
import {
    Converse
} from 'newbot'

import chokidar from 'chokidar'
import decache from 'decache'
import reload from 'reload'
import Listr from 'listr'
import moment from 'moment'
import ngrokModule from 'ngrok'
import execa from 'execa'
import inquirer from 'inquirer'

import botbuilderPlatform from '../server/platforms/botbuilder'
import bottenderPlatform from '../server/platforms/bottender'
import gactionsPlatform from '../server/platforms/gactions'
import serverApp from '../server/app';


export default async ({
    port = 3000,
    ngrok = false
} = {}) => {
    try {

        let config = {
            platforms: {}
        }

        const app = express()
        const reloadServer = reload(app)
        const files = process.cwd()

        try {
            const configFile = `${files}/newbot.config.js`
            fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK)
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
        }, {
            title: `Connect to Ngrok`,
            async task(ctx) {
                ctx.url = await ngrokModule.connect(port)
                console.log(ctx.url)
            }
        }, {
            title: 'Auto configuration Google Actions',
            skip() {
                const {
                    gactions
                } = config.platforms
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
                }
                catch (err) {
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
                            let actionPackages = ''
                            actionFiles().forEach(filename => {
                                const file = `${gactionsDir}/${filename}`
                                let json = fs.readFileSync(file, 'utf-8')
                                json = JSON.parse(json)
                                json.conversations.newbot.url = ctx.url + '/emulator/gactions'
                                fs.writeFileSync(file, JSON.stringify(json, null, 2), 'utf-8')
                                actionPackages += ' --action_package ' + file
                            })
                            const shell = `${Path.resolve(__dirname, '../bin/gactions')} update ${actionPackages} --project ${gactions.projectId}`
                            try {
                                fs.accessSync(`${files}/creds.data`, fs.constants.R_OK | fs.constants.W_OK)
                                await execa.shell(shell)
                            }
                            catch (e) {
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

        const loadApp = (resolve, reject) => {
            try {
                let skill
                do {
                    const p = `${files}/bot/main.js`
                    decache(p)
                    skill = require(p)
                } while (!skill.default)
                global.converse = new Converse(skill.default)
                global.converse.debug = true
                reloadServer.reload()
                resolve()
            } catch (err) {
                reject(err)
            }
        }

        tasks.run();


        serverApp(app, files)

        botbuilderPlatform(app)
        bottenderPlatform(app, config)

        if (config.platforms.gactions) {
            gactionsPlatform(app)
        }

    } catch (err) {
        console.log(err)
    }

}