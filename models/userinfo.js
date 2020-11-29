'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserInfo extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      UserInfo.hasMany(models.PostItem,{
        onDelete: 'cascade'
      });
      UserInfo.hasMany(models.LikePostItem,{
        onDelete: 'cascade'
      });
      UserInfo.hasMany(models.ViewPostItem,{
        onDelete: 'cascade'
      });
      UserInfo.hasMany(models.Reply,{
        onDelete: 'cascade'
      });
    }
  }

  UserInfo.init({
    user_id: DataTypes.STRING,
    password: DataTypes.STRING,
    email: DataTypes.STRING,
    name: DataTypes.STRING,
    message: DataTypes.STRING,
    profile_image: DataTypes.STRING,
    back_image: DataTypes.STRING,
    fcm_token: DataTypes.TEXT,
    ip: DataTypes.STRING,
    salt: DataTypes.STRING,
    secretToken : DataTypes.STRING,
    confirmed: DataTypes.BOOLEAN
  }, {
    sequelize,
    modelName: 'UserInfo',
  });
  return UserInfo;
};