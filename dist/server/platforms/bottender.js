'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bottender = require('bottender');

var _express = require('bottender/express');

var _bottender2 = require('newbot-formats/session/bottender');

var _bottender3 = _interopRequireDefault(_bottender2);

var _prettyError = require('pretty-error');

var _prettyError2 = _interopRequireDefault(_prettyError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, config) {

    var pe = new _prettyError2.default();

    var event = function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(context) {
            var _context$event, text, isText, session;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context$event = context.event, text = _context$event.text, isText = _context$event.isText;

                            if (isText) {
                                _context.next = 3;
                                break;
                            }

                            return _context.abrupt('return');

                        case 3:
                            session = new _bottender3.default(context);
                            _context.next = 6;
                            return global.converse.exec(text, context.session.user.id, {
                                output: function output(str, next) {
                                    session.send(str);
                                    next();
                                },

                                data: {
                                    session: session
                                }
                            });

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, undefined);
        }));

        return function event(_x) {
            return _ref.apply(this, arguments);
        };
    }();

    var error = function error(context, err) {
        console.log(pe.render(err));
    };

    var handler = new _bottender.MessengerHandler().onEvent(event).onError(error);

    if (config.platforms.messenger) {
        var messengerBot = new _bottender.MessengerBot(config.platforms.messenger).onEvent(handler);
        (0, _express.registerRoutes)(app, messengerBot, {
            path: '/emulator/messenger',
            verifyToken: config.platforms.messenger.verifyToken
        });
    }
    if (config.platforms.viber) {
        var viberBot = new _bottender.ViberBot(config.platforms.viber).onEvent(handler);
        (0, _express.registerRoutes)(app, viberBot, {
            path: '/emulator/viber'
        });
    }

    if (config.platforms.telegram) {
        var telegramBot = new _bottender.TelegramBot(config.platforms.telegram).onEvent(handler);
        (0, _express.registerRoutes)(app, telegramBot, {
            path: '/emulator/telegram'
        });
    }

    if (config.platforms.line) {
        var lineBot = new _bottender.LineBot(config.platforms.line).onEvent(handler);
        (0, _express.registerRoutes)(app, lineBot, {
            path: '/emulator/line'
        });
    }

    if (config.platforms.slack) {
        var slackBot = new _bottender.SlackBot(config.platforms.slack).onEvent(handler);
        (0, _express.registerRoutes)(app, slackBot, {
            path: '/emulator/slack'
        });
    }
};