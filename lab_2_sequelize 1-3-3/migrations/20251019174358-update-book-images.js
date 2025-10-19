"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Обновляем ссылки на изображения для новых книг
    const updates = [
      { id: 7, image: "book7.jpg" }, // Гордость и предубеждение
      { id: 8, image: "book8.jpg" }, // Джейн Эйр
      { id: 9, image: "book9.jpg" }, // Анна Каренина
      { id: 10, image: "book10.jpg" }, // Преступление и наказание
      { id: 11, image: "book11.jpg" }, // Мастер и Маргарита
      { id: 12, image: "book12.jpg" }, // Братья Карамазовы
      { id: 13, image: "book13.jpg" }, // 1984
      { id: 14, image: "book14.jpg" }, // Дюна
      { id: 15, image: "book15.jpg" }, // Война миров
      { id: 16, image: "book16.jpg" }, // Солярис
      { id: 17, image: "book17.jpg" }, // Стив Джобс
      { id: 18, image: "book18.jpg" }, // Илон Маск
      { id: 19, image: "book19.jpg" }, // Леонардо да Винчи
      { id: 20, image: "book20.jpg" }, // Властелин колец
      { id: 21, image: "book21.jpg" }, // Граф Монте-Кристо
      { id: 22, image: "book22.jpg" }, // Три мушкетера
      { id: 23, image: "book23.jpg" }, // Война и мир
      { id: 24, image: "book24.jpg" }, // Отцы и дети
      { id: 25, image: "book25.jpg" }, // Ромео и Джульетта
    ];

    // Выполняем обновления по одной записи
    for (const update of updates) {
      await queryInterface.bulkUpdate(
        "books",
        {
          image: update.image,
          updatedAt: new Date(),
        },
        { id: update.id }
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // В случае отката возвращаем старые значения
    const rollbacks = [
      { id: 7, image: "book1.jpg" },
      { id: 8, image: "book2.jpg" },
      { id: 9, image: "book3.jpg" },
      { id: 10, image: "book4.jpg" },
      { id: 11, image: "book5.jpg" },
      { id: 12, image: "book6.jpg" },
      { id: 13, image: "book1.jpg" },
      { id: 14, image: "book2.jpg" },
      { id: 15, image: "book3.jpg" },
      { id: 16, image: "book4.jpg" },
      { id: 17, image: "book5.jpg" },
      { id: 18, image: "book6.jpg" },
      { id: 19, image: "book1.jpg" },
      { id: 20, image: "book2.jpg" },
      { id: 21, image: "book3.jpg" },
      { id: 22, image: "book4.jpg" },
      { id: 23, image: "book5.jpg" },
      { id: 24, image: "book6.jpg" },
      { id: 25, image: "book1.jpg" },
    ];

    for (const rollback of rollbacks) {
      await queryInterface.bulkUpdate(
        "books",
        {
          image: rollback.image,
          updatedAt: new Date(),
        },
        { id: rollback.id }
      );
    }
  },
};
