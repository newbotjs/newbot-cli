
const express = require('express')
const bodyParser = require('body-parser')

module.exports = (app, socket, files) => {

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

    app.get('/logs', (req, res, next) => {
        res.json(global.logs)
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

  /*  app.get('/', (req, res, next) => {
        res.sendFile(__dirname + '/public/index.html')
    })*/
    const _static = (__dirname + '/public').replace('dist', 'src')
    app.use(express.static(_static))

    app.use((err, req, res, next) => {
        res.status(err.code || 500).end(err.message)
    })
}