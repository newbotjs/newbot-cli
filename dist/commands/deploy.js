"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _fs = _interopRequireDefault(require("fs"));

var _archiver = _interopRequireDefault(require("archiver"));

var _newbot = require("newbot");

var _listr = _interopRequireDefault(require("listr"));

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _config = _interopRequireDefault(require("../config"));

var _cloud = _interopRequireDefault(require("../core/cloud"));

var _log = _interopRequireDefault(require("../core/log"));

var _webpack = _interopRequireDefault(require("../build/webpack"));

var _callee = function _callee(_ref) {
  var _ref$entry, entry, directory, _ref2, userToken, configCloud, mainSkill, zipFile, tasks;

  return _regenerator.default.async(function _callee$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          _ref$entry = _ref.entry, entry = _ref$entry === void 0 ? 'main.js' : _ref$entry;
          directory = process.cwd();
          _context4.prev = 2;
          _context4.next = 5;
          return _regenerator.default.awrap((0, _cloud.default)());

        case 5:
          _ref2 = _context4.sent;
          userToken = _ref2.userToken;
          configCloud = _ref2.configCloud;
          mainSkill = "".concat(directory, "/bot/main.js");
          zipFile = __dirname + '/../../tmp/bot.zip';
          tasks = new _listr.default([{
            title: 'Build',
            task: function task() {
              return _regenerator.default.async(function task$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      return _context.abrupt("return", (0, _webpack.default)({
                        type: 'node',
                        dir: 'dist/node',
                        file: 'bot.js',
                        entry: entry
                      }));

                    case 1:
                    case "end":
                      return _context.stop();
                  }
                }
              });
            }
          }, {
            title: 'Packaging',
            task: function task() {
              return new Promise(function (resolve, reject) {
                var output = _fs.default.createWriteStream(zipFile);

                var archive = (0, _archiver.default)('zip', {
                  zlib: {
                    level: 9
                  }
                });
                output.on('close', function () {
                  resolve();
                });
                archive.on('warning', reject);
                archive.on('error', reject); //archive.directory(`${directory}/.build`, '.build')

                archive.glob('**/*', {
                  cwd: directory,
                  ignore: ['node_modules/**/*', 'node_modules', 'package-lock.json', '.logs', '.logs/*']
                }, {});
                archive.pipe(output);
                archive.finalize();
              });
            }
          }, {
            title: 'Sync intents',
            skip: function skip(ctx) {
              var skill, converse;
              return _regenerator.default.async(function skip$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      _context2.next = 2;
                      return _regenerator.default.awrap((0, _runSkill.default)(mainSkill));

                    case 2:
                      skill = _context2.sent;
                      converse = new _newbot.Converse();
                      _context2.next = 6;
                      return _regenerator.default.awrap(converse.loadOptions(skill.default));

                    case 6:
                      _context2.next = 8;
                      return _regenerator.default.awrap(converse.getAllIntents());

                    case 8:
                      ctx.intents = _context2.sent;

                      if (!(ctx.intents.length == 0)) {
                        _context2.next = 11;
                        break;
                      }

                      return _context2.abrupt("return", 'No intentions found');

                    case 11:
                    case "end":
                      return _context2.stop();
                  }
                }
              });
            },
            task: function task(ctx) {
              var intents, intentsObj, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, intent, _intent$params, intentName, utterances;

              return _regenerator.default.async(function task$(_context3) {
                while (1) {
                  switch (_context3.prev = _context3.next) {
                    case 0:
                      intents = ctx.intents;
                      intentsObj = {};
                      _iteratorNormalCompletion = true;
                      _didIteratorError = false;
                      _iteratorError = undefined;
                      _context3.prev = 5;
                      _iterator = intents[Symbol.iterator]();

                    case 7:
                      if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                        _context3.next = 17;
                        break;
                      }

                      intent = _step.value;
                      _intent$params = (0, _slicedToArray2.default)(intent.params, 2), intentName = _intent$params[0], utterances = _intent$params[1];

                      if (utterances) {
                        _context3.next = 12;
                        break;
                      }

                      return _context3.abrupt("continue", 14);

                    case 12:
                      if (!intentsObj[intentName]) intentsObj[intentName] = [];
                      intentsObj[intentName] = intentsObj[intentName].concat(utterances);

                    case 14:
                      _iteratorNormalCompletion = true;
                      _context3.next = 7;
                      break;

                    case 17:
                      _context3.next = 23;
                      break;

                    case 19:
                      _context3.prev = 19;
                      _context3.t0 = _context3["catch"](5);
                      _didIteratorError = true;
                      _iteratorError = _context3.t0;

                    case 23:
                      _context3.prev = 23;
                      _context3.prev = 24;

                      if (!_iteratorNormalCompletion && _iterator.return != null) {
                        _iterator.return();
                      }

                    case 26:
                      _context3.prev = 26;

                      if (!_didIteratorError) {
                        _context3.next = 29;
                        break;
                      }

                      throw _iteratorError;

                    case 29:
                      return _context3.finish(26);

                    case 30:
                      return _context3.finish(23);

                    case 31:
                      _context3.next = 33;
                      return _regenerator.default.awrap((0, _requestPromise.default)({
                        url: "".concat(_config.default.urlCloud, "/api/bots/").concat(configCloud.botId, "/deployIntents"),
                        method: 'POST',
                        body: {
                          intents: intentsObj
                        },
                        json: true,
                        headers: {
                          'x-access-token': userToken
                        }
                      }));

                    case 33:
                    case "end":
                      return _context3.stop();
                  }
                }
              }, null, null, [[5, 19, 23, 31], [24,, 26, 30]]);
            }
          }, {
            title: 'Deploy on NewBot Cloud',
            task: function task() {
              return (0, _requestPromise.default)({
                url: "".concat(_config.default.urlCloud, "/api/bots/").concat(configCloud.botId, "/deploy"),
                method: 'POST',
                formData: {
                  archive: _fs.default.createReadStream(zipFile)
                },
                json: true,
                headers: {
                  'x-access-token': userToken
                }
              }).catch(function (err) {
                _log.default.log('error', err.message);

                if (err.statusCode == 403) {
                  switch (err.error.message) {
                    case 'ROLE_NOT_AUTHORIZED':
                      throw 'Your role does not allow you to create deploy code. Please contact the chatbot owner for permission';

                    default:
                      throw 'You do not have permission to deploy code';
                  }
                }

                throw err.message;
              });
            }
          }]);
          _context4.next = 13;
          return _regenerator.default.awrap(tasks.run());

        case 13:
          console.log('[NewBot Cloud] The chatbot has been successfully deployed'.green);
          _context4.next = 19;
          break;

        case 16:
          _context4.prev = 16;
          _context4.t0 = _context4["catch"](2);
          console.log(_context4.t0);

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[2, 16]]);
};

exports.default = _callee;