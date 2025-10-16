"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("wishlist", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
      added_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Создание индексов
    await queryInterface.addIndex("wishlist", ["user_id"], {
      name: "wishlist_user_id_idx",
    });

    await queryInterface.addIndex("wishlist", ["book_id"], {
      name: "wishlist_book_id_idx",
    });

    await queryInterface.addIndex("wishlist", ["added_at"], {
      name: "wishlist_added_at_idx",
    });

    // Один пользователь может добавить книгу в список желаний только один раз
    await queryInterface.addIndex("wishlist", ["user_id", "book_id"], {
      unique: true,
      name: "wishlist_user_book_unique_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("wishlist");
  },
};
