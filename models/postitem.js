'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PostItems extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      PostItems.belongsTo(models.UserInfo, {
        onDelete: 'cascade'
      });
      PostItems.belongsTo(models.Bulletin,{
        onDelete: 'cascade'
      })

      PostItems.hasMany(models.Reply,{
        onDelete: 'cascade'
      })
      PostItems.hasMany(models.LikePostItem,{
        onDelete: 'cascade'
      })
      PostItems.hasMany(models.ViewPostItem,{
        onDelete: 'cascade'
      })
    }
  }

  PostItems.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'PostItem',
  });
  return PostItems;
};

/**
 * sequelize model:create --name PostItem --attributes title:TEXT,content:TEXT,writer:STRING,writerId:INTEGER, postId:INTEGER
 * */