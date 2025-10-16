"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
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
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_verified_purchase: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
    await queryInterface.addIndex("reviews", ["book_id"], {
      name: "reviews_book_id_idx",
    });

    await queryInterface.addIndex("reviews", ["user_id"], {
      name: "reviews_user_id_idx",
    });

    await queryInterface.addIndex("reviews", ["rating"], {
      name: "reviews_rating_idx",
    });

    await queryInterface.addIndex("reviews", ["book_id", "rating"], {
      name: "reviews_book_rating_idx",
    });

    await queryInterface.addIndex("reviews", ["is_verified_purchase"], {
      name: "reviews_verified_purchase_idx",
    });

    // Один пользователь может оставить только один отзыв на книгу
    await queryInterface.addIndex("reviews", ["user_id", "book_id"], {
      unique: true,
      name: "reviews_user_book_unique_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("reviews");
  },
};
