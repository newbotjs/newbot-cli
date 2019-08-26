const express = require('express')
const bot = require('newbot-express')

const app = express()

bot({
    botPath: __dirname + '/..',
    /*botframework: {
        path: '/botframework'
    },
    viber: {
        path: '/viber'
    }*/
}, app)

app.listen(4000, () => console.log('server is running'))