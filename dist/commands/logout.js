"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _fs = _interopRequireDefault(require("fs"));

var _colors = _interopRequireDefault(require("colors"));

var _default = function _default() {
  var env = process.env.NODE_ENV;
  return new Promise(function _callee(resolve, reject) {
    var cloudFile;
    return _regenerator.default.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            cloudFile = __dirname + '/../../.newbot-cloud' + (env ? '-' + env : '');

            try {
              _fs.default.unlinkSync(cloudFile, 'utf-8');

              console.log('[NewBot Cloud] You are disconnected'.green);
              resolve();
            } catch (err) {
              if (err.code == 'ENOENT') {
                console.log('Can not log out because you are not logged in'.red);
              } else {
                console.log(err.message.red);
              }

              reject(err);
            }

          case 2:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

exports.default = _default;