'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('book_authors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'authors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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

    // Создаем составной уникальный индекс для пары (bookId, authorId)
    await queryInterface.addIndex('book_authors', ['bookId', 'authorId'], {
      unique: true,
      name: 'unique_book_author'
    });

    // Создаем индексы для внешних ключей
    await queryInterface.addIndex('book_authors', ['bookId']);
    await queryInterface.addIndex('book_authors', ['authorId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('book_authors');
  }
};
