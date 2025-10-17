'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cart extends Model {
    /**
     * Helper method for defining associations.
     */
    static associate(models) {
      // Связь с пользователем: товар в корзине принадлежит одному пользователю
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      // Связь с книгой: товар в корзине ссылается на одну книгу
      Cart.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Cart.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'cart',
    timestamps: true
  });

  return Cart;
};
