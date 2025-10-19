"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "authors",
      [
        {
          id: 7,
          name: "Джейн Остин",
          bio: "Английская писательница, автор романов о нравах английского дворянства",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          name: "Шарлотта Бронте",
          bio: 'Английская писательница, автор романа "Джейн Эйр"',
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          name: "Лев Толстой",
          bio: "Русский писатель, философ, просветитель, публицист",
          authorType: "russian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 10,
          name: "Федор Достоевский",
          bio: "Русский писатель, мыслитель, философ и публицист",
          authorType: "russian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          name: "Михаил Булгаков",
          bio: "Русский писатель, драматург, театральный режиссёр и актёр",
          authorType: "russian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          name: "Джордж Оруэлл",
          bio: "Английский писатель и публицист, автор антиутопий",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 13,
          name: "Фрэнк Херберт",
          bio: 'Американский писатель-фантаст, автор саги "Дюна"',
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 14,
          name: "Герберт Уэллс",
          bio: "Английский писатель и публицист, автор научно-фантастических романов",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 15,
          name: "Станислав Лем",
          bio: "Польский писатель-фантаст, футуролог, философ",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 16,
          name: "Уолтер Айзексон",
          bio: "Американский писатель, биограф, автор биографий выдающихся личностей",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 17,
          name: "Джон Толкин",
          bio: "Английский писатель, лингвист, создатель Средиземья",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 18,
          name: "Александр Дюма",
          bio: "Французский писатель, автор приключенческих романов",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 19,
          name: "Иван Тургенев",
          bio: "Русский писатель-реалист, поэт, публицист, драматург",
          authorType: "russian",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 20,
          name: "Уильям Шекспир",
          bio: "Английский поэт и драматург, величайший писатель в истории",
          authorType: "foreign",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "authors",
      {
        id: {
          [Sequelize.Op.in]: [
            7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          ],
        },
      },
      {}
    );
  },
};
