'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('books', 'publisherId', {
      type: Sequelize.INTEGER,
      allowNull: true, // Разрешаем null для существующих записей
      references: {
        model: 'publishers',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Добавляем индекс для оптимизации
    await queryInterface.addIndex('books', ['publisherId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeIndex('books', ['publisherId']);
    await queryInterface.removeColumn('books', 'publisherId');
  }
};
