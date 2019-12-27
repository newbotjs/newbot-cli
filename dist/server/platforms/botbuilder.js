'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _botbuilder = require('botbuilder');

exports.default = function (app) {
    var connector = new _botbuilder.ChatConnector();
    var bot = new _botbuilder.UniversalBot(connector, function (session) {
        var _session$message = session.message,
            text = _session$message.text,
            user = _session$message.user;

        global.converse.exec(text, user.id, {
            output: function output(msg, next) {
                session.send(msg);
                next();
            },

            data: {
                session: session
            }
        }).catch(function (err) {
            return console.log(err);
        });
    });
    app.post('/emulator', connector.listen());
};