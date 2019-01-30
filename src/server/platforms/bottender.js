import {
    MessengerBot,
    ViberBot,
    TelegramBot,
    LineBot,
    SlackBot,
    MessengerHandler
} from 'bottender'
import {
    registerRoutes
} from 'bottender/express'
import Session from 'newbot-formats/session/bottender'
import PrettyError from 'pretty-error'

export default (app, config) => {

    const pe = new PrettyError()
    
    const event = async context => {
        const {
            text,
            isText
        } = context.event
        if (!isText) return
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

    const error = (context, err) => {
        console.log(pe.render(err))
    }

    const handler = new MessengerHandler()
        .onEvent(event)
        .onError(error)

    if (config.platforms.messenger) {
        const messengerBot = new MessengerBot(config.platforms.messenger).onEvent(handler)
        registerRoutes(app, messengerBot, {
            path: '/emulator/messenger',
            verifyToken: config.platforms.messenger.verifyToken
        })
    }
    if (config.platforms.viber) {
        const viberBot = new ViberBot(config.platforms.viber).onEvent(handler)
        registerRoutes(app, viberBot, {
            path: '/emulator/viber'
        })
    }

    if (config.platforms.telegram) {
        const telegramBot = new TelegramBot(config.platforms.telegram).onEvent(handler)
        registerRoutes(app, telegramBot, {
            path: '/emulator/telegram'
        })
    }

    if (config.platforms.line) {
        const lineBot = new LineBot(config.platforms.line).onEvent(handler)
        registerRoutes(app, lineBot, {
            path: '/emulator/line'
        })
    }

    if (config.platforms.slack) {
        const slackBot = new SlackBot(config.platforms.slack).onEvent(handler)
        registerRoutes(app, slackBot, {
            path: '/emulator/slack'
        })
    }

}