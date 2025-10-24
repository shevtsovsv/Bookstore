# 📚 Пошаговое создание API для книг

## 📋 Обзор

API для книг - это центральная часть системы книжного магазина. Она обеспечивает:

- Получение списка книг с фильтрацией и поиском
- Детальную информацию о конкретной книге
- Управление каталогом книг (CRUD операции)
- Связи с авторами, категориями и издательствами

## 🛠 Технологии

- **Sequelize** - ORM для работы с базой данных
- **express-validator** - валидация входящих данных
- **Ассоциации Sequelize** - связи между моделями

## 📁 Структура файлов

```
src/
├── controllers/booksController.js    # Бизнес-логика работы с книгами
├── routes/books.js                  # Маршруты API для книг
└── middleware/
    ├── auth.js                      # Проверка аутентификации
    └── booksValidation.js           # Валидация данных книг
```

## 🔧 Шаг 1: Middleware валидации (`src/middleware/booksValidation.js`)

```javascript
const { body, query, param } = require("express-validator");

/**
 * Валидация создания новой книги
 */
const validateCreateBook = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Название книги обязательно")
    .isLength({ max: 255 })
    .withMessage("Название не должно превышать 255 символов"),

  body("isbn")
    .trim()
    .notEmpty()
    .withMessage("ISBN обязателен")
    .matches(
      /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[0-9]{1,5}[- ][0-9]+[- ][0-9]+[- ][0-9X]$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)(?:97[89][- ]?)?[0-9]{1,5}[- ]?[0-9]+[- ]?[0-9]+[- ]?[0-9X]$/
    )
    .withMessage("Некорректный формат ISBN"),

  body("categoryId")
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),

  body("publisherId")
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),

  body("publicationYear")
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Год публикации должен быть между 1800 и ${new Date().getFullYear() + 1}`
    ),

  body("pages")
    .isInt({ min: 1 })
    .withMessage("Количество страниц должно быть положительным числом"),

  body("price")
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть положительным числом"),

  body("priceCategory")
    .isIn(["budget", "standard", "premium"])
    .withMessage("Категория цены должна быть: budget, standard или premium"),

  body("stock")
    .isInt({ min: 0 })
    .withMessage("Количество на складе должно быть неотрицательным числом"),

  body("shortDescription")
    .trim()
    .notEmpty()
    .withMessage("Краткое описание обязательно")
    .isLength({ max: 500 })
    .withMessage("Краткое описание не должно превышать 500 символов"),

  body("fullDescription")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Полное описание не должно превышать 2000 символов"),

  body("language")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Язык не должен превышать 50 символов"),

  body("coverImage")
    .optional()
    .trim()
    .isURL()
    .withMessage("Обложка должна быть корректным URL"),

  body("authorIds")
    .isArray({ min: 1 })
    .withMessage("Должен быть указан хотя бы один автор")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("Все ID авторов должны быть положительными числами");
      }
      return true;
    }),
];

/**
 * Валидация обновления книги
 */
const validateUpdateBook = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),

  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Название книги не может быть пустым")
    .isLength({ max: 255 })
    .withMessage("Название не должно превышать 255 символов"),

  body("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),

  body("publisherId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),

  body("publicationYear")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() + 1 })
    .withMessage(
      `Год публикации должен быть между 1800 и ${new Date().getFullYear() + 1}`
    ),

  body("pages")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Количество страниц должно быть положительным числом"),

  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Цена должна быть положительным числом"),

  body("priceCategory")
    .optional()
    .isIn(["budget", "standard", "premium"])
    .withMessage("Категория цены должна быть: budget, standard или premium"),

  body("stock")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Количество на складе должно быть неотрицательным числом"),

  body("shortDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Краткое описание не может быть пустым")
    .isLength({ max: 500 })
    .withMessage("Краткое описание не должно превышать 500 символов"),

  body("fullDescription")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Полное описание не должно превышать 2000 символов"),

  body("authorIds")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Должен быть указан хотя бы один автор")
    .custom((value) => {
      if (!value.every((id) => Number.isInteger(id) && id > 0)) {
        throw new Error("Все ID авторов должны быть положительными числами");
      }
      return true;
    }),
];

/**
 * Валидация параметров поиска и фильтрации
 */
