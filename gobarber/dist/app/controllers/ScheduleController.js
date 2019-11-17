"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _datefns = require('date-fns');
var _sequelize = require('sequelize');
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Appointments = require('../models/Appointments'); var _Appointments2 = _interopRequireDefault(_Appointments);

class SchedulerController {
  async index(req, res) {
    const { date } = req.query;
    const parsedDate = _datefns.parseISO.call(void 0, date);
    const checkUserProvider = _User2.default.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return res.status(400).json({ error: 'User is not a provider' });
    }

    const appointment = await _Appointments2.default.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: { [_sequelize.Op.between]: [_datefns.startOfDay.call(void 0, parsedDate), _datefns.endOfDay.call(void 0, parsedDate)] },
      },
      include: [{ model: _User2.default, as: 'user', attributes: ['name'] }],
    });

    return res.json(appointment);
  }
}

exports. default = new SchedulerController();
