import rp from 'request-promise'
import fs from 'fs'
import inquirer from 'inquirer'
import login from '../commands/login'
import config from '../config'

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
                        message: 'What is the bot?',
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
        return { userToken, configCloud }
    } catch (err) {
        if (err.statusCode == 403) {
            switch (err.error.message) {
                case 'MAX_BOTS_EXCEEDED':
                    throw 'You have reached the chatbot creation limit. Please upgrade your account on https://app.newbot.io/me/upgrade'
                case 'ROLE_NOT_AUTHORIZED':
                    throw 'Your role does not allow you to create a chatbot'
                default:
                    throw 'You do not have permission to create a chatbot'
            }
           
        }
        throw err.message.red
    }
}