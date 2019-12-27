"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _callee;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _latestVersion = _interopRequireDefault(require("latest-version"));

function _callee() {
  var latestNewbot;
  return _regenerator.default.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return _regenerator.default.awrap((0, _latestVersion.default)('newbot'));

        case 2:
          latestNewbot = _context.sent;
          return _context.abrupt("return", {
            latestNewbot: latestNewbot
          });

        case 4:
        case "end":
          return _context.stop();
      }
    }
  });
}