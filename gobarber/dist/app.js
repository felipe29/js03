"use strict"; function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { newObj[key] = obj[key]; } } } newObj.default = obj; return newObj; } } function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _express = require('express'); var _express2 = _interopRequireDefault(_express);
require('dotenv/config');
require('express-async-errors');
var _youch = require('youch'); var _youch2 = _interopRequireDefault(_youch);
var _path = require('path'); var _path2 = _interopRequireDefault(_path);
var _node = require('@sentry/node'); var Sentry = _interopRequireWildcard(_node);
var _routes = require('./routes'); var _routes2 = _interopRequireDefault(_routes);
require('./database');
var _sentry = require('./config/sentry'); var _sentry2 = _interopRequireDefault(_sentry);
var _cors = require('cors'); var _cors2 = _interopRequireDefault(_cors);

class App {
  constructor() {
    this.server = _express2.default.call(void 0, );
    Sentry.init(_sentry2.default);
    this.middlewares();
    this.routes();
    this.exceptionHandler();
  }

  middlewares() {
    this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(_cors2.default.call(void 0, ));
    this.server.use(_express2.default.json());

    this.server.use(
      '/files',
      _express2.default.static(_path2.default.resolve(__dirname, '..', 'temp', 'upload'))
    );
  }

  routes() {
    this.server.use(_routes2.default);
    this.server.use(Sentry.Handlers.errorHandler());
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const error = await new (0, _youch2.default)(err, req).toJSON();
        return res.status(500).json(error);
      }
      return res.status(500).json({ error: 'Internal server error' });
    });
  }
}

exports. default = new App().server;
