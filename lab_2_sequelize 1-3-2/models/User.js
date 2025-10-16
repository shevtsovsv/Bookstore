"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // One-to-Many: Пользователь имеет много позиций в корзине
      User.hasMany(models.CartItem, {
        foreignKey: "user_id",
        as: "cartItems",
        onDelete: "CASCADE",
      });

      // Many-to-Many: Пользователь может иметь много книг в корзине через CartItem
      User.belongsToMany(models.Book, {
        through: models.CartItem,
        foreignKey: "user_id",
        otherKey: "book_id",
        as: "cartBooks",
      });
    }

    // Методы экземпляра
    getFullName() {
      return `${this.first_name} ${this.last_name}`;
    }

    isAdmin() {
      return this.role === "admin";
    }

    isManager() {
      return this.role === "manager";
    }

    isCustomer() {
      return this.role === "customer";
    }
  }

  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[\+]?[1-9][\d]{0,15}$/i, // Международный формат телефона
        },
      },
      role: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "customer",
        validate: {
          isIn: [["customer", "admin", "manager"]],
        },
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
      modelName: "User",
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["email"],
        },
        {
          fields: ["role"],
        },
        {
          fields: ["created_at"],
        },
      ],
    }
  );

  return User;
};
