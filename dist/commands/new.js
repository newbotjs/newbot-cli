"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _linkCli = _interopRequireDefault(require("../utils/link-cli"));

var _ncp = require("ncp");

var _fs = _interopRequireDefault(require("fs"));

var _execa = _interopRequireDefault(require("execa"));

var _listr = _interopRequireDefault(require("listr"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _handlebars = _interopRequireDefault(require("handlebars"));

var _train = _interopRequireDefault(require("./train"));

var _jsBeautify = _interopRequireDefault(require("js-beautify"));

var beautify = _jsBeautify.default.js;

var _default =
/*#__PURE__*/
function () {
  var _ref2 = (0, _asyncToGenerator2.default)(
  /*#__PURE__*/
  _regenerator.default.mark(function _callee(_ref) {
    var name, directory, pathProject, _ref3, mode, feactures, ret, _ref4, nlp, tasks;

    return _regenerator.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            name = _ref.name;
            directory = process.cwd();
            pathProject = "".concat(directory, "/").concat(name);
            _context.next = 5;
            return _inquirer.default.prompt([{
              type: 'list',
              name: 'mode',
              message: 'What do you want to integrate into your project?',
              choices: [{
                value: 'basic',
                name: 'Only the basic files'
              }, {
                value: 'complex',
                name: 'Complete Structure (production server, pre-integrated modules, webviews, i18n)'
              }, {
                value: 'custom',
                name: 'Choose the features yourself'
              }]
            }]);

          case 5:
            _ref3 = _context.sent;
            mode = _ref3.mode;
            feactures = [];

            if (!(mode == 'custom')) {
              _context.next = 21;
              break;
            }

            _context.next = 11;
            return _inquirer.default.prompt([{
              type: 'checkbox',
              name: 'feactures',
              message: 'What do you want to integrate into your project?',
              choices: [{
                value: 'server',
                name: 'Server for production (not useful if you use NewBot Cloud)'
              }, {
                value: 'webviews',
                name: 'Webviews directory'
              }, {
                value: 'i18n',
                name: 'Internationalization'
              }]
            }]);

          case 11:
            ret = _context.sent;
            feactures = ret.feactures;

            if (!feactures.includes('nlp')) {
              _context.next = 19;
              break;
            }

            _context.next = 16;
            return _inquirer.default.prompt([{
              type: 'list',
              name: 'nlp',
              message: 'What is your NLP engine ?',
              choices: [{
                value: 'dialogflow',
                name: 'DialogFlow'
              }]
            }]);

          case 16:
            _ref4 = _context.sent;
            nlp = _ref4.nlp;
            feactures.push(nlp);

          case 19:
            _context.next = 22;
            break;

          case 21:
            if (mode == 'complex') {
              feactures = ['webviews', 'server', 'i18n'];
            }

          case 22:
            tasks = new _listr.default([{
              title: 'Create project',
              task: function task(ctx) {
                ctx.packages = ['newbot', 'newbot-formats'];
                return new _listr.default([{
                  title: 'Create Folder',
                  task: function task() {
                    try {
                      _fs.default.mkdirSync(pathProject);
                    } catch (err) {
                      if (err.code != 'EEXIST') console.log(err);
                    }
                  }
                }, {
                  title: 'Copy and paste templates',
                  task: function task(ctx) {
                    return new Promise(function (resolve, reject) {
                      /*ncp(`${__dirname}/../../templates/init`, pathProject, (err) => {
                          if (err) {
                              return reject(err)
                          }
                          resolve()
                      })*/
                      var obj = {};
                      var _iteratorNormalCompletion = true;
                      var _didIteratorError = false;
                      var _iteratorError = undefined;

                      try {
                        for (var _iterator = feactures[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                          var feacture = _step.value;
                          obj[feacture] = true;
                        }
                      } catch (err) {
                        _didIteratorError = true;
                        _iteratorError = err;
                      } finally {
                        try {
                          if (!_iteratorNormalCompletion && _iterator.return != null) {
                            _iterator.return();
                          }
                        } finally {
                          if (_didIteratorError) {
                            throw _iteratorError;
                          }
                        }
                      }

                      var pathTpl = "".concat(__dirname, "/../../templates/init");

                      var copy = function copy(filePath) {
                        var tpl = _fs.default.readFileSync("".concat(pathTpl, "/").concat(filePath), 'utf-8');

                        var tplCompiled = _handlebars.default.compile(tpl);

                        tpl = tplCompiled(obj);

                        if (filePath.endsWith('js')) {
                          tpl = beautify(tpl);
                        }

                        _fs.default.writeFileSync("".concat(pathProject, "/").concat(filePath), tpl);
                      };

                      var mkdir = function mkdir(path) {
                        return _fs.default.mkdirSync("".concat(pathProject, "/").concat(path));
                      };

                      mkdir('bot');
                      mkdir('bot/skills');
                      copy('bot/main.js');
                      copy('bot/main.spec.js');
                      copy('bot/main.converse');
                      copy('package.json'); //copy('.gitignore')

                      copy('index.js');
                      copy('emulator.bot');
                      copy('newbot.config.js');

                      if (mode == 'complex') {
                        mkdir('bot/functions');
                      }

                      if (obj.server) {
                        mkdir('server');
                        copy('server/app.js');
                        copy('server/routes.js');
                        ctx.packages = ctx.packages.concat(['express', 'newbot-express']);
                      }

                      if (obj.i18n) {
                        mkdir('bot/languages');
                        copy('bot/languages/en_EN.json');
                        copy('bot/languages/fr_FR.json');
                        copy('bot/languages/index.js');
                      }

                      if (obj.webviews) {
                        mkdir('webviews');
                        copy('webviews/test.html');
                      }

                      mkdir('bot/skills/hello');
                      copy('bot/skills/hello/hello.converse');
                      copy('bot/skills/hello/hello.js');
                      copy('bot/skills/hello/hello.spec.js');
                      resolve();
                    });
                  }
                }], {
                  concurrent: true
                });
              }
            }, {
              title: 'Install package dependencies with npm',
              task: function task(ctx) {
                return _execa.default.shell("cd ".concat((0, _linkCli.default)(pathProject), " && npm install ").concat(ctx.packages.join(' ')));
              }
            }, {
              title: 'Create NLP Model',
              task: function task() {
                return (0, _train.default)({
                  onlyTasks: true,
                  path: pathProject
                });
              }
            }]);
            _context.next = 25;
            return tasks.run();

          case 25:
            console.log('your project has been generated. Type "newbot serve" to test in an emulator'.green);

          case 26:
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