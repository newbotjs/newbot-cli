"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _newbot = require("newbot");

var _extract = _interopRequireDefault(require("newbot/packages/train/extract"));

var _fs = _interopRequireDefault(require("fs"));

var _listr = _interopRequireDefault(require("listr"));

var _lodash = _interopRequireDefault(require("lodash"));

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _request = require("@nlpjs/request");

var _core = require("@nlpjs/core");

var _nlp = require("@nlpjs/nlp");

var _langAll = _interopRequireDefault(require("@nlpjs/lang-all"));

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee() {
  var _ref2,
      _ref2$onlyTasks,
      onlyTasks,
      path,
      _ref2$entry,
      entry,
      manager,
      directory,
      mainSkill,
      skill,
      container,
      nlp,
      converse,
      extract,
      tasks,
      _args = arguments;

  return _regenerator.default.wrap(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _ref2 = _args.length > 0 && _args[0] !== undefined ? _args[0] : {}, _ref2$onlyTasks = _ref2.onlyTasks, onlyTasks = _ref2$onlyTasks === void 0 ? false : _ref2$onlyTasks, path = _ref2.path, _ref2$entry = _ref2.entry, entry = _ref2$entry === void 0 ? 'main.js' : _ref2$entry;
          directory = path || process.cwd();
          mainSkill = "".concat(directory, "/bot/").concat(entry);
          _context.next = 5;
          return (0, _runSkill.default)(mainSkill);

        case 5:
          skill = _context.sent;
          _context.next = 8;
          return (0, _core.containerBootstrap)();

        case 8:
          container = _context.sent;
          container.use(_nlp.Nlp);
          container.use(_langAll.default);
          nlp = container.get('nlp');
          nlp.container.register('fs', _request.fs);
          nlp.settings.autoSave = false;
          converse = new _newbot.Converse(skill.default);
          extract = new _extract.default(converse, nlp);
          tasks = new _listr.default([{
            title: 'Extract Intents',
            task: function task() {
              return new _listr.default([{
                title: 'Get Intents',
                task: extract.getIntents.bind(extract)
              }, {
                title: 'Translate',
                task: extract.translate.bind(extract)
              }, {
                title: 'Add Document in manager',
                task: function task() {
                  manager = extract.addDocuments();
                }
              }]);
            }
          }, {
            title: 'Train Chatbot',
            task: function task() {
              return manager.train();
            }
          }, {
            title: 'Save Model',
            task: function task() {
              try {
                _fs.default.mkdirSync("".concat(directory, "/bot/model"));
              } catch (err) {
                if (err.code != 'EEXIST') console.log(err);
              }

              return manager.save("".concat(directory, "/bot/model/model.nlp"));
            }
          }]);

          if (!onlyTasks) {
            _context.next = 21;
            break;
          }

          return _context.abrupt("return", tasks);

        case 21:
          _context.next = 23;
          return tasks.run();

        case 23:
        case "end":
          return _context.stop();
      }
    }
  }, _callee);
}));

exports.default = _default;