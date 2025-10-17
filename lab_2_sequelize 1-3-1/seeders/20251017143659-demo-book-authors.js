'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('book_authors', [
      {
        id: 1,
        bookId: 1,
        authorId: 1, // Унесённые ветром - Маргарет Митчелл
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        bookId: 2,
        authorId: 2, // Гроза - Александр Островский
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        bookId: 3,
        authorId: 3, // Море и звезды - Алексей Бирюлин
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        bookId: 4,
        authorId: 4, // Человек-амфибия - Александр Беляев
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        bookId: 5,
        authorId: 5, // Маленький принц - Антуан де Сент-Экзюпери
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        bookId: 6,
        authorId: 6, // Великий Гэтсби - Фрэнсис Скотт Фицджеральд
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('book_authors', null, {});
  }
};
