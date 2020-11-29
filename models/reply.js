'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Reply extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    /**
     * https://stackoverflow.com/questions/24747652/sequelize-self-references-has-many-relation
     * nested include를 위한 associate 설정방법
     */
    static associate(models) {
      // define association here
      Reply.hasMany(models.Reply,{
        as : 'SubReply',
        onDelete: 'cascade'
      });

      Reply.belongsTo(models.Reply,{
        onDelete: 'cascade'
      })
      Reply.belongsTo(models.UserInfo,{
        onDelete: 'cascade'
      })
    }
  };
  Reply.init({
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'Reply',
  });
  return Reply;
};