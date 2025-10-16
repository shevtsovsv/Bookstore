"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class OrderItem extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Позиция заказа принадлежит заказу
      OrderItem.belongsTo(models.Order, {
        foreignKey: "order_id",
        as: "order",
        onDelete: "CASCADE",
      });

      // Many-to-One: Позиция заказа принадлежит книге
      OrderItem.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
        onDelete: "RESTRICT",
      });
    }

    // Методы экземпляра
    calculateTotalPrice() {
      return parseFloat(this.price_per_item) * this.quantity;
    }

    validateTotalPrice() {
      const calculatedTotal = this.calculateTotalPrice();
      const storedTotal = parseFloat(this.total_price);
      return Math.abs(calculatedTotal - storedTotal) < 0.01; // Учитываем погрешность округления
    }

    async updateQuantity(newQuantity) {
      if (newQuantity <= 0) {
        throw new Error("Количество должно быть больше 0");
      }

      // Проверяем наличие товара на складе
      const book = await this.getBook();
      if (!book) {
        throw new Error("Книга не найдена");
      }

      const quantityDiff = newQuantity - this.quantity;
      if (quantityDiff > 0 && book.stock < quantityDiff) {
        throw new Error("Недостаточно товара на складе");
      }

      this.quantity = newQuantity;
      this.total_price = this.calculateTotalPrice();
      return await this.save();
    }

    async updatePrice(newPrice) {
      if (newPrice < 0) {
        throw new Error("Цена не может быть отрицательной");
      }

      this.price_per_item = newPrice;
      this.total_price = this.calculateTotalPrice();
      return await this.save();
    }

    getDiscountAmount(originalPrice) {
      const discount =
        parseFloat(originalPrice) - parseFloat(this.price_per_item);
      return Math.max(0, discount);
    }

    getDiscountPercent(originalPrice) {
      const discount = this.getDiscountAmount(originalPrice);
      if (parseFloat(originalPrice) === 0) return 0;
      return Math.round((discount / parseFloat(originalPrice)) * 100);
    }

    async canBeReturned(returnPeriodDays = 14) {
      const order = await this.getOrder();
      if (!order || !order.delivered_at) return false;

      const deliveryDate = new Date(order.delivered_at);
      const today = new Date();
      const daysDiff = Math.floor(
        (today - deliveryDate) / (1000 * 60 * 60 * 24)
      );

      return daysDiff <= returnPeriodDays;
    }
  }

  OrderItem.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      order_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "orders",
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
        onDelete: "RESTRICT",
      },
      quantity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          isInt: true,
        },
      },
      price_per_item: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
        },
      },
      total_price: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
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
      modelName: "OrderItem",
      tableName: "order_items",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["order_id"],
        },
        {
          fields: ["book_id"],
        },
        {
          fields: ["book_id", "quantity"],
        },
        {
          unique: true,
          fields: ["order_id", "book_id"],
        },
      ],
      scopes: {
        byOrder: (orderId) => ({
          where: {
            order_id: orderId,
          },
        }),
        byBook: (bookId) => ({
          where: {
            book_id: bookId,
          },
        }),
        highQuantity: (threshold = 5) => ({
          where: {
            quantity: {
              [sequelize.Sequelize.Op.gte]: threshold,
            },
          },
        }),
        highValue: (threshold = 1000) => ({
          where: {
            total_price: {
              [sequelize.Sequelize.Op.gte]: threshold,
            },
          },
        }),
      },
      hooks: {
        beforeSave: (orderItem) => {
          // Автоматически пересчитываем общую стоимость
          orderItem.total_price = orderItem.calculateTotalPrice();
        },
        afterSave: async (orderItem) => {
          // Обновляем общую сумму заказа при изменении позиции
          const order = await orderItem.getOrder();
          if (order) {
            const totalAmount = await order.calculateTotalAmount();
            await order.update({ total_amount: totalAmount });
          }
        },
      },
      validate: {
        totalPriceIsCorrect() {
          if (!this.validateTotalPrice()) {
            throw new Error(
              "Общая стоимость не соответствует расчету (цена за единицу × количество)"
            );
          }
        },
      },
    }
  );

  return OrderItem;
};
