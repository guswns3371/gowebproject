'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('UserInfos', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.STRING
      },
      password: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      message: {
        type: Sequelize.STRING
      },
      profile_image: {
        type: Sequelize.STRING
      },
      back_image: {
        type: Sequelize.STRING
      },
      fcm_token: {
        type: Sequelize.TEXT
      },
      ip: {
        type: Sequelize.STRING
      },
      salt: {
        type: Sequelize.STRING
      },
      secretToken: {
        type: Sequelize.STRING
      },
      confirmed: {
        type: Sequelize.BOOLEAN
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('UserInfos');
  }
};