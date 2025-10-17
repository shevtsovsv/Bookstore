'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Романтика',
        slug: 'romance',
        description: 'Романтические произведения о любви и отношениях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Драма',
        slug: 'drama',
        description: 'Драматические произведения с глубоким смыслом',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Биография',
        slug: 'bio',
        description: 'Биографические и документальные произведения',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Фантастика',
        slug: 'fantasy',
        description: 'Фантастические и научно-фантастические произведения',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
