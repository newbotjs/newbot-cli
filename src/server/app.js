
const exphbs = require('express-handlebars')
const express = require('express')
const bodyParser = require('body-parser')
const http = require('http')

module.exports = (app, io, files) => {

    let socket

    io.on('connection', (sock) => {
        socket = sock
    })

    app.use(
        bodyParser.json({
            verify(req, res, buf) {
                req.rawBody = buf.toString()
            }
        })
    )

    app.use((req, res, next) => {
        var oldSend = res.send;
        res.send = function(...args) {
            if (socket) {
                socket.emit('req', {
                    headers: req.headers,
                    url: req.url,
                    method: req.method,
                    body: req.body
                })
            }
            oldSend.apply(res, args)
        }
        next();
    });

    app.engine('.hbs', exphbs({extname: '.hbs'}))

    app.set('view engine', '.hbs')
    app.set('views', __dirname + '/../../src/server/views')

    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get('/remote/skill.js', (req, res, next) => {
        if (!global.code) {
            const err = new Error('Not Found')
            err.code = 404
            return next(err)
        }
        res.send(global.code)
    })

    app.get('/remote/api.js', (req, res, next) => {
        if (!global.codeApi) {
            const err = new Error('Not Found')
            err.code = 404
            return next(err)
        }
        res.send(global.codeApi)
    })

    app.get('/skill.js', (req, res) => {
        res.sendFile(`${files}/.build/browser.js`)
    })

    app.get('/newbot.js', (req, res) => {
        const dir = __dirname.replace('/src/server', '')
        res.sendFile(`${dir}/node_modules/newbot/dist/converse.js`)
    })

    app.use('/static', express.static(__dirname + '/static'))

    app.use((err, req, res, next) => {
        res.status(err.code || 500).end(err.message)
    })
}