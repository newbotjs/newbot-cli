"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _path = _interopRequireDefault(require("path"));

var _default = function _default(str) {
  return str.split(_path.default.sep).map(function (str) {
    return /\s+/g.test(str) ? "\"".concat(str, "\"") : str;
  }).join(_path.default.sep);
};

exports.default = _default;