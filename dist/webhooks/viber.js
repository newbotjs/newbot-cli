"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _common = _interopRequireDefault(require("./common"));

var _lodash = _interopRequireDefault(require("lodash"));

var _messagingApiViber = require("messaging-api-viber");

function _default(config) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  var prod = options.prod;
  return {
    title: "Set WebHook to Viber platform",
    skip: function skip() {
      var viber = (0, _common.default)('viber', config, options);

      if (_lodash.default.isString(viber)) {
        return viber;
      }

      if (!viber.accessToken) {
        return 'Add "platforms.viber.accessToken" property in "newbot.config.js" file with authentification token';
      }
    },
    task: function task(ctx) {
      var url = ctx.url;
      var accessToken = config.platforms.viber.accessToken;

      var client = _messagingApiViber.ViberClient.connect(accessToken);

      return client.setWebhook(url + "/".concat(prod ? 'webhook' : 'emulator', "/viber"));
    }
  };
}