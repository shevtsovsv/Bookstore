"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "publishers",
      [
        {
          id: 1,
          name: "Питер",
          description: "Издательство компьютерной литературы",
          website: "https://www.piter.com",
          contact_email: "info@piter.com",
          founded_year: 1991,
          country: "Россия",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 2,
          name: "Эксмо",
          description: "Универсальное издательство",
          website: "https://eksmo.ru",
          contact_email: "info@eksmo.ru",
          founded_year: 1991,
          country: "Россия",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: 3,
          name: "АСТ",
          description: "Издательство художественной литературы",
          website: "https://ast.ru",
          contact_email: "info@ast.ru",
          founded_year: 1990,
          country: "Россия",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("publishers", null, {});
  },
};
