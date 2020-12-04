"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _express = _interopRequireDefault(require("express"));

var _http = _interopRequireDefault(require("http"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

var _lodash = _interopRequireDefault(require("lodash"));

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _chokidar = _interopRequireDefault(require("chokidar"));

var _decache = _interopRequireDefault(require("decache"));

var _listr = _interopRequireDefault(require("listr"));

var _moment = _interopRequireDefault(require("moment"));

var _cliTable = _interopRequireDefault(require("cli-table"));

var _ngrok = _interopRequireDefault(require("ngrok"));

var _execa = _interopRequireDefault(require("execa"));

var _jsonStringifySafe = _interopRequireDefault(require("json-stringify-safe"));

var _newbotExpress = _interopRequireDefault(require("newbot-express"));

var _output = _interopRequireDefault(require("newbot-express/output"));

var _langAll = _interopRequireDefault(require("@nlpjs/lang-all"));

var _config = _interopRequireDefault(require("../config"));

var _app = _interopRequireDefault(require("../server/app"));

var _log = _interopRequireDefault(require("../server/log"));

var _runSkill = _interopRequireDefault(require("../build/run-skill"));

var _cloud = _interopRequireDefault(require("../core/cloud"));

var _main = _interopRequireDefault(require("../build/main"));

var _socket = _interopRequireDefault(require("socket.io"));

var _analysis = _interopRequireDefault(require("./analysis"));

var _getConfigFile = _interopRequireDefault(require("../core/get-config-file"));

var _getNewbot = _interopRequireDefault(require("../core/get-newbot"));

var _train = _interopRequireDefault(require("./train"));

var _linkCli = _interopRequireDefault(require("../utils/link-cli"));

var _viber = _interopRequireDefault(require("../webhooks/viber"));

var _telegram = _interopRequireDefault(require("../webhooks/telegram"));

var rollup = require('rollup');

var _default =
/*#__PURE__*/
(0, _asyncToGenerator2.default)(
/*#__PURE__*/
_regenerator.default.mark(function _callee6() {
  var _ref2,
      _ref2$port,
      port,
      _ref2$ngrok,
      ngrok,
      _ref2$cloud,
      cloud,
      _ref2$entry,
      entry,
      configFile,
      _ref2$path,
      path,
      _expressNewBot,
      Converse,
      apiFile,
      disposeCode,
      socket,
      ngrokIgnore,
      app,
      server,
      io,
      files,
      newbotCloud,
      config,
      watcher,
      tasks,
      tasksChange,
      buildRemoteSkill,
      loadApp,
      output,
      expressBot,
      serverRoutes,
      routesModule,
      _args6 = arguments;

  return _regenerator.default.wrap(function _callee6$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _ref2 = _args6.length > 0 && _args6[0] !== undefined ? _args6[0] : {}, _ref2$port = _ref2.port, port = _ref2$port === void 0 ? 3000 : _ref2$port, _ref2$ngrok = _ref2.ngrok, ngrok = _ref2$ngrok === void 0 ? true : _ref2$ngrok, _ref2$cloud = _ref2.cloud, cloud = _ref2$cloud === void 0 ? false : _ref2$cloud, _ref2$entry = _ref2.entry, entry = _ref2$entry === void 0 ? 'main.js' : _ref2$entry, configFile = _ref2.config, _ref2$path = _ref2.path, path = _ref2$path === void 0 ? process.cwd() : _ref2$path;
          _context6.prev = 1;
          Converse = (0, _getNewbot.default)();
          global.logs = [];
          apiFile = false;
          disposeCode = false;
          ngrokIgnore = false;
          app = (0, _express.default)();
          server = _http.default.Server(app);
          io = (0, _socket.default)(server);
          files = path;

          if (!cloud) {
            _context6.next = 15;
            break;
          }

          _context6.next = 14;
          return (0, _cloud.default)();

        case 14:
          newbotCloud = _context6.sent;

        case 15:
          config = (0, _getConfigFile.default)(configFile);
          tasks = new _listr.default([{
            title: "NewBot Framework Version : ".concat(Converse.version),
            task: function task() {}
          }, {
            title: 'Train Bot',
            task: function task() {
              return (0, _train.default)({
                onlyTasks: true,
                path: path,
                entry: entry
              });
            }
          }, {
            title: "Connect to Ngrok",
            skip: function skip(ctx) {
              var platforms = config.platforms;

              if (!platforms || platforms && Object.keys(platforms).length == 0) {
                process.env.SERVER_URL = ctx.url = 'http://localhost:' + port;
                ngrokIgnore = true;
                return 'ngrok is not launched because no external platform';
              }

              if (!ngrok) {
                return 'ngrok is disabled';
              }
            },
            task: function () {
              var _task = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee(ctx) {
                return _regenerator.default.wrap(function _callee$(_context) {
                  while (1) {
                    switch (_context.prev = _context.next) {
                      case 0:
                        if (!(config.ngrok && config.ngrok.url)) {
                          _context.next = 4;
                          break;
                        }

                        ctx.url = config.ngrok.url;
                        _context.next = 7;
                        break;

                      case 4:
                        _context.next = 6;
                        return _ngrok.default.connect(_lodash.default.merge({
                          addr: port
                        }, config.ngrok));

                      case 6:
                        ctx.url = _context.sent;

                      case 7:
                        process.env.SERVER_URL = ctx.url;

                      case 8:
                      case "end":
                        return _context.stop();
                    }
                  }
                }, _callee);
              }));

              function task(_x) {
                return _task.apply(this, arguments);
              }

              return task;
            }()
          }, {
            title: "Listen your bot in port ".concat(port).green,
            task: function task() {
              return new Promise(function (resolve, reject) {
                watcher = _chokidar.default.watch("".concat(files, "/bot/**/*"), {
                  ignored: '*.spec.js',
                  persistent: true
                });
                watcher.on('ready', function () {
                  var lastDate = new Date().getTime();
                  watcher.on('all', function (ev, path) {
                    var current = new Date().getTime();

                    if (lastDate + 800 >= current) {
                      return;
                    }

                    lastDate = current;
                    tasksChange.run({
                      ev: ev,
                      path: path
                    });
                  });
                  loadApp(resolve, reject);
                });
              }).then(function () {
                return new Promise(function (resolve, reject) {
                  server.listen(port, function (err) {
                    if (err) return reject(err);
                    resolve();
                  });
                });
              });
            }
          },
          /* {
           title: `Connect to NewBot Cloud`,
           skip() {
               if (!ngrok) {
                   return 'ngrok is disabled'
               }
               if (!newbotCloud) {
                   return `Use the command "newbot serve --cloud" to test your chatbot on NewBot Cloud`
               }
           },
           async task(ctx) {
               disposeCode = true
               const {
                   configCloud,
                   userToken
               } = newbotCloud
               await buildRemoteSkill()
               await rp({
                   url: `${mainConfig.urlCloud}/api/bots/${configCloud.botId}/ngrok`,
                   method: 'POST',
                   body: {
                       url: ctx.url
                   },
                   json: true,
                   headers: {
                       'x-access-token': userToken
                   }
               })
               try {
                   const configFile = `${files}/api.js`
                   fs.accessSync(configFile, fs.constants.R_OK | fs.constants.W_OK)
                   apiFile = true
                   watcher.add(`${files}/api.js`)
               } catch (err) {
                   if (err.code != 'ENOENT') console.log(err)
               }
           }
          }, */
          {
            title: "Set WebHook to Twitter platform",
            skip: function skip() {
              var twitter = config.platforms.twitter;

              if (!ngrok) {
                return 'ngrok is disabled';
              }

              if (!twitter) {
                return 'Add "platforms.twitter" property in "newbot.config.js" file';
              }

              if (!twitter.accessToken) {
                return 'Add "platforms.twitter.accessToken" property in "newbot.config.js" file with authentification token';
              }
            },
            task: function () {
              var _task2 = (0, _asyncToGenerator2.default)(
              /*#__PURE__*/
              _regenerator.default.mark(function _callee2(ctx) {
                var _config$platforms$twi, consumerKey, consumerSecret, accessToken, accessTokenSecret, apiTwitter, url, oauth, res, webHook;

                return _regenerator.default.wrap(function _callee2$(_context2) {
                  while (1) {
                    switch (_context2.prev = _context2.next) {
                      case 0:
                        _config$platforms$twi = config.platforms.twitter, consumerKey = _config$platforms$twi.consumerKey, consumerSecret = _config$platforms$twi.consumerSecret, accessToken = _config$platforms$twi.accessToken, accessTokenSecret = _config$platforms$twi.accessTokenSecret;
                        apiTwitter = 'https://api.twitter.com/1.1/account_activity/all/dev';
                        url = "".concat(apiTwitter, "/webhooks.json");
                        oauth = {
                          consumer_key: consumerKey,
                          consumer_secret: consumerSecret,
                          token: accessToken,
                          token_secret: accessTokenSecret
                        };
                        _context2.next = 6;
                        return _requestPromise.default.get({
                          url: url,
                          oauth: oauth,
                          json: true
                        });

                      case 6:
                        res = _context2.sent;
                        webHook = res.find(function (el) {
                          return /emulator/.test(el.url);
                        });

                        if (!webHook) {
                          _context2.next = 11;
                          break;
                        }

                        _context2.next = 11;
                        return _requestPromise.default.delete({
                          url: "".concat(apiTwitter, "/webhooks/").concat(webHook.id, ".json"),
                          oauth: oauth
                        });

                      case 11:
                        _context2.next = 13;
                        return _requestPromise.default.post({
                          url: url,
                          headers: {
                            'Content-type': 'application/x-www-form-urlencoded'
                          },
                          oauth: oauth,
                          form: {
                            url: ctx.url + '/emulator/twitter'
                          }
                        });

                      case 13:
                        _context2.next = 15;
                        return _requestPromise.default.post({
                          url: "".concat(apiTwitter, "/subscriptions.json"),
                          oauth: oauth
                        });

                      case 15:
                      case "end":
                        return _context2.stop();
                    }
                  }
                }, _callee2);
              }));

              function task(_x2) {
                return _task2.apply(this, arguments);
              }

              return task;
            }()
          }, (0, _viber.default)(config, {
            ngrok: ngrok
          }), (0, _telegram.default)(config, {
            ngrok: ngrok
          }), {
            title: 'Auto configuration Google Actions',
            skip: function skip() {
              var gactions = config.platforms.gactions;

              if (!ngrok) {
                return 'ngrok is disabled';
              }

              if (!gactions) {
                return 'Add "platforms.gactions" property in "newbot.config.js" file to test Google Actions';
              }

              if (!gactions.projectId) {
                return 'Add "platforms.gactions.projectId" property in "newbot.config.js" file with your Google Action project id value';
              }

              if (!gactions.triggers) {
                return 'Add "platforms.gactions.triggers" property in "newbot.config.js" file. Ex : { triggers : { en: "Talk with chatbot" } }';
              }
            },
            task: function task(ctx) {
              var gactions = config.platforms.gactions;
              var gactionsDir = "".concat(files, "/gactions");
              var regexp = /action\.([a-zA-Z-]+)\.json/;

              try {
                _fs.default.mkdirSync(gactionsDir);
              } catch (err) {
                if (err.code != 'EEXIST') throw err;
              }

              var actionFiles = function actionFiles() {
                return _fs.default.readdirSync(gactionsDir).filter(function (filename) {
                  return regexp.test(filename);
                });
              };

              return new _listr.default([{
                title: 'Generate "action.LANG.json" files',
                skip: function skip(ctx) {
                  var arrayFiles = actionFiles().map(function (filename) {
                    return filename.match(regexp)[1];
                  });
                  ctx.fileToCreate = _lodash.default.difference(Object.keys(gactions.triggers, arrayFiles));

                  if (ctx.fileToCreate.length == 0) {
                    return 'All files are already created';
                  }
                },
                task: function task(ctx) {
                  var fileToCreate = ctx.fileToCreate;
                  var _iteratorNormalCompletion = true;
                  var _didIteratorError = false;
                  var _iteratorError = undefined;

                  try {
                    for (var _iterator = fileToCreate[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                      var lang = _step.value;
                      var json = {
                        "actions": [{
                          "description": "Default Intent",
                          "name": "MAIN",
                          "fulfillment": {
                            "conversationName": "newbot"
                          },
                          "intent": {
                            "name": "actions.intent.MAIN",
                            "trigger": {
                              "queryPatterns": gactions.triggers[lang]
                            }
                          }
                        }],
                        "conversations": {
                          "newbot": {
                            "name": "newbot",
                            "url": "<URL>"
                          }
                        },
                        "locale": lang
                      };

                      _fs.default.writeFileSync("".concat(gactionsDir, "/action.").concat(lang, ".json"), JSON.stringify(json, null, 2), 'utf-8');
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
                }
              }, {
                title: 'Update Google Actions',
                task: function () {
                  var _task3 = (0, _asyncToGenerator2.default)(
                  /*#__PURE__*/
                  _regenerator.default.mark(function _callee3() {
                    var gactions, actionPackages, binPath, shell;
                    return _regenerator.default.wrap(function _callee3$(_context3) {
                      while (1) {
                        switch (_context3.prev = _context3.next) {
                          case 0:
                            gactions = config.platforms.gactions;
                            actionPackages = '';
                            actionFiles().forEach(function (filename) {
                              var file = "".concat(gactionsDir, "/").concat(filename);

                              var json = _fs.default.readFileSync(file, 'utf-8');

                              json = JSON.parse(json);
                              json.conversations.newbot.url = ctx.url + '/emulator/gactions';

                              _fs.default.writeFileSync(file, JSON.stringify(json, null, 2), 'utf-8');

                              actionPackages += ' --action_package ' + (0, _linkCli.default)(file);
                              12;
                            });
                            binPath = (0, _linkCli.default)(gactions.binPath || _path.default.resolve(__dirname, '../bin/gactions'));
                            shell = "".concat(binPath, " update ").concat(actionPackages, " --project ").concat(gactions.projectId);
                            _context3.prev = 5;

                            _fs.default.accessSync("".concat(files, "/creds.data"), _fs.default.constants.R_OK | _fs.default.constants.W_OK);

                            _context3.next = 9;
                            return _execa.default.shell(shell);

                          case 9:
                            _context3.next = 14;
                            break;

                          case 11:
                            _context3.prev = 11;
                            _context3.t0 = _context3["catch"](5);
                            setTimeout(function (_) {
                              /* execa.shell(shell, {
                                   input: process.stdin
                               }).stdout.pipe(process.stdout)*/
                              console.log(_context3.t0);
                              console.log('Shell Command: ', shell);
                            }, 2000);

                          case 14:
                          case "end":
                            return _context3.stop();
                        }
                      }
                    }, _callee3, null, [[5, 11]]);
                  }));

                  function task() {
                    return _task3.apply(this, arguments);
                  }

                  return task;
                }()
              }]);
            }
          }]);
          tasksChange = new _listr.default([{
            title: '',
            task: function task(_ref3, _task4) {
              var ev = _ref3.ev,
                  path = _ref3.path;
              _task4.title = "".concat((0, _moment.default)().format(), " Reload your chatbot");
              return new Promise(function (resolve, reject) {
                loadApp(resolve, reject);
              });
            }
          }]);

          buildRemoteSkill =
          /*#__PURE__*/
          function () {
            var _ref4 = (0, _asyncToGenerator2.default)(
            /*#__PURE__*/
            _regenerator.default.mark(function _callee4() {
              var optionsRollup, bundle, _ref5, code, map, optionsRollupApi, bundleApi, _ref6, codeApi;

              return _regenerator.default.wrap(function _callee4$(_context4) {
                while (1) {
                  switch (_context4.prev = _context4.next) {
                    case 0:
                      optionsRollup = (0, _main.default)({
                        type: 'node'
                      });
                      _context4.next = 3;
                      return rollup.rollup(optionsRollup);

                    case 3:
                      bundle = _context4.sent;
                      _context4.next = 6;
                      return bundle.generate({
                        format: 'cjs',
                        strict: false
                      });

                    case 6:
                      _ref5 = _context4.sent;
                      code = _ref5.code;
                      map = _ref5.map;
                      global.code = code;

                      if (!apiFile) {
                        _context4.next = 20;
                        break;
                      }

                      optionsRollupApi = (0, _main.default)({
                        type: 'node',
                        root: 'api.js'
                      });
                      _context4.next = 14;
                      return rollup.rollup(optionsRollupApi);

                    case 14:
                      bundleApi = _context4.sent;
                      _context4.next = 17;
                      return bundleApi.generate({
                        format: 'cjs',
                        strict: false
                      });

                    case 17:
                      _ref6 = _context4.sent;
                      codeApi = _ref6.code;
                      global.codeApi = codeApi;

                    case 20:
                    case "end":
                      return _context4.stop();
                  }
                }
              }, _callee4);
            }));

            return function buildRemoteSkill() {
              return _ref4.apply(this, arguments);
            };
          }();

          loadApp =
          /*#__PURE__*/
          function () {
            var _ref7 = (0, _asyncToGenerator2.default)(
            /*#__PURE__*/
            _regenerator.default.mark(function _callee5(resolve, reject) {
              var skill, p, _newbotCloud, configCloud, userToken;

              return _regenerator.default.wrap(function _callee5$(_context5) {
                while (1) {
                  switch (_context5.prev = _context5.next) {
                    case 0:
                      _context5.prev = 0;

                    case 1:
                      p = "".concat(files, "/bot/").concat(entry);
                      (0, _decache.default)(p);
                      _context5.next = 5;
                      return (0, _runSkill.default)(p);

                    case 5:
                      skill = _context5.sent;

                    case 6:
                      if (!skill.default) {
                        _context5.next = 1;
                        break;
                      }

                    case 7:
                      global.converse = new Converse(skill.default, {
                        model: files + '/bot/model/model.nlp',
                        modelLangs: [_langAll.default]
                      });
                      global.converse.debug = true;

                      if (!disposeCode) {
                        _context5.next = 15;
                        break;
                      }

                      _context5.next = 12;
                      return buildRemoteSkill();

                    case 12:
                      _newbotCloud = newbotCloud, configCloud = _newbotCloud.configCloud, userToken = _newbotCloud.userToken;
                      _context5.next = 15;
                      return (0, _requestPromise.default)({
                        url: "".concat(_config.default.urlCloud, "/api/bots/").concat(configCloud.botId, "/dev/reload"),
                        method: 'POST',
                        headers: {
                          'x-access-token': userToken
                        }
                      });

                    case 15:
                      resolve();
                      _context5.next = 22;
                      break;

                    case 18:
                      _context5.prev = 18;
                      _context5.t0 = _context5["catch"](0);
                      console.log(_context5.t0);
                      reject(_context5.t0);

                    case 22:
                    case "end":
                      return _context5.stop();
                  }
                }
              }, _callee5, null, [[0, 18]]);
            }));

            return function loadApp(_x3, _x4) {
              return _ref7.apply(this, arguments);
            };
          }();

          (0, _log.default)(app, {
            Converse: Converse,
            path: files
          });
          output = {
            debug: function debug(type, val) {
              var user = val.user;
              val.user = {
                adress: user.address,
                _infoAddress: user._infoAddress,
                varFn: user.varFn,
                magicVar: user.magicVar,
                variables: user.variables,
                id: user.id,
                lang: user.lang
              };

              if (val.data && val.data.session) {
                val.platform = val.data.session.message.source;
                val.data = undefined;
              }

              val._instructions = undefined;

              if (type == 'begin') {
                global.logs.push([]);
              }

              var last = global.logs.length - 1;

              if (val.level == 'root' && global.logs[last] && global.logs[last].findIndex(function (p) {
                return p.level == 'root';
              }) != 1) {
                return;
              }

              var event = {
                type: type,
                date: new Date(),
                val: (0, _jsonStringifySafe.default)(val)
              };
              global.logs[last].push(event);
              if (socket) socket.emit('debug', {
                event: event,
                index: last
              });
            }
          };
          io.on('connection', function (sock) {
            socket = sock;
            socket.on('message', function (data) {
              var event = data.event;
              var userId = 'emulator-user';
              var options = (0, _output.default)({
                message: {
                  source: 'website'
                },
                source: 'website',
                send: function send(output) {
                  socket.emit('message', output);
                },
                user: {
                  id: userId
                }
              }, {
                output: output
              });

              if (event) {
                global.converse.event(event.name, event.data, userId, options).catch(console.log);
              } else {
                global.converse.exec(data, userId, options).catch(console.log);
              }
            });
          });
          expressBot = (0, _newbotExpress.default)((_expressNewBot = {
            botPath: files,
            botConfigFile: config,
            botframework: {
              path: '/emulator'
            },
            messenger: {
              path: '/emulator/messenger'
            },
            viber: {
              path: '/emulator/viber'
            }
          }, (0, _defineProperty2.default)(_expressNewBot, "messenger", {
            path: '/emulator/messenger'
          }), (0, _defineProperty2.default)(_expressNewBot, "telegram", {
            path: '/emulator/telegram'
          }), (0, _defineProperty2.default)(_expressNewBot, "line", {
            path: '/emulator/line'
          }), (0, _defineProperty2.default)(_expressNewBot, "slack", {
            path: '/emulator/slack'
          }), (0, _defineProperty2.default)(_expressNewBot, "gactions", {
            path: '/emulator/gactions'
          }), (0, _defineProperty2.default)(_expressNewBot, "twitter", {
            path: '/emulator/twitter'
          }), (0, _defineProperty2.default)(_expressNewBot, "alexa", {
            path: '/emulator/alexa'
          }), (0, _defineProperty2.default)(_expressNewBot, "output", output), _expressNewBot), app, true);
          (0, _app.default)(app, socket, files);
          serverRoutes = "".concat(files, "/server/routes.js");

          try {
            _fs.default.accessSync(serverRoutes, _fs.default.constants.R_OK | _fs.default.constants.W_OK);

            routesModule = require(serverRoutes);
            routesModule(app, expressBot);
          } catch (err) {
            if (err.code != 'ENOENT') {
              console.log(err);
            } else {
              console.log("File not found : ".concat(serverRoutes, ". Ignored file"));
            }
          }

          tasks.run().then(function (ctx) {
            if (!ctx.url || ngrokIgnore) return;
            var table = new _cliTable.default({
              chars: {
                'top': '═',
                'top-mid': '╤',
                'top-left': '╔',
                'top-right': '╗',
                'bottom': '═',
                'bottom-mid': '╧',
                'bottom-left': '╚',
                'bottom-right': '╝',
                'left': '║',
                'left-mid': '╟',
                'mid': '─',
                'mid-mid': '┼',
                'right': '║',
                'right-mid': '╢',
                'middle': '│'
              }
            });
            table.push(['Ngrok URL', ctx.url]);

            if (config.platforms.slack) {
              table.push(['Slack WebHook URL', ctx.url + '/emulator/slack']);
            }

            if (config.platforms.line) {
              table.push(['Line WebHook URL', ctx.url + '/emulator/line']);
            }

            if (config.platforms.messenger) {
              table.push(['Messenger WebHook URL', ctx.url + '/emulator/messenger', 'Messenger Verifiy Token', config.platforms.messenger.verifyToken]);
            }

            console.log(table.toString());
          });
          _context6.next = 33;
          break;

        case 30:
          _context6.prev = 30;
          _context6.t0 = _context6["catch"](1);
          console.log(_context6.t0);

        case 33:
        case "end":
          return _context6.stop();
      }
    }
  }, _callee6, null, [[1, 30]]);
}));

exports.default = _default;