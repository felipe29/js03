import { startOfDay, endOfDay, parseISO } from 'date-fns';
import { Op } from 'sequelize';
import User from '../models/User';
import Appointments from '../models/Appointments';

class SchedulerController {
  async index(req, res) {
    const { date } = req.query;
    const parsedDate = parseISO(date);
    const checkUserProvider = User.findOne({
      where: {
        id: req.userId,
        provider: true,
      },
    });
    if (!checkUserProvider) {
      return res.status(400).json({ error: 'User is not a provider' });
    }

    const appointment = await Appointments.findAll({
      where: {
        provider_id: req.userId,
        canceled_at: null,
        date: { [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)] },
      },
      include: [{ model: User, as: 'user', attributes: ['name'] }],
    });

    return res.json(appointment);
  }
}

export default new SchedulerController();
