"use strict";

var Transpiler = require('newbot/src/transpiler/lexer');

module.exports = function loader(code, map, meta) {
  var transpiler = new Transpiler(code);
  var obj = transpiler.run();
  var compiled = JSON.stringify(obj);
  code = code.replace(/`/g, '\\`');
  code = "\nexport default {\ncode: `".concat(code, "`,\ncompiled: ").concat(compiled, "\n}");
  return code;
};