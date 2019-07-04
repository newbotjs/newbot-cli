import * as gactions from 'actions-on-google'
import _ from 'lodash'
import Session from 'newbot-formats/session/gactions'

export default (app, config) => {

    const propClientId = 'platforms.gactions.signin.clientId'
    const clientId = _.get(config, propClientId)

    const action = gactions.actionssdk({
        clientId
    })

    const handle = (conv, input, {
        type = 'exec',
        signin,
        userData
    } = {}) => {
        const session = new Session(gactions, conv)
        const userId = session.userId()
        const options = {
            output(str, next) {
                session.send(str)
                next()
            },
            data: {
                session
            }
        }

        if (type == 'exec') {
            return global.converse.exec(input, userId, options)
        }
        
        return global.converse.event(input, {
            profile: userData,
            signin
        }, userId, options)
    }

    const handleOption = (conv, params, option) => {
        return handle(conv, option)
    }

    const handleSignin = (conv, params, signin) => {
        const propName = 'platforms.gactions.signin.event'
        const eventName = _.get(config, propName)
        if (!eventName) {
            throw '[Gactions] Please, add event name in "' + propName + '" property in "newbot.config.js"'
        }
        if (!clientId) {
            throw '[Gactions] Please, add client Id "' + propClientId + '" property in "newbot.config.js"'
        }
        return handle(conv, eventName, {
            type: 'event',
            signin,
            userData: conv.user.profile.payload
        })
    }

    action.intent('actions.intent.MAIN', handle)
    action.intent('actions.intent.TEXT', handle)
    action.intent('actions.intent.OPTION', handleOption)
    action.intent('actions.intent.SIGN_IN', handleSignin)

    app.post('/emulator/gactions', action)
}