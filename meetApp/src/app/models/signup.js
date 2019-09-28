import Sequelize, { Model } from 'sequelize';

class signup extends Model {
  static init(sequelize) {
    super.init(
      {
        date: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.Event, { foreignKey: 'event_id', as: 'event' });
    this.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user',
    });
  }
}

export default signup;
