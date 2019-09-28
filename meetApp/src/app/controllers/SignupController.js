import { isBefore } from 'date-fns';
import Event from '../models/Event';
import User from '../models/User';
import Signup from '../models/signup';
import Queue from '../../lib/Queue';
import SignUpMail from '../jobs/SignUpMail';

class SigupController {
  async store(req, res) {
    const { userId } = req;
    const { eventId } = req.params;

    const event = await Event.findByPk(eventId, { include: ['owner'] });
    const user = await User.findByPk(userId);
    if (!event) {
      res.status(404).json({ error: 'Event not found' });
    }

    if (event.organizer_id === userId) {
      return res
        .status(400)
        .json({ error: 'you cannot register for the event itself' });
    }

    if (isBefore(event.date, new Date())) {
      res
        .status(400)
        .json({ error: 'you cannot register for the event past  date' });
    }

    const checkExists = await Signup.findOne({
      where: { event_id: eventId, user_id: userId },
    });

    if (checkExists) {
      return res
        .status(400)
        .json({ error: 'you are already signup in the event' });
    }

    const subscription = await Signup.create({
      user_id: userId,
      event_id: eventId,
      date: new Date(),
    });
    await Queue.add(SignUpMail.key, {
      event,
      user,
    });

    return res.json(subscription);
  }

  async index(req, res) {
    return res.json();
  }
}
export default new SigupController();
