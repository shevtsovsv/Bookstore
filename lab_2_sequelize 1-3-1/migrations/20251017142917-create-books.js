'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      priceCategory: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Ценовая категория для фильтрации'
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Путь к изображению обложки'
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fullDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Количество на складе'
      },
      popularity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Счетчик популярности (количество покупок)'
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

    // Создаем индексы для оптимизации запросов
    await queryInterface.addIndex('books', ['categoryId']);
    await queryInterface.addIndex('books', ['priceCategory']);
    await queryInterface.addIndex('books', ['popularity']);
    await queryInterface.addIndex('books', ['stock']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('books');
  }
};
