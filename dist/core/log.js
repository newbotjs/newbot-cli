"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = require("winston");

var combine = _winston.format.combine,
    timestamp = _winston.format.timestamp,
    json = _winston.format.json,
    prettyPrint = _winston.format.prettyPrint;
var directory = process.cwd();

var _default = (0, _winston.createLogger)({
  format: combine(timestamp(), json(), prettyPrint()),
  transports: [new _winston.transports.File({
    filename: directory + '/.logs/errors.log',
    level: 'error'
  })]
});

exports.default = _default;