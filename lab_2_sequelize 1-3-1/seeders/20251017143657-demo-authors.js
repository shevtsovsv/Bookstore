'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('authors', [
      {
        id: 1,
        name: 'Маргарет Митчелл',
        bio: 'Американская писательница, автор романа "Унесённые ветром"',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Александр Островский',
        bio: 'Русский драматург, создатель репертуара русского театра',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Алексей Бирюлин',
        bio: 'Современный российский писатель',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Александр Беляев',
        bio: 'Русский и советский писатель-фантаст, один из основоположников советской научной фантастики',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Антуан де Сент-Экзюпери',
        bio: 'Французский писатель, поэт, эссеист и профессиональный лётчик',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Фрэнсис Скотт Фицджеральд',
        bio: 'Американский писатель, крупнейший представитель "потерянного поколения" в литературе',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('authors', null, {});
  }
};
