import {
    ConsoleBot
} from 'bottender'
import _ from 'lodash'
import PrettyError from 'pretty-error'
import colorize from 'json-colorizer'
import getConverse from '../core/get-newbot'
import Session from 'newbot-formats/session/bottender'
import runSkill from '../build/run-skill'

export default async ({
    source,
    lang,
    skill
}) => {
    const Converse = getConverse()
    const files = process.cwd() 
    const skillBundle = await runSkill(`${files}/bot/${skill ? `skills/${skill}/${skill}` : 'main' }`)
    const converse = new Converse(skillBundle.default)

    const bot = new ConsoleBot({
        fallbackMethods: true
    })

    const pe = new PrettyError()

    bot.onEvent(async context => {
        const {
            text
        } = context.event
        let platform = 'website'
        if (_.isString(source)) {
            platform = source
        }
        let session = new Session(context, platform)

        try {
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
        }
        catch (err) {
            console.log(pe.render(err))
        }
    })

    bot.createRuntime()
}