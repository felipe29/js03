"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _UserValidation = require('./validations/UserValidation'); var _UserValidation2 = _interopRequireDefault(_UserValidation);
var _Files = require('../models/Files'); var _Files2 = _interopRequireDefault(_Files);

class UserController {
  async store(req, res) {
    // Valida se a requesição é valida
    if (!(await _UserValidation2.default.validUserSchemaOnCreate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    // Verifica se um usuário existe com base no email
    const userExists = await _User2.default.findOne({
      where: { email: req.body.email },
    });
    // Caso exista retorna erro
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Caso contrario, salva o usuário no banco de dados
    const { id, name, email, provider } = await _User2.default.create(req.body);
    return res.json({ id, name, provider, email });
  }

  async update(req, res) {
    const { email, oldPassword, avatar_id } = req.body;

    if (avatar_id) {
      const fileAvatar = await _Files2.default.findOne({ where: { id: avatar_id } });

      if (!fileAvatar) {
        res.status(401).json({ error: 'Avatar ID is not fount' });
      }
    }

    const user = await _User2.default.findByPk(req.userId);
    if (!(await _UserValidation2.default.validUserOnUpdate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    if (email !== undefined && email !== user.email) {
      const userExists = await _User2.default.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    console.log(email);
    const { id, name, provider, avatar } = await _User2.default.findByPk(req.userId, {
      include: [
        { model: _Files2.default, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });
    return res.status(200).json({ id, name, email, provider, avatar });
  }
}

exports. default = new UserController();
