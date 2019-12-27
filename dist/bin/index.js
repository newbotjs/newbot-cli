#!/usr/bin/env node
"use strict";

var path = require('path');

var modulesToCompile = function modulesToCompile(modules) {
  return new RegExp("^((?!node_modules).)*$|(".concat(modules.join('|'), ")(?!/node_modules)"));
};

var ifDoesntMatch = function ifDoesntMatch(pattern) {
  return function (input) {
    return !pattern.test(input);
  };
};

var resolvePath = function resolvePath(p) {
  return path.resolve(__dirname, "../../node_modules/babel-".concat(p));
};

require("@babel/register")({
  presets: [[resolvePath('preset-env'), {
    "targets": {
      "node": "current"
    }
  }]],
  ignore: ifDoesntMatch(modulesToCompile(['newbot-formats'])),
  plugins: [resolvePath('plugin-transform-object-rest-spread'), [resolvePath("plugin-inline-import"), {
    "extensions": [".converse"]
  }]],
  cache: false
});

require("./main");