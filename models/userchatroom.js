'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UserChatRoom extends Model {
    static associate(models) {
      UserChatRoom.belongsTo(models.UserInfo,{
        onDelete : 'cascade',
        foreignKey : "user_id"
      })
      UserChatRoom.belongsTo(models.ChatRoom,{
        onDelete : 'cascade',
        foreignKey : "chat_room_id"
      })
    }
  }
  UserChatRoom.init({
    room_name: DataTypes.TEXT,
    unread_num: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'UserChatRoom',
  });
  return UserChatRoom;

};