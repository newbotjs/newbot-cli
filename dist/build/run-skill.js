"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var path = require('path');

var _ = require('lodash');

var isPromise = require('../utils/is-promise');

var ifDoesntMatch = function ifDoesntMatch(test) {
  return function (input) {
    var pattern = /node_modules\/newbot-[^\/]+\/(?!(node_modules))/g;
    if (pattern.test(input)) return false;
    if (input.includes('node_modules')) return true;
    return false;
  };
};

var resolvePath = function resolvePath(p) {
  return require.resolve(p);
};

var _default =
/*#__PURE__*/
function () {
  var _ref = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(skill) {
    var ret, retFunc;
    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            require("@babel/register")({
              presets: [[resolvePath('@babel/preset-env'), {
                "targets": {
                  "node": "current"
                }
              }], [resolvePath('@babel/preset-typescript')]],
              ignore: [ifDoesntMatch()],
              plugins: [[resolvePath("babel-plugin-inline-import"), {
                "extensions": [".converse"]
              }]],
              extensions: ['.js', '.ts'],
              cache: false
            });

            if (!skill) {
              _context.next = 11;
              break;
            }

            ret = require(skill);

            if (!_.isFunction(ret.default)) {
              _context.next = 10;
              break;
            }

            retFunc = ret.default();

            if (!isPromise(retFunc)) {
              _context.next = 9;
              break;
            }

            _context.next = 8;
            return retFunc;

          case 8:
            retFunc = _context.sent;

          case 9:
            return _context.abrupt("return", {
              default: retFunc
            });

          case 10:
            return _context.abrupt("return", ret);

          case 11:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.default = _default;