const validateSearchBooks = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Номер страницы должен быть положительным числом"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть от 1 до 100"),

  query("categoryId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),

  query("publisherId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),

  query("authorId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID автора должен быть положительным числом"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Минимальная цена должна быть неотрицательным числом"),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Максимальная цена должна быть неотрицательным числом"),

  query("priceCategory")
    .optional()
    .isIn(["budget", "standard", "premium"])
    .withMessage("Категория цены должна быть: budget, standard или premium"),

  query("minYear")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage("Минимальный год должен быть корректным"),

  query("maxYear")
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage("Максимальный год должен быть корректным"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Поисковый запрос должен содержать от 1 до 100 символов"),

  query("sortBy")
    .optional()
    .isIn(["title", "price", "publicationYear", "createdAt"])
    .withMessage(
      "Сортировка возможна по: title, price, publicationYear, createdAt"
    ),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Порядок сортировки: ASC или DESC"),
];

/**
 * Валидация ID книги в параметре
 */
const validateBookId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),
];

module.exports = {
  validateCreateBook,
  validateUpdateBook,
  validateSearchBooks,
  validateBookId,
};
```

## 🎯 Шаг 2: Контроллер книг (`src/controllers/booksController.js`)

```javascript
const {
  Book,
  Author,
  Category,
  Publisher,
  BookAuthor,
} = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение списка книг с фильтрацией и поиском
 * GET /api/books
 */
const getAllBooks = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const {
      page = 1,
      limit = 10,
      categoryId,
      publisherId,
      authorId,
      minPrice,
      maxPrice,
      priceCategory,
      minYear,
      maxYear,
      search,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Построение условий фильтрации
    const whereConditions = {};

    if (categoryId) {
      whereConditions.categoryId = categoryId;
    }

    if (publisherId) {
      whereConditions.publisherId = publisherId;
    }

    if (minPrice || maxPrice) {
      whereConditions.price = {};
      if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
    }

    if (priceCategory) {
      whereConditions.priceCategory = priceCategory;
    }

    if (minYear || maxYear) {
      whereConditions.publicationYear = {};
      if (minYear) whereConditions.publicationYear[Op.gte] = parseInt(minYear);
      if (maxYear) whereConditions.publicationYear[Op.lte] = parseInt(maxYear);
    }

    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { shortDescription: { [Op.iLike]: `%${search}%` } },
        { "$Authors.name$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    // Построение условий для фильтрации по автору
    const includeConditions = [
      {
        model: Author,
        as: "Authors",
        through: { attributes: [] },
        attributes: ["id", "name", "bio"],
      },
      {
        model: Category,
        as: "Category",
        attributes: ["id", "name", "slug"],
      },
      {
        model: Publisher,
        as: "Publisher",
        attributes: ["id", "name", "country"],
      },
    ];

    // Если фильтруем по автору, добавляем условие
    if (authorId) {
      includeConditions[0].where = { id: authorId };
      includeConditions[0].required = true;
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      distinct: true,
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
          hasNextPage: page < totalPages,
          hasPreviousPage: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get books error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения списка книг",
    });
  }
};

/**
 * Получение конкретной книги по ID
 * GET /api/books/:id
 */
const getBookById = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Author,
          as: "Authors",
          through: { attributes: [] },
          attributes: ["id", "name", "bio", "authorType"],
        },
        {
          model: Category,
          as: "Category",
          attributes: ["id", "name", "slug", "description"],
        },
        {
          model: Publisher,
          as: "Publisher",
          attributes: ["id", "name", "country", "website", "contact_email"],
        },
      ],
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    res.json({
      success: true,
      data: { book },
    });
  } catch (error) {
    console.error("Get book by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книги",
    });
  }
};

/**
 * Создание новой книги
 * POST /api/books
 */
const createBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const {
      title,
      isbn,
      categoryId,
      publisherId,
      publicationYear,
      pages,
      price,
      priceCategory,
      stock,
      shortDescription,
      fullDescription,
      language,
      coverImage,
      authorIds,
    } = req.body;

    // Проверяем существование категории
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Проверяем существование издательства
    const publisher = await Publisher.findByPk(publisherId);
    if (!publisher) {
      return res.status(400).json({
        success: false,
        message: "Издательство не найдено",
      });
    }

    // Проверяем существование авторов
    const authors = await Author.findAll({
      where: { id: { [Op.in]: authorIds } },
    });

    if (authors.length !== authorIds.length) {
      return res.status(400).json({
        success: false,
        message: "Один или несколько авторов не найдены",
      });
    }

    // Проверяем уникальность ISBN
    const existingBook = await Book.findOne({ where: { isbn } });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: "Книга с таким ISBN уже существует",
      });
    }

    // Создаем книгу
    const book = await Book.create({
      title,
      isbn,
      categoryId,
      publisherId,
      publicationYear,
      pages,
      price,
      priceCategory,
      stock,
      shortDescription,
      fullDescription,
      language,
      coverImage,
    });

    // Создаем связи с авторами
    await BookAuthor.bulkCreate(
      authorIds.map((authorId) => ({
        bookId: book.id,
        authorId,
      }))
    );

    // Получаем созданную книгу со всеми связями
    const createdBook = await Book.findByPk(book.id, {
      include: [
        {
          model: Author,
          as: "Authors",
          through: { attributes: [] },
          attributes: ["id", "name", "bio"],
        },
        {
          model: Category,
          as: "Category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Publisher,
          as: "Publisher",
          attributes: ["id", "name", "country"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Книга успешно создана",
      data: { book: createdBook },
    });
  } catch (error) {
    console.error("Create book error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Книга с такими данными уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка создания книги",
    });
  }
};

