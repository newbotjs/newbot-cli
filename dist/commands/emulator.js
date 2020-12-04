"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _bottender = require("bottender");

var _lodash = _interopRequireDefault(require("lodash"));

var _prettyError = _interopRequireDefault(require("pretty-error"));

var _jsonColorizer = _interopRequireDefault(require("json-colorizer"));

var _getNewbot = _interopRequireDefault(require("../core/get-newbot"));

var _bottender2 = _interopRequireDefault(require("newbot-formats/session/bottender"));

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _default =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee3(_ref) {
    var source, lang, skill, Converse, files, skillBundle, converse, bot, pe;
    return _regenerator.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            source = _ref.source, lang = _ref.lang, skill = _ref.skill;
            Converse = (0, _getNewbot.default)();
            files = process.cwd();
            _context3.next = 5;
            return (0, _runSkill.default)("".concat(files, "/bot/").concat(skill ? "skills/".concat(skill, "/").concat(skill) : 'main'));

          case 5:
            skillBundle = _context3.sent;
            converse = new Converse(skillBundle.default);
            bot = new _bottender.ConsoleBot({
              fallbackMethods: true
            });
            pe = new _prettyError.default();
            bot.onEvent(
            /*#__PURE__*/
            function () {
              var _ref3 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee2(context) {
                var text, platform, session;
                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        text = context.event.text;
                        platform = 'website';

                        if (_lodash.default.isString(source)) {
                          platform = source;
                        }

                        session = new _bottender2.default(context, platform);
                        _context2.prev = 4;
                        _context2.next = 7;
                        return converse.exec(text, 'emulator', {
                          preUser: function preUser(user) {
                            var currentLang = user.getLang();
                            if (lang && !currentLang) user.setLang(lang);
                          },
                          output: function () {
                            var _output = (0, _asyncToGenerator2.default)(
                            /*#__PURE__*/
                            _regenerator.default.mark(function _callee(str) {
                              return _regenerator.default.wrap(function _callee$(_context) {
                                while (1) {
                                  switch (_context.prev = _context.next) {
                                    case 0:
                                      if (!(platform == 'website')) {
                                        _context.next = 6;
                                        break;
                                      }

                                      if (!_lodash.default.isString(str)) {
                                        str = (0, _jsonColorizer.default)(JSON.stringify(str, null, 2));
                                      }

                                      _context.next = 4;
                                      return context.sendText(str);

                                    case 4:
                                      _context.next = 7;
                                      break;

                                    case 6:
                                      session.send(str);

                                    case 7:
                                    case "end":
                                      return _context.stop();
                                  }
                                }
                              }, _callee);
                            }));

                            function output(_x3) {
                              return _output.apply(this, arguments);
                            }

                            return output;
                          }(),
                          data: {
                            session: session
                          }
                        });

                      case 7:
                        _context2.next = 12;
                        break;

                      case 9:
                        _context2.prev = 9;
                        _context2.t0 = _context2["catch"](4);
                        console.log(pe.render(_context2.t0));

                      case 12:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2, null, [[4, 9]]);
              }));

              return function (_x2) {
                return _ref3.apply(this, arguments);
              };
            }());
            bot.createRuntime();

          case 11:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

exports.default = _default;