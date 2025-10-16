"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("books", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING(500),
        allowNull: false,
      },
      isbn: {
        type: Sequelize.STRING(20),
        allowNull: true,
        unique: true,
      },
      publisher_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "publishers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      category_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "RESTRICT",
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      pages: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      language: {
        type: Sequelize.STRING(50),
        allowNull: false,
        defaultValue: 'ru',
      },
      publication_year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      edition: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      weight: {
        type: Sequelize.DECIMAL(8, 3),
        allowNull: true,
      },
      popularity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
    await queryInterface.addIndex("books", ["isbn"], {
      unique: true,
      name: "books_isbn_unique_idx",
      where: {
        isbn: {
          [Sequelize.Op.ne]: null,
        },
      },
    });

    await queryInterface.addIndex("books", ["title"], {
      name: "books_title_idx",
    });

    await queryInterface.addIndex("books", ["category_id"], {
      name: "books_category_id_idx",
    });

    await queryInterface.addIndex("books", ["publisher_id"], {
      name: "books_publisher_id_idx",
    });

    await queryInterface.addIndex("books", ["stock"], {
      name: "books_stock_idx",
    });

    await queryInterface.addIndex("books", ["popularity"], {
      name: "books_popularity_idx",
    });

    await queryInterface.addIndex("books", ["price"], {
      name: "books_price_idx",
    });

    await queryInterface.addIndex("books", ["publication_year"], {
      name: "books_publication_year_idx",
    });

    await queryInterface.addIndex("books", ["category_id", "stock"], {
      name: "books_category_stock_idx",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("books");
  },
};
