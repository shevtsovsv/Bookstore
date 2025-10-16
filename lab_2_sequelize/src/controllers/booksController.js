const { Book, User, sequelize } = require("../../models");
const { Op } = require("sequelize");

/**
 * Получение списка книг с фильтрацией и пагинацией
 * GET /api/books
 */
const getBooks = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      search,
      genre,
      author,
      priceMin,
      priceMax,
      categories,
      sortBy = "popularity",
      sortOrder = "desc",
      onlyAvailable = true,
    } = req.query;

    // Построение условий WHERE
    const whereConditions = {};

    // Фильтр по наличию на складе
    if (onlyAvailable) {
      whereConditions.stock = { [Op.gt]: 0 };
    }

    // Поиск по тексту в названии, авторе, жанре или описании
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { author: { [Op.iLike]: `%${search}%` } },
        { genre: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Фильтр по жанру
    if (genre) {
      whereConditions.genre = { [Op.iLike]: `%${genre}%` };
    }

    // Фильтр по автору
    if (author) {
      whereConditions.author = { [Op.iLike]: `%${author}%` };
    }

    // Фильтр по цене
    if (priceMin !== undefined || priceMax !== undefined) {
      whereConditions.price = {};
      if (priceMin !== undefined) whereConditions.price[Op.gte] = priceMin;
      if (priceMax !== undefined) whereConditions.price[Op.lte] = priceMax;
    }

    // Фильтр по категориям (JSONB)
    if (categories) {
      const categoryArray = Array.isArray(categories)
        ? categories
        : [categories];
      whereConditions.metadata = {
        [Op.and]: categoryArray.map((category) => ({
          categories: { [Op.contains]: [category] },
        })),
      };
    }

    // Настройка сортировки
    const orderOptions = [];
    const validSortFields = {
      popularity: "popularity",
      price: "price",
      created_at: "created_at",
      title: "title",
    };

    if (validSortFields[sortBy]) {
      orderOptions.push([validSortFields[sortBy], sortOrder.toUpperCase()]);
    }

    // Дополнительная сортировка для стабильности
    if (sortBy !== "created_at") {
      orderOptions.push(["created_at", "DESC"]);
    }

    // Пагинация
    const offset = (page - 1) * limit;

    // Выполнение запроса
    const { count, rows: books } = await Book.findAndCountAll({
      where: whereConditions,
      order: orderOptions,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });

    // Преобразование данных для фронтенда
    const booksData = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: parseFloat(book.price),
      description: book.description,
      short_description: book.short_description,
      image: book.image,
      popularity: book.popularity,
      stock: book.stock,
      available: book.stock > 0,
      categories: book.getCategories(),
      price_category: book.getPriceCategory(),
      metadata: book.metadata,
      created_at: book.created_at,
    }));

    // Информация о пагинации
    const totalPages = Math.ceil(count / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.json({
      success: true,
      data: {
        books: booksData,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: count,
          pages: totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: {
          search,
          genre,
          author,
          priceMin,
          priceMax,
          categories: Array.isArray(categories)
            ? categories
            : categories
            ? [categories]
            : null,
          sortBy,
          sortOrder,
          onlyAvailable,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка получения списка книг:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Получение детальной информации о книге
 * GET /api/books/:id
 */
const getBookById = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    const bookData = {
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: parseFloat(book.price),
      description: book.description,
      short_description: book.short_description,
      image: book.image,
      popularity: book.popularity,
      stock: book.stock,
      available: book.stock > 0,
      categories: book.getCategories(),
      price_category: book.getPriceCategory(),
      metadata: book.metadata,
      created_at: book.created_at,
      updated_at: book.updated_at,
    };

    res.json({
      success: true,
      data: { book: bookData },
    });
  } catch (error) {
    console.error("Ошибка получения книги:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Получение популярных книг
 * GET /api/books/popular
 */
const getPopularBooks = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const books = await Book.findPopular(parseInt(limit));

    const booksData = books.map((book) => ({
      id: book.id,
      title: book.title,
      author: book.author,
      genre: book.genre,
      price: parseFloat(book.price),
      short_description: book.short_description,
      image: book.image,
      popularity: book.popularity,
      stock: book.stock,
      available: book.stock > 0,
      categories: book.getCategories(),
      price_category: book.getPriceCategory(),
    }));

    res.json({
      success: true,
      data: { books: booksData },
    });
  } catch (error) {
    console.error("Ошибка получения популярных книг:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Покупка книги
 * POST /api/books/:id/purchase
 */
const purchaseBook = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { quantity = 1 } = req.body;
    const user = req.user;

    // Находим книгу
    const book = await Book.findByPk(id, { transaction });
    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    // Проверяем наличие на складе
    if (book.stock < quantity) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Доступно: ${book.stock} экз.`,
      });
    }

    // Выполняем покупку (атомарная операция)
    await Book.purchaseBooks(id, quantity, transaction);

    // Рассчитываем стоимость
    const totalPrice = parseFloat(book.price) * quantity;

    // Добавляем заказ в историю пользователя
    const orderData = {
      book_id: book.id,
      title: book.title,
      quantity: quantity,
      price: parseFloat(book.price),
      total: totalPrice,
    };

    // Обновляем пользователя в рамках той же транзакции
    const currentOrders = user.orders_history || [];
    const newOrder = {
      order_id: require("crypto").randomUUID(),
      book_id: orderData.book_id,
      title: orderData.title,
      quantity: orderData.quantity,
      price: orderData.price,
      total: orderData.total,
      date: new Date().toISOString(),
    };

    currentOrders.push(newOrder);

    await user.update(
      {
        orders_history: currentOrders,
      },
      { transaction }
    );

    // Подтверждаем транзакцию
    await transaction.commit();

    // Получаем обновленные данные
    await book.reload();
    await user.reload();

    res.json({
      success: true,
      message: "Книга успешно куплена",
      data: {
        order: newOrder,
        book: {
          id: book.id,
          title: book.title,
          stock: book.stock,
          popularity: book.popularity,
        },
        user: {
          orders_count: user.getOrdersCount(),
          total_spent: user.getTotalSpent(),
        },
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Ошибка покупки книги:", error);

    if (error.message.includes("Недостаточно товара")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Получение статистики по книгам
 * GET /api/books/stats
 */
const getBooksStats = async (req, res) => {
  try {
    const stats = await Book.getStats();

    // Дополнительная статистика
    const averagePrice = await Book.findOne({
      attributes: [
        [sequelize.fn("AVG", sequelize.col("price")), "avg_price"],
        [sequelize.fn("MIN", sequelize.col("price")), "min_price"],
        [sequelize.fn("MAX", sequelize.col("price")), "max_price"],
      ],
      raw: true,
    });

    const topGenres = await Book.findAll({
      attributes: [
        "genre",
        [sequelize.fn("COUNT", "*"), "count"],
        [sequelize.fn("SUM", sequelize.col("stock")), "total_stock"],
      ],
      group: ["genre"],
      order: [[sequelize.fn("COUNT", "*"), "DESC"]],
      limit: 5,
      raw: true,
    });

    res.json({
      success: true,
      data: {
        books: stats,
        pricing: {
          average: parseFloat(averagePrice.avg_price || 0),
          min: parseFloat(averagePrice.min_price || 0),
          max: parseFloat(averagePrice.max_price || 0),
        },
        genres: topGenres.map((genre) => ({
          name: genre.genre,
          count: parseInt(genre.count),
          stock: parseInt(genre.total_stock || 0),
        })),
      },
    });
  } catch (error) {
    console.error("Ошибка получения статистики:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

module.exports = {
  getBooks,
  getBookById,
  getPopularBooks,
  purchaseBook,
  getBooksStats,
};
