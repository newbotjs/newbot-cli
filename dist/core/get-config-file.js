"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _fs = _interopRequireDefault(require("fs"));

function _default() {
  var nameFile = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'newbot.config.js';
  var files = process.cwd();
  var config = {};

  try {
    var configFile = "".concat(files, "/").concat(nameFile);

    _fs.default.accessSync(configFile, _fs.default.constants.R_OK | _fs.default.constants.W_OK);

    config = require(configFile);
  } catch (err) {
    if (err.code != 'ENOENT') console.log(err);
  }

  if (!config.platforms) config.platforms = {};
  if (!config.ngrok) config.ngrok = {};
  return config;
}