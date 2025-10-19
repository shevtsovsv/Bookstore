'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Назначаем издательства существующим книгам
    await queryInterface.bulkUpdate('books', 
      { publisherId: 1 }, // Питер
      { id: [1, 2] } // Унесённые ветром, Гроза
    );

    await queryInterface.bulkUpdate('books', 
      { publisherId: 2 }, // Эксмо
      { id: [3, 5] } // Море и звезды, Маленький принц
    );

    await queryInterface.bulkUpdate('books', 
      { publisherId: 3 }, // АСТ
      { id: [4, 6] } // Человек-амфибия, Великий Гэтсби
    );
  },

  async down (queryInterface, Sequelize) {
    // Убираем назначенные издательства
    await queryInterface.bulkUpdate('books', 
      { publisherId: null }, 
      {} // для всех записей
    );
  }
};
