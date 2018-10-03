import crypto from 'crypto'
import rp from 'request-promise'

export default (app, config) => {

    const {
        consumerKey,
        consumerSecret,
        accessToken,
        accessTokenSecret
    } = config.platforms.twitter

    const oauth = {
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
        token: accessToken,
        token_secret: accessTokenSecret
    }

    function get_challenge_response(crc_token) {

        const hmac = crypto.createHmac('sha256', consumerSecret).update(crc_token).digest('base64')

        return hmac
    }

    app.get('/emulator/twitter', function (request, response) {

        var crc_token = request.query.crc_token

        // console.log(request.query)

        if (crc_token) {
            var hash = get_challenge_response(crc_token)

            response.status(200);
            response.send({
                response_token: 'sha256=' + hash
            })
        } else {
            response.status(400);
            response.send('Error: crc_token missing from request.')
        }
    })


    app.post('/emulator/twitter', async (req, res) => {

        console.log(JSON.stringify(req.body, null, 2))

        const sendMessage = (recipientId, text) => {
            return rp.post({
                url: 'https://api.twitter.com/1.1/direct_messages/events/new.json',
                oauth,
                headers: {
                    'content-type': 'application/json'
                },
                json: true,
                body: {
                    event: {
                        type: 'message_create',
                        message_create: {
                            target: {
                                recipient_id: recipientId
                            },
                            message_data: {
                                text
                            }
                        }
                    }
                }
            })
        }

        const {
            body
        } = req
        const {
            direct_message_events: dms
        } = body
        for (let dm of dms) {
            const {
                message_create: message
            } = dm
            const {
                target,
                message_data: messageData,
                sender_id: userId 
            } = message
            await global.converse.exec(messageData.text, target.recipient_id, {
                async output(str, next) {
                    await sendMessage(target.recipient_id, str)
                    next()
                },
                data: {
                    session: {
                        source: 'twitter',
                        agent: 'twitter'
                    }
                }
            })
            
        }

        res.status(204).end()

    })
}