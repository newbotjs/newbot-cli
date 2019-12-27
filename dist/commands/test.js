"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _mocha = _interopRequireDefault(require("mocha"));

var _glob = require("glob");

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _default = function _default() {
  var _ref = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref$timeout = _ref.timeout,
      timeout = _ref$timeout === void 0 ? 5000 : _ref$timeout;

  if (timeout == 0) timeout = false;
  (0, _runSkill.default)();
  var directory = process.cwd();
  var mocha = new _mocha.default({
    timeout: timeout
  });
  var testFiles = (0, _glob.sync)("".concat(directory, "/bot/**/*.spec.js"), {
    ignore: '**/node_modules/**'
  });
  testFiles.forEach(function (file) {
    return mocha.addFile(file);
  });
  mocha.run(function (failures) {
    return process.on('exit', function () {
      return process.exit(failures);
    });
  });
};

exports.default = _default;