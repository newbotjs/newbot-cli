import {
    ConsoleBot
} from 'bottender'
import _ from 'lodash'
import colorize from 'json-colorizer'
import {
    Converse
} from 'newbot'
import Session from 'newbot-formats/session/bottender'
import runSkill from '../build/run-skill'

export default ({
    source,
    lang,
    skill
}) => {
    const files = process.cwd() 
    const skillBundle = runSkill(`${files}/bot/${skill ? `skills/${skill}/${skill}` : 'main' }`)
    const converse = new Converse(skillBundle.default)

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
            preUser(user) {
                const currentLang = user.getLang()
                if (lang && !currentLang) user.setLang(lang)
            },
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