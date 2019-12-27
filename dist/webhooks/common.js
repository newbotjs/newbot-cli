"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

function _default(platform, config, _ref) {
  var url = _ref.url,
      _ref$ngrok = _ref.ngrok,
      ngrok = _ref$ngrok === void 0 ? false : _ref$ngrok,
      _ref$prod = _ref.prod,
      prod = _ref$prod === void 0 ? false : _ref$prod;
  var p;

  if (prod) {
    if (!config.production) {
      return 'Add "production.webhookUrl" in "newbot.config.js" file';
    }

    if (config.production.platforms) {
      p = config.production.platforms[platform];
    }
  } else {
    if (!ngrok) {
      return 'ngrok is disabled';
    }
  }

  if (!p) {
    if (!config.platforms) {
      return 'Add "platforms" property in "newbot.config.js" file';
    }

    p = config.platforms[platform];
  }

  if (!p) {
    return "Add \"platforms.".concat(platform, "\" property in \"newbot.config.js\" file");
  }

  return p;
}