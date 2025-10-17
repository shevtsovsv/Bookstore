"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Книга принадлежит категории
      Book.belongsTo(models.Category, {
        foreignKey: "category_id",
        as: "category",
        onDelete: "RESTRICT",
      });

      // Many-to-One: Книга принадлежит издательству
      Book.belongsTo(models.Publisher, {
        foreignKey: "publisher_id",
        as: "publisher",
        onDelete: "RESTRICT",
      });

      // Many-to-Many: Книга может иметь много авторов через book_authors
      Book.belongsToMany(models.Author, {
        through: models.BookAuthor,
        foreignKey: "book_id",
        otherKey: "author_id",
        as: "authors",
      });

      // One-to-Many: Книга имеет много связей book_authors
      Book.hasMany(models.BookAuthor, {
        foreignKey: "book_id",
        as: "bookAuthors",
        onDelete: "CASCADE",
      });

      // One-to-Many: Книга имеет много позиций в корзинах
      Book.hasMany(models.CartItem, {
        foreignKey: "book_id",
        as: "cartItems",
        onDelete: "CASCADE",
      });

      // Many-to-Many: Книга может быть в корзинах многих пользователей
      Book.belongsToMany(models.User, {
        through: models.CartItem,
        foreignKey: "book_id",
        otherKey: "user_id",
        as: "cartUsers",
      });
    }

    // Методы экземпляра
    isAvailable() {
      return this.stock > 0;
    }

    isOutOfStock() {
      return this.stock === 0;
    }

    isLowStock(threshold = 5) {
      return this.stock > 0 && this.stock <= threshold;
    }

    async getAuthorsString() {
      const authors = await this.getAuthors();
      return authors.map((author) => author.getFullName()).join(", ");
    }

    async getMainAuthor() {
      const authors = await this.getAuthors({
        through: {
          where: { role: "author" },
        },
      });
      return authors[0] || null;
    }

    async getTranslators() {
      return await this.getAuthors({
        through: {
          where: { role: "translator" },
        },
      });
    }



    getDiscountedPrice(discountPercent) {
      return Math.round(this.price * (1 - discountPercent / 100) * 100) / 100;
    }

    async decreaseStock(quantity) {
      if (this.stock < quantity) {
        throw new Error("Недостаточно товара на складе");
      }

      this.stock -= quantity;
      this.popularity += quantity;
      return await this.save();
    }

    async increaseStock(quantity) {
      this.stock += quantity;
      return await this.save();
    }

    getPublicationAge() {
      if (!this.publication_year) return null;
      return new Date().getFullYear() - this.publication_year;
    }

    isNewRelease(yearsThreshold = 2) {
      const age = this.getPublicationAge();
      return age !== null && age <= yearsThreshold;
    }

    async getSimilarBooks(limit = 5) {
      return await Book.findAll({
        where: {
          category_id: this.category_id,
          id: {
            [sequelize.Sequelize.Op.ne]: this.id,
          },
        },
        order: [["popularity", "DESC"]],
        limit: limit,
      });
    }
  }

  Book.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(500),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 500],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      isbn: {
        type: DataTypes.STRING(20),
        allowNull: true,
        unique: true,
        validate: {
          isISBN(value) {
            if (
              value &&
              !/^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/i.test(
                value
              )
            ) {
              throw new Error("Неверный формат ISBN");
            }
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      pages: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      publication_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1400,
          max() {
            return new Date().getFullYear();
          },
          isInt: true,
        },
      },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
          isInt: true,
        },
      },
      category_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      publisher_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "publishers",
          key: "id",
        },
        onDelete: "RESTRICT",
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "books",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["isbn"],
          where: {
            isbn: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        {
          fields: ["title"],
        },
        {
          fields: ["category_id"],
        },
        {
          fields: ["publisher_id"],
        },
        {
          fields: ["stock"],
        },
        {
          fields: ["popularity"],
        },
        {
          fields: ["price"],
        },
        {
          fields: ["publication_year"],
        },
        {
          fields: ["category_id", "stock"],
        },
      ],
      scopes: {
        available: {
          where: {
            stock: {
              [sequelize.Sequelize.Op.gt]: 0,
            },
          },
        },
        outOfStock: {
          where: {
            stock: 0,
          },
        },
        lowStock: {
          where: {
            stock: {
              [sequelize.Sequelize.Op.between]: [1, 5],
            },
          },
        },
        popular: {
          where: {
            popularity: {
              [sequelize.Sequelize.Op.gte]: 10,
            },
          },
        },
        byCategory: (categoryId) => ({
          where: {
            category_id: categoryId,
          },
        }),
        byPublisher: (publisherId) => ({
          where: {
            publisher_id: publisherId,
          },
        }),
        newReleases: {
          where: {
            publication_year: {
              [sequelize.Sequelize.Op.gte]: new Date().getFullYear() - 2,
            },
          },
        },
        priceRange: (min, max) => ({
          where: {
            price: {
              [sequelize.Sequelize.Op.between]: [min, max],
            },
          },
        }),
      },
    }
  );

  return Book;
};
