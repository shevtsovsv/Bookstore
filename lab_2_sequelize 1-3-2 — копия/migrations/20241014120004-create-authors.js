"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("authors", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      first_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      last_name: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      biography: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      birth_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      death_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      nationality: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Создание индексов
    await queryInterface.addIndex("authors", ["last_name", "first_name"], {
      name: "authors_fullname_idx",
    });

    await queryInterface.addIndex("authors", ["nationality"], {
      name: "authors_nationality_idx",
    });

    await queryInterface.addIndex("authors", ["birth_date"], {
      name: "authors_birth_date_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("authors");
  },
};
