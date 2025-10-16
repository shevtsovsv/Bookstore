"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("cart_items", {
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
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
        },
      },
      added_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });

    // Создание индексов
    await queryInterface.addIndex("cart_items", ["user_id"], {
      name: "cart_items_user_id_idx",
    });

    await queryInterface.addIndex("cart_items", ["book_id"], {
      name: "cart_items_book_id_idx",
    });

    await queryInterface.addIndex("cart_items", ["added_at"], {
      name: "cart_items_added_at_idx",
    });

    // Один пользователь может иметь только одну позицию конкретной книги в корзине
    await queryInterface.addIndex("cart_items", ["user_id", "book_id"], {
      unique: true,
      name: "cart_items_user_book_unique_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("cart_items");
  },
};
