"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _regenerator = _interopRequireDefault(require("@babel/runtime/regenerator"));

var _asyncToGenerator2 = _interopRequireDefault(require("@babel/runtime/helpers/asyncToGenerator"));

var _requestPromise = _interopRequireDefault(require("request-promise"));

var _fs = _interopRequireDefault(require("fs"));

var _inquirer = _interopRequireDefault(require("inquirer"));

var _colors = _interopRequireDefault(require("colors"));

var _config = _interopRequireDefault(require("../config"));

var _isEmail = _interopRequireDefault(require("validator/lib/isEmail"));

var _default = function _default() {
  var env = process.env.NODE_ENV;
  return new Promise(
  /*#__PURE__*/
  function () {
    var _ref = (0, _asyncToGenerator2.default)(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(resolve, reject) {
      var cloudFile, configCloud, retCloud, _ref2, mode, body, _body, _configCloud;

      return _regenerator.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              cloudFile = __dirname + '/../../.newbot-cloud' + (env ? '-' + env : '');
              _context.prev = 1;
              configCloud = _fs.default.readFileSync(cloudFile, 'utf-8');
              resolve(JSON.parse(configCloud));
              _context.next = 50;
              break;

            case 6:
              _context.prev = 6;
              _context.t0 = _context["catch"](1);

              if (!(_context.t0.code == 'ENOENT')) {
                _context.next = 50;
                break;
              }

              _context.next = 11;
              return _inquirer.default.prompt([{
                type: 'list',
                name: 'mode',
                message: 'NewBot Cloud : To deploy, please login or create an account. It\'s free :)',
                choices: [{
                  value: 'login',
                  name: 'Login'
                }, {
                  value: 'signup',
                  name: 'Create an account'
                }]
              }]);

            case 11:
              _ref2 = _context.sent;
              mode = _ref2.mode;

              if (!(mode == 'login')) {
                _context.next = 30;
                break;
              }

              _context.next = 16;
              return _inquirer.default.prompt([{
                type: 'input',
                name: 'username',
                message: 'Your email'
              }, {
                type: 'password',
                name: 'password',
                message: 'Your password'
              }]);

            case 16:
              body = _context.sent;
              _context.prev = 17;
              _context.next = 20;
              return (0, _requestPromise.default)({
                url: "".concat(_config.default.urlCloud, "/api/me/login"),
                method: 'POST',
                body: body,
                json: true
              });

            case 20:
              retCloud = _context.sent;
              _context.next = 28;
              break;

            case 23:
              _context.prev = 23;
              _context.t1 = _context["catch"](17);
              console.log(_context.t1.message.red);

              if (_context.t1.statusCode && _context.t1.statusCode == 401) {
                console.log('Impossible to connect. Verify your email or password'.red);
              }

              reject(_context.t1);

            case 28:
              _context.next = 49;
              break;

            case 30:
              if (!(mode == 'signup')) {
                _context.next = 49;
                break;
              }

              _context.next = 33;
              return _inquirer.default.prompt([{
                type: 'input',
                name: 'email',
                message: 'Your email',
                validate: function validate(input) {
                  if (!(0, _isEmail.default)(input)) {
                    return 'Email is invalid';
                  }

                  return true;
                }
              }, {
                type: 'password',
                name: 'password',
                message: 'Your password'
              }, {
                type: 'password',
                name: 'confirm_password',
                message: 'Confirm your password'
              }, {
                type: 'confirm',
                name: 'cgu',
                message: 'I downloaded and approved the Terms of Service of NewBot.io : https://app.newbot.io/assets/pdf/cgu_en.pdf'
              }]);

            case 33:
              _body = _context.sent;
              _context.prev = 34;

              if (_body.cgu) {
                _context.next = 38;
                break;
              }

              console.log('[NewBot Cloud] You must accept the terms of use before creating an account'.red);
              return _context.abrupt("return");

            case 38:
              _context.next = 40;
              return (0, _requestPromise.default)({
                url: "".concat(_config.default.urlCloud, "/api/users"),
                method: 'POST',
                body: _body,
                json: true
              });

            case 40:
              retCloud = _context.sent;
              console.log('[NewBot Cloud] Great, your account has been created'.green);
              resolve(ret);
              _context.next = 49;
              break;

            case 45:
              _context.prev = 45;
              _context.t2 = _context["catch"](34);

              if (_context.t2.message = 'EMAIL_EXISTS') {
                console.log('This email address already exists. Please use another'.red);
              } else {
                console.log(_context.t2.message.red);
              }

              reject(_context.t2);

            case 49:
              if (retCloud && retCloud.token) {
                _configCloud = {
                  userToken: retCloud.token
                };

                _fs.default.writeFileSync(cloudFile, JSON.stringify(_configCloud));

                resolve(_configCloud);
              } else {
                reject(new Error('Token not found'));
              }

            case 50:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[1, 6], [17, 23], [34, 45]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

exports.default = _default;