"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _messagingApiViber = require("messaging-api-viber");

var _common = _interopRequireDefault(require("./common"));

var _lodash = _interopRequireDefault(require("lodash"));

function _default(config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var url = options.url,
      prod = options.prod;
  return {
    title: "Set WebHook to Telegram platform",
    skip: function skip() {
      var telegram = (0, _common.default)('telegram', config, options);

      if (_lodash.default.isString(telegram)) {
        return telegram;
      }

      if (!telegram.accessToken) {
        return 'Add "platforms.telegram.accessToken" property in "newbot.config.js" file with authentification token';
      }
    },
    task: function task() {
      var ctx = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
      url = ctx.url || url;
      var accessToken = config.platforms.telegram.accessToken;

      var client = _messagingApiViber.TelegramClient.connect(accessToken);

      return client.setWebhook(url + "/".concat(prod ? 'webhook' : 'emulator', "/telegram"));
    }
  };
}