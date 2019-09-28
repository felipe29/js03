import User from '../models/User';
import UserValidation from './validations/UserValidation';

class UserController {
  async store(req, res) {
    if (!(await UserValidation.validUserSchemaOnCreate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });
    if (userExists) {
      return res.status(400).json({ error: 'user exists' });
    }
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({ id, name, email, provider });
  }

  async update(req, res) {
    if (!(await UserValidation.validUserOnUpdate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const { email, oldPassword } = req.body;
    const { id } = req;
    const user = await User.findByPk(id);
    if (email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'user exists' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(400).json({ error: 'Password does not match' });
    }
    const { name, provider } = await user.update(req.body);
    return res.json({ id, name, email, provider });
  }
}

export default new UserController();
