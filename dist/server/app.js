"use strict";

var express = require('express');

var bodyParser = require('body-parser');

module.exports = function (app, socket, files) {
  app.use(bodyParser.json({
    verify: function verify(req, res, buf) {
      req.rawBody = buf.toString();
    }
  }));
  app.use(function (req, res, next) {
    var oldSend = res.send;

    res.send = function () {
      if (socket) {
        socket.emit('req', {
          headers: req.headers,
          url: req.url,
          method: req.method,
          body: req.body
        });
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      oldSend.apply(res, args);
    };

    next();
  });
  app.get('/logs', function (req, res, next) {
    res.json(global.logs);
  });
  app.get('/remote/skill.js', function (req, res, next) {
    if (!global.code) {
      var err = new Error('Not Found');
      err.code = 404;
      return next(err);
    }

    res.send(global.code);
  });
  app.get('/remote/api.js', function (req, res, next) {
    if (!global.codeApi) {
      var err = new Error('Not Found');
      err.code = 404;
      return next(err);
    }

    res.send(global.codeApi);
  });
  app.get('/skill.js', function (req, res) {
    res.sendFile("".concat(files, "/.build/browser.js"));
  });
  app.get('/newbot.js', function (req, res) {
    var dir = __dirname.replace('/src/server', '');

    res.sendFile("".concat(dir, "/node_modules/newbot/dist/converse.js"));
  });
  /*  app.get('/', (req, res, next) => {
        res.sendFile(__dirname + '/public/index.html')
    })*/

  var _static = (__dirname + '/public').replace('dist', 'src');

  app.use(express.static(_static));
  app.use(function (err, req, res, next) {
    res.status(err.code || 500).end(err.message);
  });
};