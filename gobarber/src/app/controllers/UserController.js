import User from '../models/User';
import UserValidation from './validations/UserValidation';
import Files from '../models/Files';

class UserController {
  async store(req, res) {
    // Valida se a requesição é valida
    if (!(await UserValidation.validUserSchemaOnCreate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    // Verifica se um usuário existe com base no email
    const userExists = await User.findOne({
      where: { email: req.body.email },
    });
    // Caso exista retorna erro
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }
    // Caso contrario, salva o usuário no banco de dados
    const { id, name, email, provider } = await User.create(req.body);
    return res.json({ id, name, provider, email });
  }

  async update(req, res) {
    const { email, oldPassword, avatar_id } = req.body;

    if (avatar_id) {
      const fileAvatar = await Files.findOne({ where: { id: avatar_id } });

      if (!fileAvatar) {
        res.status(401).json({ error: 'Avatar ID is not fount' });
      }
    }

    const user = await User.findByPk(req.userId);
    if (!(await UserValidation.validUserOnUpdate().isValid(req.body))) {
      return res.status(400).json({ error: 'Validation faild' });
    }
    if (email !== undefined && email !== user.email) {
      const userExists = await User.findOne({ where: { email } });
      if (userExists) {
        return res.status(400).json({ error: 'User already exists' });
      }
    }
    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match' });
    }

    await user.update(req.body);

    console.log(email);
    const { id, name, provider, avatar } = await User.findByPk(req.userId, {
      include: [
        { model: Files, as: 'avatar', attributes: ['id', 'path', 'url'] },
      ],
    });
    return res.status(200).json({ id, name, email, provider, avatar });
  }
}

export default new UserController();
