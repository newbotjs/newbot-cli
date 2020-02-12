"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _lodash = _interopRequireDefault(require("lodash"));

var _fs = _interopRequireDefault(require("fs"));

var _webpack = _interopRequireDefault(require("webpack"));

var _path = _interopRequireDefault(require("path"));

function asset() {
  var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  return new Promise(function (resolve, reject) {
    var path = options.path || process.cwd();
    var config = {};

    try {
      var configFile = "".concat(path, "/newbot.config.js");

      _fs.default.accessSync(configFile, _fs.default.constants.R_OK | _fs.default.constants.W_OK);

      config = require(configFile);
    } catch (err) {}

    var _config = config,
        map = _config.map,
        root = _config.root,
        plugins = _config.plugins;

    var _root = options.root || root;

    var alias = {};

    if (map) {
      for (var pkg in map) {
        var platform = map[pkg];

        if (!_lodash.default.isString(platform)) {
          var type = options.type == 'cjs' ? 'browser' : options.type;
          platform = platform[type];
        }

        alias[pkg] = platform;
      }
    }

    var entry = [];
    var rules = [{
      test: /\.converse$/,
      use: [{
        loader: _path.default.resolve(__dirname, '../loader/converse.js')
      }]
    }];

    if (options.type == 'browser') {
      entry.push(_path.default.resolve(__dirname, '../../node_modules/@babel/polyfill'));
      entry.push(_path.default.resolve(__dirname, 'bundles/init-browser'));
      rules.push({
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: _path.default.resolve(__dirname, '../../node_modules/babel-loader'),
          options: {
            presets: [require('@babel/preset-env')],
            plugins: [[require('@babel/plugin-transform-runtime'), {
              absoluteRuntime: _path.default.resolve(__dirname, '../../node_modules')
            }]]
          }
        }
      });

      if (plugins) {
        var bundles = plugins.filter(function (p) {
          return p.bundle;
        });
        entry = entry.concat(bundles.map(function (b) {
          return _path.default.resolve(path, b.bundle);
        }));
      }
    }

    entry.push(root ? "".concat(path, "/").concat(_root) : "".concat(path, "/bot/").concat(options.entry));
    var libraryTarget;

    switch (options.type) {
      case 'node':
        libraryTarget = 'umd';
        break;

      case 'cjs':
        libraryTarget = 'commonjs';
        break;

      default:
        libraryTarget = 'var';
    }

    var webpackOptions = {
      mode: 'production',
      target: 'node',
      entry: entry,
      output: {
        path: "".concat(path, "/").concat(options.dir),
        filename: options.file,
        libraryTarget: libraryTarget,
        libraryExport: 'default'
      },
      module: {
        rules: rules
      },
      resolve: {
        alias: alias
      }
    };

    if (options.type == 'node' || options.type == 'cjs') {
      webpackOptions.externals = [function (context, request, callback) {
        if (path == context || request.startsWith('.') || request.startsWith('newbot-')) {
          return callback();
        }

        return callback(null, 'commonjs ' + request);
      }];
      webpackOptions.node = {
        __dirname: false
      };
    } else {
      webpackOptions.output.library = 'MainSkill';
      webpackOptions.node = {
        __dirname: false
      };
    }

    (0, _webpack.default)(webpackOptions, function (err, stats) {
      if (err || stats.hasErrors()) {
        var info = stats.toJson();
        if (err) return reject(err);else return reject(info.errors);
      }

      resolve();
    });
  });
}

var _default = asset;
exports.default = _default;