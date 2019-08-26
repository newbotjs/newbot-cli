const express = require('express')
const expressNewBot = require('newbot-express')
const routes = require('./routes')

const app = express()

const expressBot = expressNewBot({
    botPath: __dirname + '/..',
    modelPath: 'model/model.nlp',
    /*botframework: {
        path: '/botframework'
    },
    viber: {
        path: '/viber'
    }*/
}, app)

/*
Example to use the converse instance (https://newbot.io/en/docs/avanced/middleware.html)

expressBot.converse.use({

})
*/

routes(app, expressBot)

app.listen(4000, () => console.log('server is running'))