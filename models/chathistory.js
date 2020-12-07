'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ChatHistory extends Model {
    static associate(models) {
      ChatHistory.belongsTo(models.ChatRoom,{
        onDelete : 'cascade',
        foreignKey : "chat_room_id"
      })

      ChatHistory.belongsTo(models.UserInfo,{
        onDelete : 'cascade',
        foreignKey : "chat_user_id"
      })
    }
  }
  ChatHistory.init({
    chat_room_id: DataTypes.INTEGER,
    chat_user_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    read_people: DataTypes.TEXT,
    time: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'ChatHistory',
  });
  return ChatHistory;

};