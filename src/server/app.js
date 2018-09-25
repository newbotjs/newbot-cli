const exphbs = require('express-handlebars')
const express = require('express')
const bodyParser = require('body-parser')

module.exports = (app, files) => {

    app.use(
        bodyParser.json({
            verify(req, res, buf) {
                req.rawBody = buf.toString()
            }
        })
    )

    app.engine('.hbs', exphbs({extname: '.hbs'}))

    app.set('view engine', '.hbs')
    app.set('views', __dirname + '/views')

    app.get('/', (req, res) => {
        res.render('index')
    })

    app.get('/skill.js', (req, res) => {
        res.sendFile(`${files}/.build/browser.js`)
    })

    app.get('/newbot.js', (req, res) => {
        const dir = __dirname.replace('/src/server', '')
        res.sendFile(`${dir}/node_modules/newbot/dist/converse.js`)
    })

    app.use('/static', express.static(__dirname + '/static'))
}