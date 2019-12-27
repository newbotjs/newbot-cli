'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _twitter = require('newbot-formats/session/twitter');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

exports.default = function (app, config) {
    app.get('/emulator/twitter', function (req, res) {
        try {
            res.status(200).send((0, _twitter.CRCToken)(config.platforms.twitter, req.query));
        } catch (err) {
            res.status(400).send(err.message);
        }
    });

    app.post('/emulator/twitter', function () {
        var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(req, res) {
            var session;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            session = new _twitter.TwitterSession(config.platforms.twitter, req.body);

                            if (!session.userId) {
                                _context2.next = 4;
                                break;
                            }

                            _context2.next = 4;
                            return global.converse.exec(session.text, session.userId, {
                                output: function () {
                                    var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(str) {
                                        return _regenerator2.default.wrap(function _callee$(_context) {
                                            while (1) {
                                                switch (_context.prev = _context.next) {
                                                    case 0:
                                                        _context.next = 2;
                                                        return session.send(str);

                                                    case 2:
                                                    case 'end':
                                                        return _context.stop();
                                                }
                                            }
                                        }, _callee, this);
                                    }));

                                    function output(_x3) {
                                        return _ref2.apply(this, arguments);
                                    }

                                    return output;
                                }(),

                                data: {
                                    session: session
                                }
                            });

                        case 4:

                            res.status(204).end();

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, undefined);
        }));

        return function (_x, _x2) {
            return _ref.apply(this, arguments);
        };
    }());
};