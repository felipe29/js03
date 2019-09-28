import Event from '../models/Event';

class OrganizerController {
  async index(req, res) {
    const { userId } = req;
    const events = await Event.findAll({
      where: {
        organizer_id: userId,
      },
    });

    return res.json(events);
  }
}

export default new OrganizerController();
