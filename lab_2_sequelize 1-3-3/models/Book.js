'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Связь с категорией: книга принадлежит одной категории
      Book.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });

      // Связь с издательством: книга принадлежит одному издательству
      Book.belongsTo(models.Publisher, {
        foreignKey: 'publisherId',
        as: 'publisher'
      });

      // Связь многие-ко-многим с авторами через таблицу book_authors
      Book.belongsToMany(models.Author, {
        through: models.BookAuthor,
        foreignKey: 'bookId',
        otherKey: 'authorId',
        as: 'authors'
      });

      // Связь с корзиной: книга может быть в корзине у многих пользователей
      Book.hasMany(models.CartItem, {
        foreignKey: 'bookId',
        as: 'cartItems'
      });
    }
  }

  Book.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    publisherId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'publishers',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    priceCategory: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high']]
      }
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    timestamps: true
  });

  return Book;
};
