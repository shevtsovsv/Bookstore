"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Добавляем связи между книгами и авторами, проверяя что они не существуют
    const relations = [
      { bookId: 7, authorId: 7 }, // Гордость и предубеждение - Джейн Остин
      { bookId: 8, authorId: 8 }, // Джейн Эйр - Шарлотта Бронте
      { bookId: 9, authorId: 9 }, // Анна Каренина - Лев Толстой
      { bookId: 10, authorId: 10 }, // Преступление и наказание - Федор Достоевский
      { bookId: 11, authorId: 11 }, // Мастер и Маргарита - Михаил Булгаков
      { bookId: 12, authorId: 10 }, // Братья Карамазовы - Федор Достоевский
      { bookId: 13, authorId: 12 }, // 1984 - Джордж Оруэлл
      { bookId: 14, authorId: 13 }, // Дюна - Фрэнк Херберт
      { bookId: 15, authorId: 14 }, // Война миров - Герберт Уэллс
      { bookId: 16, authorId: 15 }, // Солярис - Станислав Лем
      { bookId: 17, authorId: 16 }, // Стив Джобс - Уолтер Айзексон
      { bookId: 18, authorId: 16 }, // Илон Маск - Уолтер Айзексон
      { bookId: 19, authorId: 16 }, // Леонардо да Винчи - Уолтер Айзексон
      { bookId: 20, authorId: 17 }, // Властелин колец - Джон Толкин
      { bookId: 21, authorId: 18 }, // Граф Монте-Кристо - Александр Дюма
      { bookId: 22, authorId: 18 }, // Три мушкетера - Александр Дюма
      { bookId: 23, authorId: 9 }, // Война и мир - Лев Толстой
      { bookId: 24, authorId: 19 }, // Отцы и дети - Иван Тургенев
      { bookId: 25, authorId: 20 }, // Ромео и Джульетта - Уильям Шекспир
    ];

    // Добавляем связи по одной, игнорируя дубли
    for (const relation of relations) {
      try {
        // Проверяем, существует ли уже такая связь
        const existing = await queryInterface.sequelize.query(
          `SELECT id FROM book_authors WHERE "bookId" = ${relation.bookId} AND "authorId" = ${relation.authorId}`,
          { type: queryInterface.sequelize.QueryTypes.SELECT }
        );

        // Если связи нет, добавляем её
        if (existing.length === 0) {
          await queryInterface.bulkInsert("book_authors", [
            {
              bookId: relation.bookId,
              authorId: relation.authorId,
              createdAt: new Date(),
              updatedAt: new Date(),
            },
          ]);
          console.log(
            `Добавлена связь: книга ${relation.bookId} -> автор ${relation.authorId}`
          );
        } else {
          console.log(
            `Связь уже существует: книга ${relation.bookId} -> автор ${relation.authorId}`
          );
        }
      } catch (error) {
        console.log(
          `Ошибка при добавлении связи книга ${relation.bookId} -> автор ${relation.authorId}:`,
          error.message
        );
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Удаляем добавленные связи
    const bookIds = [
      7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25,
    ];
    await queryInterface.bulkDelete("book_authors", {
      bookId: {
        [Sequelize.Op.in]: bookIds,
      },
    });
  },
};
