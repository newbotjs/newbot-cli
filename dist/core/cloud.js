"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _fs = _interopRequireDefault(require("fs"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _login = _interopRequireDefault(require("../commands/login"));

var _config = _interopRequireDefault(require("../config"));

var rollup = require('rollup');

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var env, directory, _ref2, userToken, cloudFile, configCloud, bots, botId, choice, _ref3, botName, newBot;

  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          env = process.env.NODE_ENV;
          directory = process.cwd();
          _context.prev = 2;
          _context.next = 5;
          return (0, _login.default)();

        case 5:
          _ref2 = _context.sent;
          userToken = _ref2.userToken;
          cloudFile = directory + '/.newbot-cloud' + (env ? '-' + env : '');
          _context.prev = 8;
          configCloud = _fs.default.readFileSync(cloudFile, 'utf-8');
          configCloud = JSON.parse(configCloud);
          _context.next = 38;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](8);

          if (!(_context.t0.code == 'ENOENT')) {
            _context.next = 38;
            break;
          }

          _context.next = 18;
          return (0, _requestPromise.default)({
            url: "".concat(_config.default.urlCloud, "/api/bots"),
            json: true,
            headers: {
              'x-access-token': userToken
            }
          });

        case 18:
          bots = _context.sent;

          if (!(bots.length > 0)) {
            _context.next = 26;
            break;
          }

          _context.next = 22;
          return _inquirer.default.prompt([{
            type: 'list',
            name: 'botId',
            message: 'What is the bot?',
            choices: [{
              name: 'Create a chatbot',
              value: 'create'
            }, new _inquirer.default.Separator()].concat((0, _toConsumableArray2.default)(bots.map(function (bot) {
              return {
                name: bot.name,
                value: bot._id
              };
            })))
          }]);

        case 22:
          choice = _context.sent;
          botId = choice.botId;
          _context.next = 27;
          break;

        case 26:
          botId = 'create';

        case 27:
          if (!(botId == 'create')) {
            _context.next = 36;
            break;
          }

          _context.next = 30;
          return _inquirer.default.prompt([{
            type: 'input',
            name: 'botName',
            message: 'What is the name for your new chatbot?'
          }]);

        case 30:
          _ref3 = _context.sent;
          botName = _ref3.botName;
          _context.next = 34;
          return (0, _requestPromise.default)({
            url: "".concat(_config.default.urlCloud, "/api/bots"),
            method: 'POST',
            json: true,
            body: {
              name: botName
            },
            headers: {
              'x-access-token': userToken
            }
          });

        case 34:
          newBot = _context.sent;
          botId = newBot._id;

        case 36:
          configCloud = {
            botId: botId
          };

          _fs.default.writeFileSync(cloudFile, JSON.stringify(configCloud));

        case 38:
          return _context.abrupt("return", {
            userToken: userToken,
            configCloud: configCloud
          });

        case 41:
          _context.prev = 41;
          _context.t1 = _context["catch"](2);

          if (!(_context.t1.statusCode == 403)) {
            _context.next = 50;
            break;
          }

          _context.t2 = _context.t1.error.message;
          _context.next = _context.t2 === 'MAX_BOTS_EXCEEDED' ? 47 : _context.t2 === 'ROLE_NOT_AUTHORIZED' ? 48 : 49;
          break;

        case 47:
          throw 'You have reached the chatbot creation limit. Please upgrade your account on https://app.newbot.io/me/upgrade';

        case 48:
          throw 'Your role does not allow you to create a chatbot';

        case 49:
          throw 'You do not have permission to create a chatbot';

        case 50:
          throw _context.t1.message.red;

        case 51:
        case "end":
          return _context.stop();
      }
    }
  }, _callee, null, [[2, 41], [8, 13]]);
}));

exports.default = _default;