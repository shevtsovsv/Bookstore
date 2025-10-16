"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Wishlist extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Позиция списка желаний принадлежит пользователю
      Wishlist.belongsTo(models.User, {
        foreignKey: "user_id",
        as: "user",
        onDelete: "CASCADE",
      });

      // Many-to-One: Позиция списка желаний принадлежит книге
      Wishlist.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
        onDelete: "CASCADE",
      });
    }

    // Методы экземпляра
    async isBookAvailable() {
      const book = await this.getBook();
      return book && book.stock > 0;
    }

    async getBookPrice() {
      const book = await this.getBook();
      return book ? parseFloat(book.price) : 0;
    }

    async moveToCart(quantity = 1) {
      const { CartItem } = sequelize.models;

      // Проверяем наличие товара
      const book = await this.getBook();
      if (!book) {
        throw new Error("Книга не найдена");
      }

      if (book.stock < quantity) {
        throw new Error(
          `Недостаточно товара на складе. Доступно: ${book.stock}`
        );
      }

      // Проверяем, есть ли уже в корзине
      const existingCartItem = await CartItem.findOne({
        where: {
          user_id: this.user_id,
          book_id: this.book_id,
        },
      });

      if (existingCartItem) {
        // Увеличиваем количество в корзине
        await existingCartItem.updateQuantity(
          existingCartItem.quantity + quantity
        );
      } else {
        // Создаем новую позицию в корзине
        await CartItem.create({
          user_id: this.user_id,
          book_id: this.book_id,
          quantity: quantity,
        });
      }

      // Удаляем из списка желаний
      return await this.destroy();
    }

    async notifyWhenAvailable() {
      // Метод для уведомления когда товар появится в наличии
      // Здесь можно реализовать логику отправки уведомлений
      console.log(
        `Пользователь ${this.user_id} хочет получить уведомление о книге ${this.book_id}`
      );
      return true;
    }

    getAge() {
      const now = new Date();
      const added = new Date(this.added_at);
      const diffTime = now - added;
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      return diffDays;
    }

    isOld(daysThreshold = 90) {
      return this.getAge() > daysThreshold;
    }

    async hasDiscountAvailable() {
      // Проверяем, есть ли скидки на эту книгу
      // Здесь можно реализовать логику проверки активных скидок
      return false;
    }

    async checkPriceChange() {
      // Метод для отслеживания изменения цены
      // Можно сохранять первоначальную цену и сравнивать с текущей
      const book = await this.getBook();
      if (!book) return null;

      // Если нужно отслеживать изменения цены, можно добавить поле original_price
      return {
        current_price: book.price,
        is_available: book.stock > 0,
      };
    }

    async getRecommendedBooks(limit = 5) {
      // Получаем рекомендации на основе категории книги в списке желаний
      const book = await this.getBook({ include: ["category"] });
      if (!book || !book.category) return [];

      const { Book } = sequelize.models;
      return await Book.findAll({
        where: {
          category_id: book.category_id,
          id: {
            [sequelize.Sequelize.Op.ne]: book.id,
          },
          stock: {
            [sequelize.Sequelize.Op.gt]: 0,
          },
        },
        order: [["popularity", "DESC"]],
        limit: limit,
      });
    }
  }

  Wishlist.init(
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
      added_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Wishlist",
      tableName: "wishlist",
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
        old: (daysThreshold = 90) => ({
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
                Date.now() - 30 * 24 * 60 * 60 * 1000
              ), // Последние 30 дней
            },
          },
        },
        byCategory: (categoryId) => ({
          include: [
            {
              model: sequelize.models.Book,
              as: "book",
              where: {
                category_id: categoryId,
              },
            },
          ],
        }),
      },
    }
  );

  return Wishlist;
};
