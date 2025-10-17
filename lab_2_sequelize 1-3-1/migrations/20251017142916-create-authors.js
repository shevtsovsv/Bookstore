'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('authors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Биография автора'
      },
      authorType: {
        type: Sequelize.ENUM('russian', 'foreign'),
        allowNull: false,
        defaultValue: 'russian',
        comment: 'Тип автора: российский или зарубежный'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Создаем индекс для имени автора
    await queryInterface.addIndex('authors', ['name']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('authors');
  }
};
