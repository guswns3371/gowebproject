'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatRoom extends Model {
    static associate(models) {
      ChatRoom.hasMany(models.ChatHistory,{
        onDelete: 'cascade'
      });

      ChatRoom.belongsToMany(models.UserInfo,{
        through : 'UserChatRoom',
        foreignKey : "chat_room_id",
        onDelete: 'cascade'
      });
    }
  }
  ChatRoom.init({
    people: DataTypes.TEXT,
    last_content: DataTypes.TEXT,
    last_time : DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChatRoom',
  });
  return ChatRoom;

};