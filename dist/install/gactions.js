"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var os = require('os');

var path = require('path');

var fs = require('fs');

var rp = require('request-promise');

var rootFiles = 'https://dl.google.com/gactions/updates/bin';
var files = {
  'win32': {
    'x64': rootFiles + '/windows/amd64/gactions.exe/gactions.exe'
  },
  'linux': {
    'x64': rootFiles + '/linux/amd64/gactions/gactions'
  }
};
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var platform, arch, res, buffer, filename;
  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          platform = os.platform();
          arch = os.arch();
          console.log('Downloading gactions CLI');

          if (!(!files[platform] && !files[platform][arch])) {
            _context.next = 6;
            break;
          }

          console.log('gactions CLI is not downloaded because your platform/arch is not recognized');
          return _context.abrupt("return");

        case 6:
          _context.next = 8;
          return rp.get({
            url: files[platform][arch],
            encoding: null
          });

        case 8:
          res = _context.sent;
          buffer = Buffer.from(res, 'utf8');
          console.log('gactions CLI downloaded');
          filename = 'gactions' + (platform == 'win32' ? '.exe' : '');
          fs.writeFileSync(path.resolve(__dirname, '../bin/' + filename), buffer);

        case 13:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}))();