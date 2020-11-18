'use strict';
module.exports = (sequelize, DataTypes) => {
  const ChatRoom = sequelize.define('ChatRoom', {
    people: DataTypes.TEXT,
    last_content: DataTypes.TEXT,
    last_time : DataTypes.DATE
  }, {});
  ChatRoom.associate = function(models) {
    // associations can be defined here
  };
  return ChatRoom;
};