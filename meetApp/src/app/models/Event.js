import Sequelize, { Model } from 'sequelize';

class Event extends Model {
  static init(sequelize) {
    super.init(
      {
        title: Sequelize.STRING,
        description: Sequelize.STRING,
        location: Sequelize.STRING,
        date: Sequelize.DATE,
      },
      { sequelize }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.File, { foreignKey: 'banner_id', as: 'file' });
    this.belongsTo(models.User, {
      foreignKey: 'organizer_id',
      as: 'owner',
    });
  }
}
export default Event;
