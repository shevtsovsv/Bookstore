"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Исправляем последовательность для таблицы categories
    // Устанавливаем следующее значение равным максимальному id + 1
    await queryInterface.sequelize.query(`
      SELECT setval('categories_id_seq', COALESCE((SELECT MAX(id) FROM categories), 1));
    `);
  },

  async down(queryInterface, Sequelize) {
    // В данном случае откат не требуется
    // так как мы только исправляем последовательность
  },
};
