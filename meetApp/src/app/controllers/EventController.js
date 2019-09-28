import { isBefore, parseISO, startOfDay, endOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Event from '../models/Event';
import Signup from '../models/signup';
import User from '../models/User';
import Validation from './validations/EventValidation';

class EventController {
  async store(req, res) {
    // 1º Firts, validation object recive on body request
    if (!(await Validation.validateOnCreate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    const { date, location, title, description, banner_id } = req.body;
    // 2ª Validate date, verify if date is past
    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Only date before date actual' });
    }
    // 3º Persist on database value from event
    const event = await Event.create({
      date,
      location,
      title,
      description,
      banner_id,
      organizer_id: req.userId,
    });

    return res.json({ event });
  }

  async update(req, res) {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId);

    if (!(await Validation.validateOnCreate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const { date, location, title, description, banner_id } = req.body;

    if (isBefore(parseISO(date), new Date())) {
      return res.status(400).json({ error: 'Only date before date actual' });
    }

    if (event.organizer_id !== req.userId) {
      return res.status(401).json({ error: 'Only user owner edit event' });
    }

    event.date = date;
    event.location = location;
    event.title = title;
    event.description = description;
    event.banner_id = banner_id;
    event.organizer_id = req.userId;
    await event.save(event);
    return res.json({ event });
  }

  async index(req, res) {
    const { date } = req.query;
    let { page = 1 } = req.query;
    const parsedDate = parseISO(date);
    if (Number.isNaN(page)) {
      page = 1;
    }

    if (!date) {
      return res.status(400).json({ error: 'Date not informed' });
    }

    const events = await Event.findAll({
      where: {
        date: { [Op.between]: [startOfDay(parsedDate), endOfDay(parsedDate)] },
      },
      limit: 10,
      offset: (page - 1) * 10,
    });

    return res.json(events);
  }

  async delete(req, res) {
    const { eventId } = req.params;
    const event = await Event.findByPk(eventId);
    const subscripts = await Signup.findAll({
      where: {
        event_id: eventId,
      },
      include: [
        { model: User, as: 'user', attributes: ['name', 'email'] },
        { model: Event, as: 'event', attributes: ['title'] },
      ],
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
    }
    if (event.organizer_id !== req.userId) {
      return res.status(401).json({ error: 'Only user owner delete event' });
    }
    await Event.destroy({ where: { id: event.id } });
    // subscripts.forEach(async function(element) {
    // await Queue.add(NotifyUserOnDeleteEvent.key, { element });
    // });
    return res.status(202).json(subscripts);
  }
}
export default new EventController();
