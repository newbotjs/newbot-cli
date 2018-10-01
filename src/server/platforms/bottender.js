import {
    MessengerBot
} from 'bottender'
import {
    registerRoutes
} from 'bottender/express'
import Session from 'newbot-formats/session/bottender'

export default (app, config) => {
    const handler = async context => {
        const {
            text
        } = context.event
        const session = new Session(context)
        await global.converse.exec(text, context.session.user.id, {
            output(str, next) {
                session.send(str)
                next()
            },
            data: {
                session
            }
        })
    }


    if (config.platforms.messenger) {
        const messengerBot = new MessengerBot(config.platforms.messenger).onEvent(handler)
        registerRoutes(app, messengerBot, {
            path: '/emulator/messenger',
            verifyToken: config.platforms.messenger.verifyToken
        })
    }
}