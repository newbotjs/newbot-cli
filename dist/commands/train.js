"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _slicedToArray2 = _interopRequireDefault(require("@babel/runtime/helpers/slicedToArray"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _newbot = require("newbot");

var _fs = _interopRequireDefault(require("fs"));

var _listr = _interopRequireDefault(require("listr"));

var _lodash = _interopRequireDefault(require("lodash"));

var _nodeNlp = require("node-nlp");

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee2() {
  var _ref2,
      _ref2$onlyTasks,
      onlyTasks,
      path,
      _ref2$entry,
      entry,
      manager,
      cache,
      cacheLang,
      converse,
      directory,
      mainSkill,
      skill,
      languages,
      tasks,
      _args2 = arguments;

  return _regenerator.default.wrap(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          _ref2 = _args2.length > 0 && _args2[0] !== undefined ? _args2[0] : {}, _ref2$onlyTasks = _ref2.onlyTasks, onlyTasks = _ref2$onlyTasks === void 0 ? false : _ref2$onlyTasks, path = _ref2.path, _ref2$entry = _ref2.entry, entry = _ref2$entry === void 0 ? 'main.js' : _ref2$entry;
          cache = [];
          cacheLang = {};
          converse = new _newbot.Converse();
          directory = path || process.cwd();
          mainSkill = "".concat(directory, "/bot/").concat(entry);
          _context2.next = 8;
          return (0, _runSkill.default)(mainSkill);

        case 8:
          skill = _context2.sent;
          languages = [];
          tasks = new _listr.default([{
            title: 'Extract Intents',
            task: function task() {
              return new _listr.default([{
                title: 'Get Intents',
                task: function () {
                  var _task = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee() {
                    var intents, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, intent, langs, _intent$params, intentName, utterances, lang, _iteratorNormalCompletion2, _didIteratorError2, _iteratorError2, _iterator2, _step2, utterance;

                    return _regenerator.default.wrap(function _callee$(_context) {
                      while (1) {
                        switch (_context.prev = _context.next) {
                          case 0:
                            _context.next = 2;
                            return converse.loadOptions(skill.default);

                          case 2:
                            _context.next = 4;
                            return converse.getAllIntents();

                          case 4:
                            intents = _context.sent;
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context.prev = 8;
                            _iterator = intents[Symbol.iterator]();

                          case 10:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                              _context.next = 46;
                              break;
                            }

                            intent = _step.value;
                            langs = _lodash.default.get(intent, '_skill.lang._list');

                            if (langs) {
                              languages = [].concat((0, _toConsumableArray2.default)(languages), (0, _toConsumableArray2.default)(langs.map(function (lang) {
                                return lang.split('_')[0];
                              })));
                              languages = _lodash.default.uniq(languages);
                            }

                            _intent$params = (0, _slicedToArray2.default)(intent.params, 2), intentName = _intent$params[0], utterances = _intent$params[1];

                            if (_lodash.default.isArray(utterances)) {
                              utterances = {
                                en: utterances
                              };
                            }

                            _context.t0 = _regenerator.default.keys(utterances);

                          case 17:
                            if ((_context.t1 = _context.t0()).done) {
                              _context.next = 43;
                              break;
                            }

                            lang = _context.t1.value;

                            if (!(lang[0] == '_')) {
                              _context.next = 21;
                              break;
                            }

                            return _context.abrupt("continue", 17);

                          case 21:
                            cacheLang[lang] = true;
                            _iteratorNormalCompletion2 = true;
                            _didIteratorError2 = false;
                            _iteratorError2 = undefined;
                            _context.prev = 25;

                            for (_iterator2 = utterances[lang][Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                              utterance = _step2.value;
                              cache.push({
                                params: [lang, utterance, intentName],
                                converse: intent._skill
                              });
                            }

                            _context.next = 33;
                            break;

                          case 29:
                            _context.prev = 29;
                            _context.t2 = _context["catch"](25);
                            _didIteratorError2 = true;
                            _iteratorError2 = _context.t2;

                          case 33:
                            _context.prev = 33;
                            _context.prev = 34;

                            if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
                              _iterator2.return();
                            }

                          case 36:
                            _context.prev = 36;

                            if (!_didIteratorError2) {
                              _context.next = 39;
                              break;
                            }

                            throw _iteratorError2;

                          case 39:
                            return _context.finish(36);

                          case 40:
                            return _context.finish(33);

                          case 41:
                            _context.next = 17;
                            break;

                          case 43:
                            _iteratorNormalCompletion = true;
                            _context.next = 10;
                            break;

                          case 46:
                            _context.next = 52;
                            break;

                          case 48:
                            _context.prev = 48;
                            _context.t3 = _context["catch"](8);
                            _didIteratorError = true;
                            _iteratorError = _context.t3;

                          case 52:
                            _context.prev = 52;
                            _context.prev = 53;

                            if (!_iteratorNormalCompletion && _iterator.return != null) {
                              _iterator.return();
                            }

                          case 55:
                            _context.prev = 55;

                            if (!_didIteratorError) {
                              _context.next = 58;
                              break;
                            }

                            throw _iteratorError;

                          case 58:
                            return _context.finish(55);

                          case 59:
                            return _context.finish(52);

                          case 60:
                          case "end":
                            return _context.stop();
                        }
                      }
                    }, _callee, null, [[8, 48, 52, 60], [25, 29, 33, 41], [34,, 36, 40], [53,, 55, 59]]);
                  }));

                  function task() {
                    return _task.apply(this, arguments);
                  }

                  return task;
                }()
              }, {
                title: 'Translate',
                task: function task() {
                  var langFiles = languages;
                  var cacheClone = [];

                  var _loop = function _loop(i) {
                    var params = cache[i].params;

                    if (params[1][0] != '#') {
                      cacheClone.push(_lodash.default.clone(params));
                      return "continue";
                    }

                    var translateAndMemorize = function translateAndMemorize(instanceLang, langId, text) {
                      var translated = instanceLang.translate(text);
                      cacheClone.push([langId, translated, cache[i].params[2]]);
                    };

                    var _iteratorNormalCompletion4 = true;
                    var _didIteratorError4 = false;
                    var _iteratorError4 = undefined;

                    try {
                      for (var _iterator4 = langFiles[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                        var lang = _step4.value;
                        var langId = lang;
                        var text = params[1].substr(1);
                        var instanceLang = cache[i].converse.lang;
                        var fullLang = langId + '_' + langId.toUpperCase();
                        instanceLang.set(fullLang);
                        var group = instanceLang.getGroup(text);

                        if (group.length > 0) {
                          var _iteratorNormalCompletion5 = true;
                          var _didIteratorError5 = false;
                          var _iteratorError5 = undefined;

                          try {
                            for (var _iterator5 = group[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
                              var gtext = _step5.value;
                              translateAndMemorize(instanceLang, langId, gtext);
                            }
                          } catch (err) {
                            _didIteratorError5 = true;
                            _iteratorError5 = err;
                          } finally {
                            try {
                              if (!_iteratorNormalCompletion5 && _iterator5.return != null) {
                                _iterator5.return();
                              }
                            } finally {
                              if (_didIteratorError5) {
                                throw _iteratorError5;
                              }
                            }
                          }
                        } else {
                          translateAndMemorize(instanceLang, langId, text);
                        }
                      }
                    } catch (err) {
                      _didIteratorError4 = true;
                      _iteratorError4 = err;
                    } finally {
                      try {
                        if (!_iteratorNormalCompletion4 && _iterator4.return != null) {
                          _iterator4.return();
                        }
                      } finally {
                        if (_didIteratorError4) {
                          throw _iteratorError4;
                        }
                      }
                    }
                  };

                  for (var i = 0; i < cache.length; i++) {
                    var _ret = _loop(i);

                    if (_ret === "continue") continue;
                  }

                  var _iteratorNormalCompletion3 = true;
                  var _didIteratorError3 = false;
                  var _iteratorError3 = undefined;

                  try {
                    for (var _iterator3 = langFiles[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                      var lang = _step3.value;
                      cacheLang[lang] = true;
                    }
                  } catch (err) {
                    _didIteratorError3 = true;
                    _iteratorError3 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion3 && _iterator3.return != null) {
                        _iterator3.return();
                      }
                    } finally {
                      if (_didIteratorError3) {
                        throw _iteratorError3;
                      }
                    }
                  }

                  cache = cacheClone;
                }
              }, {
                title: 'Add Document in manager',
                task: function task() {
                  manager = new _nodeNlp.NlpManager({
                    languages: Object.keys(cacheLang)
                  });
                  var _iteratorNormalCompletion6 = true;
                  var _didIteratorError6 = false;
                  var _iteratorError6 = undefined;

                  try {
                    for (var _iterator6 = cache[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                      var _manager;

                      var params = _step6.value;

                      (_manager = manager).addDocument.apply(_manager, (0, _toConsumableArray2.default)(params));
                    }
                  } catch (err) {
                    _didIteratorError6 = true;
                    _iteratorError6 = err;
                  } finally {
                    try {
                      if (!_iteratorNormalCompletion6 && _iterator6.return != null) {
                        _iterator6.return();
                      }
                    } finally {
                      if (_didIteratorError6) {
                        throw _iteratorError6;
                      }
                    }
                  }
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

              manager.save("".concat(directory, "/bot/model/model.nlp"));
            }
          }]);

          if (!onlyTasks) {
            _context2.next = 15;
            break;
          }

          return _context2.abrupt("return", tasks);

        case 15:
          _context2.next = 17;
          return tasks.run();

        case 17:
        case "end":
          return _context2.stop();
      }
    }
  }, _callee2);
}));

exports.default = _default;