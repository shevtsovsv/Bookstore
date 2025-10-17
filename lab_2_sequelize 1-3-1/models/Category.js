'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Связь с книгами: одна категория может иметь много книг
      Category.hasMany(models.Book, {
        foreignKey: 'categoryId',
        as: 'books'
      });
    }
  }

  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isLowercase: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true
  });

  return Category;
};
