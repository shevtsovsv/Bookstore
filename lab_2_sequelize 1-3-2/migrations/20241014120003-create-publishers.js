"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("publishers", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      website: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      contact_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      founded_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
        validate: {
          min: 1000,
          max: new Date().getFullYear(),
        },
      },
      country: {
        type: Sequelize.STRING(100),
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
    await queryInterface.addIndex("publishers", ["name"], {
      unique: true,
      name: "publishers_name_unique_idx",
    });

    await queryInterface.addIndex("publishers", ["country"], {
      name: "publishers_country_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("publishers");
  },
};
