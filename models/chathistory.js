'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatHistory = sequelize.define('ChatHistory', {
    chat_room_id: DataTypes.INTEGER,
    chat_user_id: DataTypes.INTEGER,
    content: DataTypes.TEXT,
    read_people: DataTypes.TEXT,
    time: DataTypes.DATE
  }, {});
  ChatHistory.associate = function(models) {
    // associations can be defined here
  };
  return ChatHistory;
};