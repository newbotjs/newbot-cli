"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = _default;

var _newbot = require("newbot");

function _default() {
  var currentPath = process.cwd();

  try {
    var pathNewBot = require.resolve('newbot', {
      paths: [currentPath]
    });

    var _require = require(pathNewBot),
        Converse = _require.Converse;

    return Converse;
  } catch (err) {
    return _newbot.NewBot;
  }
}