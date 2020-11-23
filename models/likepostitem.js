'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class LikePostItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      LikePostItem.belongsTo(models.UserInfo,{
        onDelete: 'cascade',
        foreignKey:{
          allowNull:true
        }
      });

      LikePostItem.belongsTo(models.PostItem,{
        onDelete: 'cascade',
        foreignKey:{
          allowNull:true
        }
      });
    }
  };
  LikePostItem.init({

  }, {
    sequelize,
    modelName: 'LikePostItem',
  });
  return LikePostItem;
};