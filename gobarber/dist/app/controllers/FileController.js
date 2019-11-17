"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _Files = require('../models/Files'); var _Files2 = _interopRequireDefault(_Files);

class FileController {
  async store(req, res) {
    const { originalname: name, filename: path } = req.file;
    const file = await _Files2.default.create({ name, path });
    return res.json(file);
  }
}
exports. default = new FileController();
