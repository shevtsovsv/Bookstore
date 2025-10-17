'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BookAuthor extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Эта модель служит связью между Book и Author
      BookAuthor.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });

      BookAuthor.belongsTo(models.Author, {
        foreignKey: 'authorId',
        as: 'author'
      });
    }
  }

  BookAuthor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'authors',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'BookAuthor',
    tableName: 'book_authors',
    timestamps: true
  });

  return BookAuthor;
};
