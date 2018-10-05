import {
    ConsoleBot
} from 'bottender'
import _ from 'lodash'
import colorize from 'json-colorizer'
import {
    Converse
} from 'newbot'
import Session from 'newbot-formats/session/bottender'

export default ({
    source
}) => {
    const files = process.cwd()
    const skill = require(`${files}/bot/main`)

    const converse = new Converse(skill.default)

    const bot = new ConsoleBot({
        fallbackMethods: true
    })

    bot.onEvent(async context => {
        const {
            text
        } = context.event
        let platform = 'website'
        if (_.isString(source)) {
            platform = source
        }
        let session = new Session(context, platform)
        await converse.exec(text, 'emulator', {
            async output(str) {
                if (platform == 'website') {
                    if (!_.isString(str)) {
                        str = colorize(JSON.stringify(str, null, 2))
                    }
                    await context.sendText(str)
                } else {
                    session.send(str)
                }
            },
            data: {
                session
            }
        })
    })

    bot.createRuntime()
}