/**
 * Обновление книги
 * PUT /api/books/:id
 */
const updateBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const updateData = req.body;

    // Проверяем существование книги
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    // Проверяем категорию если она обновляется
    if (updateData.categoryId) {
      const category = await Category.findByPk(updateData.categoryId);
      if (!category) {
        return res.status(400).json({
          success: false,
          message: "Категория не найдена",
        });
      }
    }

    // Проверяем издательство если оно обновляется
    if (updateData.publisherId) {
      const publisher = await Publisher.findByPk(updateData.publisherId);
      if (!publisher) {
        return res.status(400).json({
          success: false,
          message: "Издательство не найдено",
        });
      }
    }

    // Обновляем авторов если они переданы
    if (updateData.authorIds) {
      const authors = await Author.findAll({
        where: { id: { [Op.in]: updateData.authorIds } },
      });

      if (authors.length !== updateData.authorIds.length) {
        return res.status(400).json({
          success: false,
          message: "Один или несколько авторов не найдены",
        });
      }

      // Удаляем старые связи и создаем новые
      await BookAuthor.destroy({ where: { bookId: id } });
      await BookAuthor.bulkCreate(
        updateData.authorIds.map((authorId) => ({
          bookId: id,
          authorId,
        }))
      );

      delete updateData.authorIds; // Удаляем из данных обновления
    }

    // Обновляем книгу
    await book.update(updateData);

    // Получаем обновленную книгу со всеми связями
    const updatedBook = await Book.findByPk(id, {
      include: [
        {
          model: Author,
          as: "Authors",
          through: { attributes: [] },
          attributes: ["id", "name", "bio"],
        },
        {
          model: Category,
          as: "Category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: Publisher,
          as: "Publisher",
          attributes: ["id", "name", "country"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Книга успешно обновлена",
      data: { book: updatedBook },
    });
  } catch (error) {
    console.error("Update book error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления книги",
    });
  }
};

/**
 * Удаление книги
 * DELETE /api/books/:id
 */
const deleteBook = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    // Удаляем связи с авторами
    await BookAuthor.destroy({ where: { bookId: id } });

    // Удаляем книгу
    await book.destroy();

    res.json({
      success: true,
      message: "Книга успешно удалена",
    });
  } catch (error) {
    console.error("Delete book error:", error);

    // Проверяем ошибки внешних ключей
    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Невозможно удалить книгу, так как она используется в других записях",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка удаления книги",
    });
  }
};

/**
 * Получение книг по категории
 * GET /api/books/category/:categoryId
 */
const getBooksByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Проверяем существование категории
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: { categoryId },
      include: [
        {
          model: Author,
          as: "Authors",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
        {
          model: Publisher,
          as: "Publisher",
          attributes: ["id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["title", "ASC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        books,
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalItems: count,
          itemsPerPage: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Get books by category error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книг по категории",
    });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
  getBooksByCategory,
};
```

## 🛣 Шаг 3: Маршруты для книг (`src/routes/books.js`)

```javascript
const express = require("express");
const booksController = require("../controllers/booksController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateCreateBook,
  validateUpdateBook,
  validateSearchBooks,
  validateBookId,
} = require("../middleware/booksValidation");

const router = express.Router();

/**
 * @route   GET /api/books
 * @desc    Получение списка книг с фильтрацией и поиском
 * @access  Public
 * @params  ?page=1&limit=10&categoryId=1&publisherId=1&authorId=1
 *          &minPrice=100&maxPrice=1000&priceCategory=standard
 *          &minYear=2020&maxYear=2023&search=javascript
 *          &sortBy=title&sortOrder=ASC
 */
router.get("/", validateSearchBooks, booksController.getAllBooks);

/**
 * @route   GET /api/books/category/:categoryId
 * @desc    Получение книг определенной категории
 * @access  Public
 * @params  :categoryId - ID категории
 */
router.get("/category/:categoryId", booksController.getBooksByCategory);

/**
 * @route   GET /api/books/:id
 * @desc    Получение конкретной книги по ID
 * @access  Public
 * @params  :id - ID книги
 */
router.get("/:id", validateBookId, booksController.getBookById);

/**
 * @route   POST /api/books
 * @desc    Создание новой книги
 * @access  Private (Admin only)
 * @body    {
 *            title, isbn, categoryId, publisherId, publicationYear,
 *            pages, price, priceCategory, stock, shortDescription,
 *            fullDescription?, language?, coverImage?, authorIds[]
 *          }
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateCreateBook,
  booksController.createBook
);

/**
 * @route   PUT /api/books/:id
 * @desc    Обновление книги
 * @access  Private (Admin only)
 * @params  :id - ID книги
 * @body    { любые поля из создания (опционально) }
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUpdateBook,
  booksController.updateBook
);

/**
 * @route   DELETE /api/books/:id
 * @desc    Удаление книги
 * @access  Private (Admin only)
 * @params  :id - ID книги
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateBookId,
  booksController.deleteBook
);

module.exports = router;
```

## 🔌 Шаг 4: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов книг
const booksRoutes = require("./src/routes/books");
app.use("/api/books", booksRoutes);
```

## 📝 Примеры использования

### Получение списка книг с фильтрацией

```bash
curl "http://localhost:3000/api/books?page=1&limit=5&categoryId=1&minPrice=500&maxPrice=2000&search=javascript&sortBy=price&sortOrder=ASC"
```

### Получение конкретной книги

```bash
curl http://localhost:3000/api/books/1
```

### Создание новой книги (требует авторизации админа)

```bash
curl -X POST http://localhost:3000/api/books \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "title": "Изучаем JavaScript",
    "isbn": "978-5-4461-0923-4",
    "categoryId": 1,
    "publisherId": 1,
    "publicationYear": 2023,
    "pages": 350,
    "price": 1299.99,
    "priceCategory": "standard",
    "stock": 50,
    "shortDescription": "Полное руководство по JavaScript",
    "fullDescription": "Подробное описание книги...",
    "language": "Русский",
    "coverImage": "https://example.com/cover.jpg",
    "authorIds": [1, 2]
  }'
```

### Обновление книги

```bash
curl -X PUT http://localhost:3000/api/books/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "price": 1199.99,
    "stock": 45
  }'
```

### Получение книг по категории

```bash
curl "http://localhost:3000/api/books/category/1?page=1&limit=10"
```

## 🔍 Особенности реализации

### 1. Сложные запросы с ассоциациями

```javascript
// Пример запроса с несколькими связями
const book = await Book.findByPk(id, {
  include: [
    {
      model: Author,
      as: "Authors",
      through: { attributes: [] }, // Исключаем данные промежуточной таблицы
      attributes: ["id", "name", "bio"],
    },
    {
      model: Category,
      as: "Category",
      attributes: ["id", "name", "slug"],
    },
  ],
});
```

### 2. Работа с many-to-many отношениями

```javascript
// Создание связей многие-ко-многим
await BookAuthor.bulkCreate(
  authorIds.map((authorId) => ({
    bookId: book.id,
    authorId,
  }))
);

// Обновление связей
await BookAuthor.destroy({ where: { bookId: id } });
await BookAuthor.bulkCreate(newAssociations);
```

### 3. Сложная фильтрация и поиск

```javascript
// Построение динамических условий WHERE
const whereConditions = {};

if (search) {
  whereConditions[Op.or] = [
    { title: { [Op.iLike]: `%${search}%` } },
    { shortDescription: { [Op.iLike]: `%${search}%` } },
    { "$Authors.name$": { [Op.iLike]: `%${search}%` } },
  ];
}

if (minPrice || maxPrice) {
  whereConditions.price = {};
  if (minPrice) whereConditions.price[Op.gte] = parseFloat(minPrice);
  if (maxPrice) whereConditions.price[Op.lte] = parseFloat(maxPrice);
}
```

## 🔑 Ключевые принципы

1. **Валидация данных**: Тщательная проверка всех входящих параметров
2. **Ассоциации**: Правильная работа со связанными моделями
3. **Пагинация**: Обязательная для больших наборов данных
4. **Фильтрация**: Гибкая система поиска и фильтрации
5. **Права доступа**: Разделение на публичные и административные операции
6. **Производительность**: Оптимизированные запросы с нужными полями

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полнофункциональный CRUD API для книг
- ✅ Сложная система фильтрации и поиска
- ✅ Правильная работа со связанными моделями
- ✅ Пагинация и сортировка результатов
- ✅ Административные права для модификации данных
- ✅ Валидация всех входящих данных
