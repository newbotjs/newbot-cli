"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _listr = _interopRequireDefault(require("listr"));

var _getConfigFile = _interopRequireDefault(require("../core/get-config-file"));

var _viber = _interopRequireDefault(require("../webhooks/viber"));

var _telegram = _interopRequireDefault(require("../webhooks/telegram"));

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var config, tasks;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          config = (0, _getConfigFile.default)();
          tasks = new _listr.default([{
            title: 'Get Wehbook URL',
            task: function task(ctx) {
              if (!config.production) {
                return Promise.reject(new Error('Add "production" property in "newbot.config.js" file'));
              }

              if (!config.production.webhookUrl) {
                return Promise.reject(new Error('Add "production.webhookUrl" property in "newbot.config.js" file'.red));
              }

              ctx.url = config.production.webhookUrl;
            }
          }, (0, _viber.default)(config, {
            prod: true
          }), (0, _telegram.default)(config, {
            prod: true
          })]);
          _context.next = 4;
          return tasks.run();

        case 4:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

exports.default = _default;