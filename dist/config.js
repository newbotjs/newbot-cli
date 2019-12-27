"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var env = process.env.NODE_ENV;
var _default = {
  urlCloud: !env ? 'https://app.newbot.io' : 'http://localhost:8080'
};
exports.default = _default;