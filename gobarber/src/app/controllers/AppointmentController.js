import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Appointments from '../models/Appointments';
import Val from './validations/AppointmentVallidation';
import User from '../models/User';
import Files from '../models/Files';
import Notification from '../schemas/Notification';
import Queue from '../../lib/Queue';
import CancellationMail from '../jobs/CancellationMail';

class AppointmentController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const appointments = await Appointments.findAlll({
      where: { user_id: req.userId, canceled_at: null },
      order: ['date'],
      attributes: ['id', 'date', 'past', 'cancellable'],
      limit: 20,
      offset: (page - 1) * 20,
      include: [
        {
          model: User,
          as: 'provider',
          attributes: ['id', 'name'],
          include: [
            { model: Files, as: 'avatar', attributes: ['url', 'path'] },
          ],
        },
      ],
    });

    return res.json(appointments);
  }

  async store(req, res) {
    if (!(await Val.validateAppointment().isValid(req.body))) {
      return res.status(400).json({
        error: 'Your appointment is invalid, please send date and provider id',
      });
    }

    const { provider_id, date } = req.body;
    const isProvider = await User.findOne({
      where: { id: provider_id, provider: true },
    });

    if (!isProvider) {
      return res
        .status(400)
        .json({ error: 'you can only create appointment with providers' });
    }
    const hourStart = startOfHour(parseISO(date));

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Date past not permited' });
    }

    const checkAvalialable = await Appointments.findOne({
      where: { provider_id, canceled_at: null, date: hourStart },
    });

    if (checkAvalialable) {
      return res
        .status(400)
        .json({ error: 'Appointment date is not available' });
    }

    const appointment = await Appointments.create({
      date,
      user_id: req.userId,
      provider_id,
    });

    const user = await User.findByPk(req.userId);
    const formattedDate = format(
      hourStart,
      "'dia' dd ' de ' MMMM', às' H:mm'h'",
      { locale: pt }
    );
    await Notification.create({
      content: `Novo agendamento de ${user.name} para o ${formattedDate}`,
      user: provider_id,
    });

    return res.json(appointment);
  }

  async delete(req, res) {
    const appointment = await Appointments.findByPk(req.params.id, {
      include: [
        { model: User, as: 'provider', attributes: ['name', 'email'] },
        { model: User, as: 'user', attributes: ['name'] },
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

    const dateWithSub = subHours(appointment.date, 2);

    if (isBefore(dateWithSub, new Date())) {
      return res.status(400).json({
        error: 'You can only cancel appointments 2 hours in advance',
      });
    }
    appointment.canceled_at = new Date();
    await appointment.save();
    await Queue.add(CancellationMail.key, {
      appointment,
    });

    return res.json(appointment);
  }
}
export default new AppointmentController();
