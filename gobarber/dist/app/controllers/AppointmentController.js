"use strict"; function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }Object.defineProperty(exports, "__esModule", {value: true});var _datefns = require('date-fns');
var _pt = require('date-fns/locale/pt'); var _pt2 = _interopRequireDefault(_pt);
var _Appointments = require('../models/Appointments'); var _Appointments2 = _interopRequireDefault(_Appointments);
var _AppointmentVallidation = require('./validations/AppointmentVallidation'); var _AppointmentVallidation2 = _interopRequireDefault(_AppointmentVallidation);
var _User = require('../models/User'); var _User2 = _interopRequireDefault(_User);
var _Files = require('../models/Files'); var _Files2 = _interopRequireDefault(_Files);
var _Notification = require('../schemas/Notification'); var _Notification2 = _interopRequireDefault(_Notification);
var _Queue = require('../../lib/Queue'); var _Queue2 = _interopRequireDefault(_Queue);
var _CancellationMail = require('../jobs/CancellationMail'); var _CancellationMail2 = _interopRequireDefault(_CancellationMail);

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await _Appointments2.default.findAll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancellable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: _User2.default,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: _Files2.default, as: 'avatar', attributes: ['url', 'path'] },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    if (!(await _AppointmentVallidation2.default.validateAppointment().isValid(req.body))) {
      return res.status(400).json({
        error: 'Your appointment is invalid, please send date and provider id',
      });
    }

    const { provider_id, date } = req.body;
    const isProvider = await _User2.default.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(400)
        .json({ error: 'you can only create appointment with providers' });
    }
    const hourStart = _datefns.startOfHour.call(void 0, _datefns.parseISO.call(void 0, date));

    if (_datefns.isBefore.call(void 0, hourStart, new Date())) {
      return res.status(400).json({ error: 'Date past not permited' });
    }

    const checkAvalialable = await _Appointments2.default.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvalialable) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await _Appointments2.default.create({
      date,
      user_id: req.userId,
      provider_id,
    });

    const user = await _User2.default.findByPk(req.userId);
    const formattedDate = _datefns.format.call(void 0, 
      hourStart,
      "'dia' dd ' de ' MMMM', às' H:mm'h'",
      { locale: _pt2.default }
    );
    await _Notification2.default.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await _Appointments2.default.findByPk(req.params.id, {
      include: [
        { model: _User2.default, as: 'provider', attributes: ['name', 'email'] },
        { model: _User2.default, as: 'user', attributes: ['name'] },
      ],
    });

    if (!appointment) {
      return res.status(400).json({ error: 'appointment not found' });
    }
    if (appointment.user_id !== req.userId) {
      return res.status(400).json({
        error: "You don't have permission to cancel this appointment",
      });
    }
    if (appointment.canceled_at !== null) {
      return res.status(400).json({
        error: 'Appointment is canceled',
      });
    }

    const dateWithSub = _datefns.subHours.call(void 0, appointment.date, 2);

    if (_datefns.isBefore.call(void 0, dateWithSub, new Date())) {
      return res.status(400).json({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }
    appointment.canceled_at = new Date();
    await appointment.save();
    await _Queue2.default.add(_CancellationMail2.default.key, {
      appointment,
    });

    return res.json(appointment);
  }
}
exports. default = new AppointmentController();
