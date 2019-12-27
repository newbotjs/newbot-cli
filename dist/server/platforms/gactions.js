'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _actionsOnGoogle = require('actions-on-google');

var gactions = _interopRequireWildcard(_actionsOnGoogle);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _gactions = require('newbot-formats/session/gactions');

var _gactions2 = _interopRequireDefault(_gactions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

exports.default = function (app, config) {

    var propClientId = 'platforms.gactions.signin.clientId';
    var clientId = _lodash2.default.get(config, propClientId);

    var action = gactions.actionssdk({
        clientId: clientId
    });

    var handle = function handle(conv, input) {
        var _ref = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {},
            _ref$type = _ref.type,
            type = _ref$type === undefined ? 'exec' : _ref$type,
            signin = _ref.signin,
            userData = _ref.userData;

        var session = new _gactions2.default(gactions, conv);
        var userId = session.userId();
        var options = {
            output: function output(str, next) {
                session.send(str);
                next();
            },

            data: {
                session: session
            }
        };

        if (type == 'exec') {
            return global.converse.exec(input, userId, options);
        }

        return global.converse.event(input, {
            profile: userData,
            signin: signin
        }, userId, options);
    };

    var handleOption = function handleOption(conv, params, option) {
        return handle(conv, option);
    };

    var handleSignin = function handleSignin(conv, params, signin) {
        var propName = 'platforms.gactions.signin.event';
        var eventName = _lodash2.default.get(config, propName);
        if (!eventName) {
            throw '[Gactions] Please, add event name in "' + propName + '" property in "newbot.config.js"';
        }
        if (!clientId) {
            throw '[Gactions] Please, add client Id "' + propClientId + '" property in "newbot.config.js"';
        }
        return handle(conv, eventName, {
            type: 'event',
            signin: signin,
            userData: conv.user.profile.payload
        });
    };

    action.intent('actions.intent.MAIN', handle);
    action.intent('actions.intent.TEXT', handle);
    action.intent('actions.intent.OPTION', handleOption);
    action.intent('actions.intent.SIGN_IN', handleSignin);

    app.post('/emulator/gactions', action);
};