"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("book_authors", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      book_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      author_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "authors",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      role: {
        type: Sequelize.ENUM(
          "author",
          "co-author",
          "translator",
          "editor"
        ),
        allowNull: false,
        defaultValue: "author",
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

    // Уникальная связь книга-автор-роль
    await queryInterface.addIndex(
      "book_authors",
      ["book_id", "author_id", "role"],
      {
        unique: true,
        name: "book_authors_unique_idx",
      }
    );

    await queryInterface.addIndex("book_authors", ["book_id"], {
      name: "book_authors_book_id_idx",
    });

    await queryInterface.addIndex("book_authors", ["author_id"], {
      name: "book_authors_author_id_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("book_authors");
  },
};
