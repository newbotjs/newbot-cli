"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _toConsumableArray2 = _interopRequireDefault(require("@babel/runtime/helpers/toConsumableArray"));

var _rollupPluginNodeResolve = _interopRequireDefault(require("rollup-plugin-node-resolve"));

var _rollupPluginCommonjs = _interopRequireDefault(require("rollup-plugin-commonjs"));

var _rollupPluginJson = _interopRequireDefault(require("rollup-plugin-json"));

var _rollupPluginUglify = require("rollup-plugin-uglify");

var _fs = _interopRequireDefault(require("fs"));

var _lodash = _interopRequireDefault(require("lodash"));

require("newbot/src/transpiler/load");

var _lexer = _interopRequireDefault(require("newbot/src/transpiler/lexer"));

function asset() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var path = process.cwd();
  var dep = {};

  try {
    dep = require("".concat(path, "/package.json")).dependencies || {};
  } catch (err) {}

  var dependencies = Object.keys(dep).filter(function (d) {
    return !/newbot/.test(d);
  });
  var config = {};

  try {
    var configFile = "".concat(path, "/newbot.config.js");

    _fs.default.accessSync(configFile, _fs.default.constants.R_OK | _fs.default.constants.W_OK);

    config = require(configFile);
  } catch (err) {}

  var _config = config,
      map = _config.map,
      root = _config.root;
  var resolveOptions = {
    preferBuiltins: false
  };

  if (options.type == 'node') {
    resolveOptions.only = [/newbot/];
  }

  var _root = options.root || root;

  var optionsRollup = {
    input: _root ? "".concat(path, "/").concat(_root) : "".concat(path, "/bot/main.js"),
    external: (0, _toConsumableArray2.default)(dependencies),
    onwarn: function onwarn(warning, warn) {
      if (warning.code == 'UNRESOLVED_IMPORT') {
        return;
      }

      warn(warning);
    },
    plugins: [(0, _rollupPluginCommonjs.default)(), (0, _rollupPluginNodeResolve.default)(resolveOptions), (0, _rollupPluginJson.default)(), {
      name: 'converse',
      transform: function () {
        var _transform = (0, _asyncToGenerator2.default)(
        /*#__PURE__*/
        _regenerator.default.mark(function _callee(code, id) {
          var transpiler, obj, compiled, baseUrl, converseUrlRegex, relativePathRegex, pathToApp, pkg, platform, regexp, match, name, _module, file, _pkg;

          return _regenerator.default.wrap(function _callee$(_context) {
            while (1) {
              switch (_context.prev = _context.next) {
                case 0:
                  if (!/converse$/.test(id)) {
                    _context.next = 7;
                    break;
                  }

                  transpiler = new _lexer.default(code, id);
                  obj = transpiler.run();
                  compiled = JSON.stringify(obj);
                  code = code.replace(/`/g, '\\`');
                  code = "\nexport default {\n    code: `".concat(code, "`,\n    compiled: ").concat(compiled, "\n}\n                        ");
                  return _context.abrupt("return", {
                    code: code
                  });

                case 7:
                  baseUrl = path;
                  converseUrlRegex = /file\s*:\s*(['"`](.*?)['"`])/g;
                  relativePathRegex = /^\.{1,2}\//i;
                  pathToApp = id.replace(baseUrl, "").replace(new RegExp("[^/]+$"), "");

                  if (map) {
                    for (pkg in map) {
                      platform = map[pkg];

                      if (!_lodash.default.isString(platform)) {
                        platform = platform[options.type];
                      }

                      regexp = new RegExp("".concat(pkg, "(['\"])"), 'g');
                      code = code.replace(regexp, platform + '$1');
                    }
                  }

                  return _context.abrupt("return", {
                    code: code
                  });

                case 16:
                case "end":
                  return _context.stop();
              }
            }
          }, _callee);
        }));

        function transform(_x, _x2) {
          return _transform.apply(this, arguments);
        }

        return transform;
      }()
    }]
  };
  /*if (options.type == 'browser') {
      optionsRollup.plugins.push(uglify())
  }*/

  return optionsRollup;
}

var _default = asset;
exports.default = _default;