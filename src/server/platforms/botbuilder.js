import {
    ChatConnector,
    UniversalBot
} from 'botbuilder'

export default (app) => {
    const connector = new ChatConnector()
    const bot = new UniversalBot(connector, (session) => {
        const {
            text,
            user
        } = session.message
        global.converse.exec(text, user.id, {
            output(msg, next) {
                session.send(msg)
                next()
            },
            data: {
                session
            }
        })
    })
    app.post('/emulator', connector.listen())
}