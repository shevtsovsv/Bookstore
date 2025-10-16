"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Заказ принадлежит пользователю
      Order.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });

      // One-to-Many: Заказ имеет много позиций
      Order.hasMany(models.OrderItem, {
        foreignKey: "order_id",
        as: "items",
        onDelete: "CASCADE",
      });

      // Many-to-Many: Заказ может содержать много книг через OrderItem
      Order.belongsToMany(models.Book, {
        through: models.OrderItem,
        foreignKey: "order_id",
        otherKey: "book_id",
        as: "books",
      });
    }

    // Статические методы
    static generateOrderNumber() {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0");
      return `ORD-${timestamp}-${random}`;
    }

    // Методы экземпляра
    isPending() {
      return this.status === "pending";
    }

    isConfirmed() {
      return this.status === "confirmed";
    }

    isProcessing() {
      return this.status === "processing";
    }

    isShipped() {
      return this.status === "shipped";
    }

    isDelivered() {
      return this.status === "delivered";
    }

    isCancelled() {
      return this.status === "cancelled";
    }

    canBeCancelled() {
      return ["pending", "confirmed"].includes(this.status);
    }

    canBeModified() {
      return this.status === "pending";
    }

    async getTotalItemsCount() {
      const items = await this.getItems();
      return items.reduce((sum, item) => sum + item.quantity, 0);
    }

    async calculateTotalAmount() {
      const items = await this.getItems();
      return items.reduce((sum, item) => sum + parseFloat(item.total_price), 0);
    }

    async confirmOrder() {
      if (!this.isPending()) {
        throw new Error("Можно подтвердить только заказы в статусе pending");
      }

      this.status = "confirmed";
      return await this.save();
    }

    async startProcessing() {
      if (!this.isConfirmed()) {
        throw new Error(
          "Можно запустить обработку только подтвержденных заказов"
        );
      }

      this.status = "processing";
      return await this.save();
    }

    async shipOrder() {
      if (!this.isProcessing()) {
        throw new Error("Можно отправить только заказы в обработке");
      }

      this.status = "shipped";
      this.shipped_at = new Date();
      return await this.save();
    }

    async deliverOrder() {
      if (!this.isShipped()) {
        throw new Error("Можно доставить только отправленные заказы");
      }

      this.status = "delivered";
      this.delivered_at = new Date();
      return await this.save();
    }

    async cancelOrder() {
      if (!this.canBeCancelled()) {
        throw new Error("Заказ нельзя отменить в текущем статусе");
      }

      this.status = "cancelled";
      return await this.save();
    }

    getStatusDisplayName() {
      const statuses = {
        pending: "Ожидает подтверждения",
        confirmed: "Подтвержден",
        processing: "В обработке",
        shipped: "Отправлен",
        delivered: "Доставлен",
        cancelled: "Отменен",
      };
      return statuses[this.status] || this.status;
    }

    getDeliveryTime() {
      if (!this.shipped_at || !this.delivered_at) return null;

      const shippedTime = new Date(this.shipped_at);
      const deliveredTime = new Date(this.delivered_at);
      const diffTime = deliveredTime - shippedTime;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    }
  }

  Order.init(
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
      order_number: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 50],
        },
      },
      total_amount: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
          min: 0,
          isDecimal: true,
        },
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: "pending",
        validate: {
          isIn: [
            [
              "pending",
              "confirmed",
              "processing",
              "shipped",
              "delivered",
              "cancelled",
            ],
          ],
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
      shipped_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      delivered_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["order_number"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["status"],
        },
        {
          fields: ["created_at"],
        },
        {
          fields: ["user_id", "status"],
        },
      ],
      scopes: {
        pending: {
          where: {
            status: "pending",
          },
        },
        confirmed: {
          where: {
            status: "confirmed",
          },
        },
        processing: {
          where: {
            status: "processing",
          },
        },
        shipped: {
          where: {
            status: "shipped",
          },
        },
        delivered: {
          where: {
            status: "delivered",
          },
        },
        cancelled: {
          where: {
            status: "cancelled",
          },
        },
        active: {
          where: {
            status: {
              [sequelize.Sequelize.Op.notIn]: ["delivered", "cancelled"],
            },
          },
        },
        byUser: (userId) => ({
          where: {
            user_id: userId,
          },
        }),
        recent: {
          where: {
            created_at: {
              [sequelize.Sequelize.Op.gte]: new Date(
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ), // Последние 30 дней
            },
          },
        },
      },
      hooks: {
        beforeCreate: (order) => {
          if (!order.order_number) {
            order.order_number = Order.generateOrderNumber();
          }
        },
      },
    }
  );

  return Order;
};
