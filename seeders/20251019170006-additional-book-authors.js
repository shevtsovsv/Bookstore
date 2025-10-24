"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "book_authors",
      [
        // Гордость и предубеждение - Джейн Остин
        {
          bookId: 7,
          authorId: 7,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Джейн Эйр - Шарлотта Бронте
        {
          bookId: 8,
          authorId: 8,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Анна Каренина - Лев Толстой
        {
          bookId: 9,
          authorId: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Преступление и наказание - Федор Достоевский
        {
          bookId: 10,
          authorId: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Мастер и Маргарита - Михаил Булгаков
        {
          bookId: 11,
          authorId: 11,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Братья Карамазовы - Федор Достоевский
        {
          bookId: 12,
          authorId: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // 1984 - Джордж Оруэлл
        {
          bookId: 13,
          authorId: 12,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Дюна - Фрэнк Херберт
        {
          bookId: 14,
          authorId: 13,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Война миров - Герберт Уэллс
        {
          bookId: 15,
          authorId: 14,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Солярис - Станислав Лем
        {
          bookId: 16,
          authorId: 15,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Стив Джобс - Уолтер Айзексон
        {
          bookId: 17,
          authorId: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Илон Маск - Уолтер Айзексон
        {
          bookId: 18,
          authorId: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Леонардо да Винчи - Уолтер Айзексон
        {
          bookId: 19,
          authorId: 16,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Властелин колец - Джон Толкин
        {
          bookId: 20,
          authorId: 17,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Граф Монте-Кристо - Александр Дюма
        {
          bookId: 21,
          authorId: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Три мушкетера - Александр Дюма
        {
          bookId: 22,
          authorId: 18,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Война и мир - Лев Толстой
        {
          bookId: 23,
          authorId: 9,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Отцы и дети - Иван Тургенев
        {
          bookId: 24,
          authorId: 19,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Ромео и Джульетта - Уильям Шекспир
        {
          bookId: 25,
          authorId: 20,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "book_authors",
      {
        bookId: {
          [Sequelize.Op.in]: [
            7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25,
          ],
        },
      },
      {}
    );
  },
};
