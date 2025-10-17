'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Author extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Связь многие-ко-многим с книгами через таблицу book_authors
      Author.belongsToMany(models.Book, {
        through: models.BookAuthor,
        foreignKey: 'authorId',
        otherKey: 'bookId',
        as: 'books'
      });
    }
  }

  Author.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authorType: {
      type: DataTypes.ENUM('russian', 'foreign'),
      allowNull: false,
      defaultValue: 'russian',
      validate: {
        isIn: [['russian', 'foreign']]
      }
    }
  }, {
    sequelize,
    modelName: 'Author',
    tableName: 'authors',
    timestamps: true
  });

  return Author;
};
