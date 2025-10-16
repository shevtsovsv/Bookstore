"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CartItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Позиция корзины принадлежит пользователю
      CartItem.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });

      // Many-to-One: Позиция корзины принадлежит книге
      CartItem.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
        onDelete: "CASCADE",
      });
    }

    // Методы экземпляра
    async getTotalPrice() {
      const book = await this.getBook();
      if (!book) return 0;
      return parseFloat(book.price) * this.quantity;
    }

    async isAvailable() {
      const book = await this.getBook();
      return book && book.stock >= this.quantity;
    }

    async updateQuantity(newQuantity) {
      if (newQuantity <= 0) {
        return await this.destroy();
      }

      // Проверяем наличие товара на складе
      const book = await this.getBook();
      if (!book) {
        throw new Error("Книга не найдена");
      }

      if (book.stock < newQuantity) {
        throw new Error(
          `Недостаточно товара на складе. Доступно: ${book.stock}`
        );
      }

      this.quantity = newQuantity;
      return await this.save();
    }

    async increaseQuantity(amount = 1) {
      return await this.updateQuantity(this.quantity + amount);
    }

    async decreaseQuantity(amount = 1) {
      return await this.updateQuantity(this.quantity - amount);
    }

    async moveToWishlist() {
      const { Wishlist } = sequelize.models;

      // Проверяем, есть ли уже в списке желаний
      const existingWishlistItem = await Wishlist.findOne({
        where: {
          user_id: this.user_id,
          book_id: this.book_id,
        },
      });

      if (!existingWishlistItem) {
        await Wishlist.create({
          user_id: this.user_id,
          book_id: this.book_id,
        });
      }

      // Удаляем из корзины
      return await this.destroy();
    }

    getAge() {
      const now = new Date();
      const added = new Date(this.added_at);
      const diffTime = now - added;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    }

    isOld(daysThreshold = 30) {
      return this.getAge() > daysThreshold;
    }

    async createOrderItem(orderId) {
      const { OrderItem } = sequelize.models;
      const book = await this.getBook();

      if (!book) {
        throw new Error("Книга не найдена");
      }

      if (!(await this.isAvailable())) {
        throw new Error("Недостаточно товара на складе");
      }

      return await OrderItem.create({
        order_id: orderId,
        book_id: this.book_id,
        quantity: this.quantity,
        price_per_item: book.price,
        total_price: await this.getTotalPrice(),
      });
    }
  }

  CartItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "CartItem",
      tableName: "cart_items",
      timestamps: false, // Используем только added_at
      indexes: [
        {
          fields: ["user_id"],
        },
        {
          fields: ["book_id"],
        },
        {
          fields: ["added_at"],
        },
        {
          unique: true,
          fields: ["user_id", "book_id"],
        },
      ],
      scopes: {
        byUser: (userId) => ({
          where: {
            user_id: userId,
          },
        }),
        available: {
          include: [
            {
              model: sequelize.models.Book,
              as: "book",
              where: {
                stock: {
                  [sequelize.Sequelize.Op.gt]: 0,
                },
              },
            },
          ],
        },
        unavailable: {
          include: [
            {
              model: sequelize.models.Book,
              as: "book",
              where: {
                stock: 0,
              },
            },
          ],
        },
        old: (daysThreshold = 30) => ({
          where: {
            added_at: {
              [sequelize.Sequelize.Op.lt]: new Date(
                Date.now() - daysThreshold * 24 * 60 * 60 * 1000
              ),
            },
          },
        }),
        recent: {
          where: {
            added_at: {
              [sequelize.Sequelize.Op.gte]: new Date(
                Date.now() - 7 * 24 * 60 * 60 * 1000
              ), // Последние 7 дней
            },
          },
        },
        highQuantity: (threshold = 5) => ({
          where: {
            quantity: {
              [sequelize.Sequelize.Op.gte]: threshold,
            },
          },
        }),
      },
    }
  );

  return CartItem;
};
