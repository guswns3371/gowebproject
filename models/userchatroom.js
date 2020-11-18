'use strict';
module.exports = (sequelize, DataTypes) => {
  const UserChatRoom = sequelize.define('UserChatRoom', {
    user_id: DataTypes.STRING,
    chat_room_id: DataTypes.STRING,
    room_name: DataTypes.TEXT,
    unread_num: DataTypes.INTEGER
  }, {});
  UserChatRoom.associate = function(models) {
    // associations can be defined here
  };
  return UserChatRoom;
};