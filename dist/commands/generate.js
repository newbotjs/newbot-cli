"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _lodash = _interopRequireDefault(require("lodash"));

var _fs = _interopRequireDefault(require("fs"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _callee = function _callee(_ref) {
  var name, type, directory, pathSkills, tasks;
  return _regenerator.default.async(function _callee$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          name = _ref.name, type = _ref.type;
          directory = process.cwd();
          pathSkills = "".concat(directory, "/bot/skills/").concat(name);
          tasks = new _listr.default([{
            title: 'Create Skill',
            task: function task() {
              return new _listr.default([{
                title: 'Create Folder in ~/bot/skills/',
                task: function task() {
                  return _regenerator.default.async(function task$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          try {
                            _fs.default.mkdirSync(pathSkills);
                          } catch (err) {
                            if (err.code != 'EEXIST') console.log(err);
                          }

                        case 1:
                        case "end":
                          return _context.stop();
                      }
                    }
                  });
                }
              }, {
                title: 'Copy and paste templates',
                task: function task() {
                  var pathTpl, copy;
                  return _regenerator.default.async(function task$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          pathTpl = "".concat(__dirname, "/../../templates/skill");

                          copy = function copy(ext) {
                            var tpl = _fs.default.readFileSync("".concat(pathTpl, "/skill.").concat(ext), 'utf-8');

                            var tplCompiled = _handlebars.default.compile(tpl);

                            var sentence = name.split('-').map(function (n) {
                              return _lodash.default.upperFirst(n);
                            }).join(' ');
                            tpl = tplCompiled({
                              name: name,
                              camelCase: _lodash.default.camelCase(name),
                              sentence: sentence
                            });

                            _fs.default.writeFileSync("".concat(pathSkills, "/").concat(name, ".").concat(ext), tpl);
                          };

                          copy('js');
                          copy('converse');
                          copy('spec.js');

                        case 5:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  });
                }
              }]);
            }
          }]);
          _context3.next = 6;
          return _regenerator.default.awrap(tasks.run());

        case 6:
          console.log("Your skill has been generated.".green);
          console.log("You can test with \"newbot emulator --skill ".concat(name, "\" command and enter \"test\" in the chatbot"));
          console.log('Remember to connect the skill to a parent skill (main.js for example)');

        case 9:
        case "end":
          return _context3.stop();
      }
    }
  });
};

exports.default = _callee;