"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Review extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Отзыв принадлежит пользователю
      Review.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });

      // Many-to-One: Отзыв принадлежит книге
      Review.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
        onDelete: "CASCADE",
      });
    }

    // Методы экземпляра
    isPositive() {
      return this.rating >= 4;
    }

    isNegative() {
      return this.rating <= 2;
    }

    isNeutral() {
      return this.rating === 3;
    }

    getRatingStars() {
      return "★".repeat(this.rating) + "☆".repeat(5 - this.rating);
    }

    getRatingDisplayName() {
      const ratings = {
        1: "Ужасно",
        2: "Плохо",
        3: "Нормально",
        4: "Хорошо",
        5: "Отлично",
      };
      return ratings[this.rating] || "Неизвестно";
    }

    hasTitle() {
      return this.title && this.title.trim().length > 0;
    }

    hasComment() {
      return this.comment && this.comment.trim().length > 0;
    }

    isDetailed() {
      return this.hasTitle() && this.hasComment() && this.comment.length > 50;
    }

    getWordCount() {
      if (!this.comment) return 0;
      return this.comment.trim().split(/\s+/).length;
    }

    async markAsVerifiedPurchase() {
      // Проверяем, купил ли пользователь эту книгу
      const { Order, OrderItem } = sequelize.models;

      const purchase = await OrderItem.findOne({
        include: [
          {
            model: Order,
            as: "order",
            where: {
              user_id: this.user_id,
              status: "delivered",
            },
          },
        ],
        where: {
          book_id: this.book_id,
        },
      });

      if (purchase) {
        this.is_verified_purchase = true;
        return await this.save();
      }

      return false;
    }

    async getReviewAge() {
      const now = new Date();
      const created = new Date(this.created_at);
      const diffTime = now - created;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "сегодня";
      if (diffDays === 1) return "вчера";
      if (diffDays < 7) return `${diffDays} дней назад`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)} недель назад`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} месяцев назад`;
      return `${Math.floor(diffDays / 365)} лет назад`;
    }

    canBeEdited(editWindowHours = 24) {
      const now = new Date();
      const created = new Date(this.created_at);
      const diffHours = (now - created) / (1000 * 60 * 60);

      return diffHours <= editWindowHours;
    }

    async getSimilarReviews(limit = 5) {
      return await Review.findAll({
        where: {
          book_id: this.book_id,
          rating: this.rating,
          id: {
            [sequelize.Sequelize.Op.ne]: this.id,
          },
        },
        limit: limit,
        order: [["created_at", "DESC"]],
      });
    }
  }

  Review.init(
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
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
          isInt: true,
        },
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          len: [0, 255],
        },
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      is_verified_purchase: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
      modelName: "Review",
      tableName: "reviews",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["book_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["rating"],
        },
        {
          fields: ["book_id", "rating"],
        },
        {
          fields: ["is_verified_purchase"],
        },
        {
          unique: true,
          fields: ["user_id", "book_id"],
        },
      ],
      scopes: {
        positive: {
          where: {
            rating: {
              [sequelize.Sequelize.Op.gte]: 4,
            },
          },
        },
        negative: {
          where: {
            rating: {
              [sequelize.Sequelize.Op.lte]: 2,
            },
          },
        },
        neutral: {
          where: {
            rating: 3,
          },
        },
        verified: {
          where: {
            is_verified_purchase: true,
          },
        },
        detailed: {
          where: {
            title: {
              [sequelize.Sequelize.Op.ne]: null,
            },
            comment: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        byBook: (bookId) => ({
          where: {
            book_id: bookId,
          },
        }),
        byUser: (userId) => ({
          where: {
            user_id: userId,
          },
        }),
        byRating: (rating) => ({
          where: {
            rating: rating,
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
        afterCreate: async (review) => {
          // Автоматически проверяем, была ли книга куплена
          await review.markAsVerifiedPurchase();
        },
      },
    }
  );

  return Review;
};
