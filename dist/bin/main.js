#!/usr/bin/env node
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _yargs = _interopRequireDefault(require("yargs"));

var _updateNotifier = _interopRequireDefault(require("update-notifier"));

var _test = _interopRequireDefault(require("../commands/test"));

var _new = _interopRequireDefault(require("../commands/new"));

var _serve = _interopRequireDefault(require("../commands/serve"));

var _build = _interopRequireDefault(require("../commands/build"));

var _deploy = _interopRequireDefault(require("../commands/deploy"));

var _logout = _interopRequireDefault(require("../commands/logout"));

var _emulator = _interopRequireDefault(require("../commands/emulator"));

var _generate = _interopRequireDefault(require("../commands/generate"));

var _train = _interopRequireDefault(require("../commands/train"));

var _setwebhooks = _interopRequireDefault(require("../commands/setwebhooks"));

var _package = _interopRequireDefault(require("../../package.json"));

(0, _updateNotifier.default)({
  pkg: _package.default
}).notify();
_yargs.default.command('test', 'Run units tests', function () {}, _test.default).option('t', {
  alias: 'timeout',
  describe: 'Test-specific timeouts may be applied (5000ms by default). Put 0 to disable timeout'
}).option('h', {
  alias: 'help'
}).argv;
_yargs.default.command('new <name>', 'create a new project', function () {}, _new.default).argv;
_yargs.default.command('serve', 'start the server', function () {}, _serve.default).option('p', {
  alias: 'port',
  describe: 'Listen on port (3000 by default)'
}).option('n', {
  alias: 'ngrok',
  describe: 'Start Ngrok'
}).option('c', {
  alias: 'cloud',
  describe: 'Test your chatbot in NewBot Cloud'
}).option('e', {
  alias: 'entry',
  describe: 'name of entry file (main.js by default)'
}).option('cf', {
  alias: 'config',
  describe: 'name of config file (newbot.config.js by default)'
}).option('pa', {
  alias: 'path',
  describe: 'path of directory'
}).option('ts', {
  alias: 'typescript',
  describe: 'read ts file'
}).help("?").alias("?", "help").example("$0 serve -p 5000", "Change port to 5000").argv;
_yargs.default.command('build', 'build your chatbot skills', function () {}, _build.default).option('e', {
  alias: 'entry',
  describe: 'name of entry file (main.js by default)'
}).option('n', {
  alias: 'node',
  describe: 'Build NodeJS only'
}).option('pa', {
  alias: 'path',
  describe: 'path of directory'
}).argv;
_yargs.default.command('emulator', 'Run the console emulator', function () {}, _emulator.default).option('s', {
  alias: 'source',
  describe: 'Simulate platform [messenger, line, slack, telegram, viber]'
}).option('l', {
  alias: 'lang',
  describe: 'Set user language (ex: fr_FR, en_EN, es_ES, ...)'
}).option('sk', {
  alias: 'skill',
  describe: 'Test a skill in skills directory'
}).help("?").alias("?", "help").argv;
_yargs.default.command('generate <type> <name>', 'Run the console emulator', function () {}, _generate.default).help("?").alias("?", "help").argv;
_yargs.default.command('train', 'train your chatbot with NLP system', function () {}, _train.default).argv;
_yargs.default.command('setwebhooks', 'Assign webhooks from different platforms to your production server', function () {}, _setwebhooks.default).argv;
_yargs.default.command('deploy', 'Deploy your chatbot to NewBot Cloud', function () {}, _deploy.default).option('e', {
  alias: 'entry',
  describe: 'name of entry file (main.js by default)'
}).argv;
_yargs.default.command('logout', 'Logout to NewBot Cloud', function () {}, _logout.default).argv;
_yargs.default.option('v', {
  alias: 'version',
  describe: 'Displays NewBot CLI version'
}).argv;
process.on('unhandledRejection', function (err) {
  console.log(err);
});
process.on('uncaughtException', function (err) {
  console.log(err);
});