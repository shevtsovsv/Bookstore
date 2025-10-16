const { Model, DataTypes, Op } = require("sequelize");

module.exports = (sequelize) => {
  class Book extends Model {
    /**
     * Проверить наличие книги на складе
     * @param {number} quantity - требуемое количество
     * @returns {boolean}
     */
    isAvailable(quantity = 1) {
      return this.stock >= quantity;
    }

    /**
     * Получить категории книги из метаданных
     * @returns {Array<string>}
     */
    getCategories() {
      if (!this.metadata || !this.metadata.categories) {
        return [];
      }
      return Array.isArray(this.metadata.categories)
        ? this.metadata.categories
        : [];
    }

    /**
     * Проверить принадлежность к категории
     * @param {string} category - название категории
     * @returns {boolean}
     */
    hasCategory(category) {
      return this.getCategories().includes(category);
    }

    /**
     * Получить ценовую категорию
     * @returns {string}
     */
    getPriceCategory() {
      if (this.metadata && this.metadata.priceCategory) {
        return this.metadata.priceCategory;
      }

      // Автоматическое определение по цене
      if (this.price < 500) return "low";
      if (this.price < 1000) return "medium";
      return "high";
    }

    /**
     * Получить полную информацию о книге для API
     * @returns {Object}
     */
    toJSON() {
      const values = Object.assign({}, this.get());

      // Добавляем вычисляемые поля
      values.categories = this.getCategories();
      values.priceCategory = this.getPriceCategory();
      values.available = this.stock > 0;

      return values;
    }

    static associate(models) {
      // Связи через JSONB, прямых ассоциаций нет
      // При необходимости можно добавить виртуальные ассоциации
    }
  }

  Book.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Название книги не может быть пустым",
          },
          len: {
            args: [1, 255],
            msg: "Название должно содержать от 1 до 255 символов",
          },
        },
      },
      author: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Автор книги не может быть пустым",
          },
          len: {
            args: [1, 255],
            msg: "Имя автора должно содержать от 1 до 255 символов",
          },
        },
      },
      genre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: {
            msg: "Жанр книги не может быть пустым",
          },
          len: {
            args: [1, 100],
            msg: "Жанр должен содержать от 1 до 100 символов",
          },
        },
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          isDecimal: {
            msg: "Цена должна быть числом",
          },
          min: {
            args: [0],
            msg: "Цена не может быть отрицательной",
          },
          max: {
            args: [999999.99],
            msg: "Цена слишком высокая",
          },
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 5000],
            msg: "Описание не должно превышать 5000 символов",
          },
        },
      },
      short_description: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "Краткое описание не должно превышать 500 символов",
          },
        },
      },
      image: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isValidImageName(value) {
            if (value && !/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
              throw new Error("Неподдерживаемый формат изображения");
            }
          },
        },
      },
      popularity: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Популярность должна быть целым числом",
          },
          min: {
            args: [0],
            msg: "Популярность не может быть отрицательной",
          },
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: {
            msg: "Количество на складе должно быть целым числом",
          },
          min: {
            args: [0],
            msg: "Количество на складе не может быть отрицательным",
          },
        },
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
        validate: {
          isValidMetadata(value) {
            if (typeof value !== "object" || Array.isArray(value)) {
              throw new Error("Метаданные должны быть объектом");
            }

            // Валидация категорий
            if (value.categories && !Array.isArray(value.categories)) {
              throw new Error("Категории должны быть массивом");
            }

            // Валидация ценовой категории
            if (
              value.priceCategory &&
              !["low", "medium", "high"].includes(value.priceCategory)
            ) {
              throw new Error("Неверная ценовая категория");
            }
          },
        },
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "Book",
      tableName: "books",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["popularity"],
          name: "books_popularity_idx",
        },
        {
          fields: ["stock"],
          name: "books_stock_idx",
        },
        {
          fields: ["genre"],
          name: "books_genre_idx",
        },
        {
          fields: ["author"],
          name: "books_author_idx",
        },
        {
          fields: ["price"],
          name: "books_price_idx",
        },
        {
          using: "gin",
          fields: ["metadata"],
          name: "books_metadata_gin_idx",
        },
      ],
    }
  );

  /**
   * Найти книги в наличии с сортировкой по популярности
   * @param {Object} options - опции поиска
   * @returns {Promise<Array<Book>>}
   */
  Book.findAvailable = async function (options = {}) {
    const {
      limit = 20,
      offset = 0,
      genre = null,
      author = null,
      priceMin = null,
      priceMax = null,
      categories = null,
    } = options;

    const where = {
      stock: { [Op.gt]: 0 }, // Только книги в наличии
    };

    // Фильтр по жанру
    if (genre) {
      where.genre = { [Op.iLike]: `%${genre}%` };
    }

    // Фильтр по автору
    if (author) {
      where.author = { [Op.iLike]: `%${author}%` };
    }

    // Фильтр по цене
    if (priceMin !== null || priceMax !== null) {
      where.price = {};
      if (priceMin !== null) where.price[Op.gte] = priceMin;
      if (priceMax !== null) where.price[Op.lte] = priceMax;
    }

    // Фильтр по категориям (через JSONB)
    if (categories && Array.isArray(categories) && categories.length > 0) {
      where.metadata = {
        [Op.and]: categories.map((category) => ({
          categories: { [Op.contains]: [category] },
        })),
      };
    }

    return await Book.findAll({
      where,
      order: [
        ["popularity", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
      offset,
    });
  };

  /**
   * Получить популярные книги
   * @param {number} limit - количество книг
   * @returns {Promise<Array<Book>>}
   */
  Book.findPopular = async function (limit = 10) {
    return await Book.findAll({
      where: {
        stock: { [Op.gt]: 0 },
      },
      order: [["popularity", "DESC"]],
      limit,
    });
  };

  /**
   * Поиск книг по тексту
   * @param {string} query - поисковый запрос
   * @param {Object} options - дополнительные опции
   * @returns {Promise<Array<Book>>}
   */
  Book.search = async function (query, options = {}) {
    const { limit = 20, offset = 0, onlyAvailable = true } = options;

    const where = {
      [Op.or]: [
        { title: { [Op.iLike]: `%${query}%` } },
        { author: { [Op.iLike]: `%${query}%` } },
        { genre: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
      ],
    };

    if (onlyAvailable) {
      where.stock = { [Op.gt]: 0 };
    }

    return await Book.findAll({
      where,
      order: [
        ["popularity", "DESC"],
        ["created_at", "DESC"],
      ],
      limit,
      offset,
    });
  };

  /**
   * Уменьшить количество на складе при покупке (атомарная операция)
   * @param {number} bookId - ID книги
   * @param {number} quantity - количество для покупки
   * @returns {Promise<Book|null>} - обновленная книга или null если недостаточно товара
   */
  Book.purchaseBooks = async function (bookId, quantity, transaction = null) {
    const book = await Book.findByPk(bookId, {
      lock: transaction ? transaction.LOCK.UPDATE : true,
      transaction,
    });

    if (!book) {
      throw new Error("Книга не найдена");
    }

    if (book.stock < quantity) {
      throw new Error(`Недостаточно товара на складе. Доступно: ${book.stock}`);
    }

    // Атомарное обновление склада и популярности
    await book.update(
      {
        stock: book.stock - quantity,
        popularity: book.popularity + quantity,
      },
      { transaction }
    );

    return book;
  };

  /**
   * Получить статистику по книгам
   * @returns {Promise<Object>}
   */
  Book.getStats = async function () {
    const total = await Book.count();
    const available = await Book.count({
      where: { stock: { [Op.gt]: 0 } },
    });
    const outOfStock = total - available;

    return {
      total,
      available,
      outOfStock,
      percentage: total > 0 ? Math.round((available / total) * 100) : 0,
    };
  };

  return Book;
};

