'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ViewPostItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      ViewPostItem.belongsTo(models.UserInfo,{
        onDelete: 'cascade',
        foreignKey:{
          allowNull:true
        }
      });

      ViewPostItem.belongsTo(models.PostItem,{
        onDelete: 'cascade',
        foreignKey:{
          allowNull:true
        }
      });
    }
  };
  ViewPostItem.init({

  }, {
    sequelize,
    modelName: 'ViewPostItem',
  });
  return ViewPostItem;
};