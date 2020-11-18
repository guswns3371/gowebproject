'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Post extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Post.belongsTo(models.UserInfo, {
        foreignKey: "writer_id"
      });
      Post.hasMany(models.Reply);
    }
  };
  Post.init({
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: DataTypes.TEXT,
    writer_id: DataTypes.INTEGER,
    like_cnt: {
      type: DataTypes.INTEGER,
      defaultValue : 0
    }
  }, {
    sequelize,
    modelName: 'Post',
  });
  return Post;
};

/**
 * sequelize model:create --name Post --attributes title:TEXT,content:TEXT,writer:STRING,writerId:INTEGER
 * */