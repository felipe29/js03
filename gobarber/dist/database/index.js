"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _sequelize = require('sequelize'); var _sequelize2 = _interopRequireDefault(_sequelize);
var _mongoose = require('mongoose'); var _mongoose2 = _interopRequireDefault(_mongoose);
var _User = require('../app/models/User'); var _User2 = _interopRequireDefault(_User);
var _Files = require('../app/models/Files'); var _Files2 = _interopRequireDefault(_Files);
var _Appointments = require('../app/models/Appointments'); var _Appointments2 = _interopRequireDefault(_Appointments);
var _database = require('../config/database'); var _database2 = _interopRequireDefault(_database);

const models = [_User2.default, _Files2.default, _Appointments2.default];
class Database {
  constructor() {
    this.init();
    this.mongo();
  }

  init() {
    this.connection = new (0, _sequelize2.default)(_database2.default);
    models.map(model => model.init(this.connection));
    models.map(
      model => model.associate && model.associate(this.connection.models)
    );
  }

  mongo() {
    this.mongoConnection = _mongoose2.default.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
    });
  }
}

exports. default = new Database();
