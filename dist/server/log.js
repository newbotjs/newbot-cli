"use strict";

var packages = require('../../package.json');

var stream = require('stream');

var os = require('os');

module.exports = function (app, options) {
  app.get('/log/:index/download', function (req, res, next) {
    var index = req.params.index;
    var logs = global.logs[index];

    var serialize = function serialize(val) {
      var clone = Object.assign({}, val);
      clone.user = clone.level = clone.namespace = clone.date = undefined;
      return clone;
    };

    var json = function json(val) {
      return JSON.stringify(val, null, 2);
    };

    var fileContents = "\n# Versions\n- NewBot Frawemork: ".concat(options.Converse.version, "\n- NewBot CLI :  ").concat(packages.version, "\n\n# OS\n- Platform : ").concat(os.platform(), "\n- Arch : ").concat(os.arch(), "\n\n# Path\n").concat(options.path, "\n\n# Trace\n- Index : ").concat(index, "\n");

    for (var i = 0; i < logs.length; i++) {
      var log = logs[i];
      var item = JSON.parse(log.val);
      fileContents += "\n## Step ".concat(i + 1, "\n- Date : ").concat(log.date, "\n- Type : ").concat(log.type, "\n- Skill : ").concat(item.namespace, "\n- Function : ").concat(item.level, "\n- User : ").concat(item.user.id, "\n- Platform : ").concat(item.platform, "\n\n### User\n\n```json\n").concat(json(item.user), "\n```\n\n### Log\n\n```json\n").concat(json(serialize(item)), "\n```\n");
    }

    var readStream = new stream.PassThrough();
    var fileName = 'newbot_log_' + index + '_' + new Date().toJSON() + '.md';
    readStream.end(fileContents);
    res.set('Content-disposition', 'attachment; filename=' + fileName);
    res.set('Content-Type', 'text/plain');
    readStream.pipe(res);
  });
};