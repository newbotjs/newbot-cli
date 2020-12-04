"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _listr = _interopRequireDefault(require("listr"));

var _fs = _interopRequireDefault(require("fs"));

var _webpack = _interopRequireDefault(require("../build/webpack"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _train = _interopRequireDefault(require("./train"));

var _ncp = require("ncp");

var _default =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(_ref) {
    var _ref$entry, entry, _ref$node, node, path, dist, tasks;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _ref$entry = _ref.entry, entry = _ref$entry === void 0 ? 'main.js' : _ref$entry, _ref$node = _ref.node, node = _ref$node === void 0 ? false : _ref$node, path = _ref.path;
            path = path || process.cwd();
            dist = "".concat(path, "/dist");
            tasks = new _listr.default([{
              title: 'Train Bot',
              task: function task() {
                return (0, _train.default)({
                  onlyTasks: true,
                  path: path
                });
              }
            }, {
              title: 'Build your chatbot for NodeJS',
              task: function task() {
                return (0, _webpack.default)({
                  type: 'node',
                  dir: 'dist/node',
                  file: 'bot.js',
                  entry: entry,
                  path: path
                });
              }
            }, {
              title: 'Build your chatbot for browser',
              skip: function skip() {
                return node;
              },
              task: function task() {
                return new _listr.default([{
                  title: 'Build source',
                  task: function task() {
                    return new _listr.default([{
                      title: 'Gloval var',
                      task: function task() {
                        return (0, _webpack.default)({
                          type: 'browser',
                          dir: 'dist/browser',
                          file: 'skill.js',
                          var: 'MainSkill',
                          entry: entry,
                          path: path
                        });
                      }
                    }, {
                      title: 'CommonJS',
                      task: function task() {
                        return (0, _webpack.default)({
                          type: 'cjs',
                          dir: 'dist/browser',
                          file: 'skill.cjs.js',
                          entry: entry,
                          path: path
                        });
                      }
                    }]);
                  }
                }, {
                  title: 'Copy model directory',
                  skip: function skip() {
                    try {
                      _fs.default.statSync("".concat(path, "/bot/model"));
                    } catch (err) {
                      if (err && err.code === 'ENOENT') {
                        return 'Ignore because model directory not exists';
                      }
                    }
                  },
                  task: function task() {
                    return new Promise(function (resolve, reject) {
                      (0, _ncp.ncp)("".concat(path, "/bot/model"), "".concat(dist, "/browser/model"), function (err) {
                        if (err) {
                          return reject(err);
                        }

                        resolve();
                      });
                    });
                  }
                }, {
                  title: 'Create HTML template',
                  task: function task() {
                    var pathTpl = "".concat(__dirname, "/../../templates/browser");

                    var copy = function copy(file) {
                      var tpl = _fs.default.readFileSync("".concat(pathTpl, "/").concat(file), 'utf-8');

                      var tplCompiled = _handlebars.default.compile(tpl);

                      tpl = tplCompiled();

                      _fs.default.writeFileSync("".concat(dist, "/browser/").concat(file), tpl);
                    };

                    copy('index.html');
                  }
                }]);
              }
            }]);
            _context.next = 6;
            return tasks.run();

          case 6:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function (_x) {
    return _ref2.apply(this, arguments);
  };
}();

exports.default = _default;