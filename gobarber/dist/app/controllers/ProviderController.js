"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Files = require('../models/Files'); var _Files2 = _interopRequireDefault(_Files);

class ProviderController {
  async index(req, res) {
    const providers = await _User2.default.findAll({
      where: { provider: true },
      attributes: ['id', 'name', 'email', 'avatar_id'],
      include: [
        {
          model: _Files2.default,
          as: 'avatar',
          attributes: ['name', 'url', 'path'],
        },
      ],
    });
    return res.json(providers);
  }
}

exports. default = new ProviderController();
