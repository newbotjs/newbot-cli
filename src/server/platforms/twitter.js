import { TwitterSession, CRCToken } from 'newbot-formats/session/twitter'

export default (app, config) => {
    app.get('/emulator/twitter', (req, res) => {
        try {
            res.status(200).send(CRCToken(config.platforms.twitter, req.query))
        }
        catch (err) {
            res.status(400).send(err.message)
        }
    })

    app.post('/emulator/twitter', async (req, res) => {

        const session = new TwitterSession(config.platforms.twitter, req.body)

        if (session.userId) {
            await global.converse.exec(session.text, session.userId, {
                async output(str) {
                    await session.send(str)
                },
                data: {
                    session
                }
            })
        }

        res.status(204).end()
    })
}