"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Исправляем последовательность для таблицы authors
    // Устанавливаем следующее значение равным максимальному id + 1
    await queryInterface.sequelize.query(`
      SELECT setval('authors_id_seq', COALESCE((SELECT MAX(id) FROM authors), 1));
    `);
  },

  async down(queryInterface, Sequelize) {
    // В данном случае откат не требуется
    // так как мы только исправляем последовательность
  },
};
