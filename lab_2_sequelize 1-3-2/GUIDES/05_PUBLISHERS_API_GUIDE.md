# 🏢 Пошаговое создание API для издательств

## 📋 Обзор

API для издательств обеспечивает управление информацией о книжных издательствах. Функциональность включает:

- CRUD операции для управления издательствами
- Получение списка книг конкретного издательства
- Поиск издательств по различным критериям
- Фильтрация по странам и годам основания

## 🛠 Технологии

- **Sequelize** - ORM для работы с базой данных
- **express-validator** - валидация входящих данных
- **One-to-Many** отношения с книгами

## 📁 Структура файлов

```
src/
├── controllers/publishersController.js    # Бизнес-логика издательств
├── routes/publishers.js                   # Маршруты API
└── middleware/
    └── publishersValidation.js            # Валидация данных издательств
```

## 🔧 Шаг 1: Middleware валидации (`src/middleware/publishersValidation.js`)

```javascript
const { body, query, param } = require("express-validator");

/**
 * Валидация создания нового издательства
 */
const validateCreatePublisher = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Название издательства обязательно")
    .isLength({ min: 2, max: 100 })
    .withMessage("Название должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я0-9\s\.\-&'"]+$/)
    .withMessage(
      "Название может содержать буквы, цифры, пробелы и основные знаки препинания"
    ),

  body("country")
    .trim()
    .notEmpty()
    .withMessage("Страна обязательна")
    .isLength({ min: 2, max: 50 })
    .withMessage("Страна должна содержать от 2 до 50 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\-]+$/)
    .withMessage("Страна может содержать только буквы, пробелы и дефисы"),

  body("founded_year")
    .optional()
    .isInt({ min: 1440, max: new Date().getFullYear() })
    .withMessage(
      `Год основания должен быть между 1440 и ${new Date().getFullYear()}`
    ),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Сайт должен быть корректным URL"),

  body("contact_email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email должен быть корректным")
    .normalizeEmail(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Описание не должно превышать 1000 символов"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Адрес не должен превышать 200 символов"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Телефон должен быть в корректном формате"),

  body("logoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Логотип должен быть корректным URL"),
];

/**
 * Валидация обновления издательства
 */
const validateUpdatePublisher = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Название издательства не может быть пустым")
    .isLength({ min: 2, max: 100 })
    .withMessage("Название должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я0-9\s\.\-&'"]+$/)
    .withMessage(
      "Название может содержать буквы, цифры, пробелы и основные знаки препинания"
    ),

  body("country")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Страна не может быть пустой")
    .isLength({ min: 2, max: 50 })
    .withMessage("Страна должна содержать от 2 до 50 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\-]+$/)
    .withMessage("Страна может содержать только буквы, пробелы и дефисы"),

  body("founded_year")
    .optional()
    .isInt({ min: 1440, max: new Date().getFullYear() })
    .withMessage(
      `Год основания должен быть между 1440 и ${new Date().getFullYear()}`
    ),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Сайт должен быть корректным URL"),

  body("contact_email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Email должен быть корректным")
    .normalizeEmail(),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Описание не должно превышать 1000 символов"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  body("address")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Адрес не должен превышать 200 символов"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[\+]?[1-9][\d]{0,15}$/)
    .withMessage("Телефон должен быть в корректном формате"),

  body("logoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Логотип должен быть корректным URL"),
];

/**
 * Валидация параметров поиска издательств
 */
const validateSearchPublishers = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Номер страницы должен быть положительным числом"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть от 1 до 100"),

  query("search")
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage("Поисковый запрос должен содержать от 1 до 100 символов"),

  query("country")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Страна не должна превышать 50 символов"),

  query("minYear")
    .optional()
    .isInt({ min: 1440, max: new Date().getFullYear() })
    .withMessage("Минимальный год должен быть корректным"),

  query("maxYear")
    .optional()
    .isInt({ min: 1440, max: new Date().getFullYear() })
    .withMessage("Максимальный год должен быть корректным"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  query("sortBy")
    .optional()
    .isIn(["name", "country", "founded_year", "createdAt"])
    .withMessage(
      "Сортировка возможна по: name, country, founded_year, createdAt"
    ),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Порядок сортировки: ASC или DESC"),
];

/**
 * Валидация ID издательства в параметре
 */
const validatePublisherId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),
];

module.exports = {
  validateCreatePublisher,
  validateUpdatePublisher,
  validateSearchPublishers,
  validatePublisherId,
};
```

## 🎯 Шаг 2: Контроллер издательств (`src/controllers/publishersController.js`)

```javascript
const { Publisher, Book } = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение списка издательств с фильтрацией и поиском
 * GET /api/publishers
 */
const getAllPublishers = async (req, res) => {
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
      search,
      country,
      minYear,
      maxYear,
      isActive,
      sortBy = "name",
      sortOrder = "ASC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Построение условий фильтрации
    const whereConditions = {};

    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (country) {
      whereConditions.country = { [Op.iLike]: `%${country}%` };
    }

    if (minYear || maxYear) {
      whereConditions.founded_year = {};
      if (minYear) whereConditions.founded_year[Op.gte] = parseInt(minYear);
      if (maxYear) whereConditions.founded_year[Op.lte] = parseInt(maxYear);
    }

    if (isActive !== undefined) {
      whereConditions.isActive = isActive === "true";
    }

    const { count, rows: publishers } = await Publisher.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: Book,
          as: "Books",
          attributes: ["id", "title"],
          required: false,
        },
      ],
    });

    // Добавляем количество книг к каждому издательству
    const publishersWithBookCount = publishers.map((publisher) => ({
      ...publisher.toJSON(),
      bookCount: publisher.Books ? publisher.Books.length : 0,
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        publishers: publishersWithBookCount,
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
    console.error("Get publishers error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения списка издательств",
    });
  }
};

/**
 * Получение конкретного издательства по ID
 * GET /api/publishers/:id
 */
const getPublisherById = async (req, res) => {
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

    const publisher = await Publisher.findByPk(id, {
      include: [
        {
          model: Book,
          as: "Books",
          attributes: ["id", "title", "isbn", "publicationYear", "price"],
          include: [
            {
              model: require("../../models").Category,
              as: "Category",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
      ],
    });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Издательство не найдено",
      });
    }

    res.json({
      success: true,
      data: { publisher },
    });
  } catch (error) {
    console.error("Get publisher by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения издательства",
    });
  }
};

/**
 * Создание нового издательства
 * POST /api/publishers
 */
const createPublisher = async (req, res) => {
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
      name,
      country,
      founded_year,
      website,
      contact_email,
      description,
      isActive = true,
      address,
      phone,
      logoUrl,
    } = req.body;

    // Проверяем уникальность названия издательства
    const existingPublisher = await Publisher.findOne({
      where: { name: { [Op.iLike]: name } },
    });

    if (existingPublisher) {
      return res.status(400).json({
        success: false,
        message: "Издательство с таким названием уже существует",
      });
    }

    const publisher = await Publisher.create({
      name,
      country,
      founded_year,
      website,
      contact_email,
      description,
      isActive,
      address,
      phone,
      logoUrl,
    });

    res.status(201).json({
      success: true,
      message: "Издательство успешно создано",
      data: { publisher },
    });
  } catch (error) {
    console.error("Create publisher error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Издательство с такими данными уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка создания издательства",
    });
  }
};

/**
 * Обновление издательства
 * PUT /api/publishers/:id
 */
const updatePublisher = async (req, res) => {
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

    // Проверяем существование издательства
    const publisher = await Publisher.findByPk(id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Издательство не найдено",
      });
    }

    // Проверяем уникальность названия при обновлении
    if (updateData.name) {
      const existingPublisher = await Publisher.findOne({
        where: {
          name: { [Op.iLike]: updateData.name },
          id: { [Op.ne]: id },
        },
      });

      if (existingPublisher) {
        return res.status(400).json({
          success: false,
          message: "Издательство с таким названием уже существует",
        });
      }
    }

    await publisher.update(updateData);

    // Получаем обновленное издательство
    const updatedPublisher = await Publisher.findByPk(id, {
      include: [
        {
          model: Book,
          as: "Books",
          attributes: ["id", "title"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Издательство успешно обновлено",
      data: { publisher: updatedPublisher },
    });
  } catch (error) {
    console.error("Update publisher error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления издательства",
    });
  }
};

/**
 * Удаление издательства
 * DELETE /api/publishers/:id
 */
const deletePublisher = async (req, res) => {
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

    const publisher = await Publisher.findByPk(id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Издательство не найдено",
      });
    }

    // Проверяем наличие связанных книг
    const bookCount = await Book.count({ where: { publisherId: id } });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить издательство. У него есть ${bookCount} связанных книг(и)`,
      });
    }

    await publisher.destroy();

    res.json({
      success: true,
      message: "Издательство успешно удалено",
    });
  } catch (error) {
    console.error("Delete publisher error:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Невозможно удалить издательство, так как оно связано с книгами",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка удаления издательства",
    });
  }
};

/**
 * Получение книг конкретного издательства
 * GET /api/publishers/:id/books
 */
const getPublisherBooks = async (req, res) => {
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
    const {
      page = 1,
      limit = 10,
      sortBy = "publicationYear",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;

    // Проверяем существование издательства
    const publisher = await Publisher.findByPk(id, {
      attributes: ["id", "name", "country"],
    });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: "Издательство не найдено",
      });
    }

    // Получаем книги издательства
    const { count, rows: books } = await Book.findAndCountAll({
      where: { publisherId: id },
      include: [
        {
          model: require("../../models").Category,
          as: "Category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: require("../../models").Author,
          as: "Authors",
          through: { attributes: [] },
          attributes: ["id", "name", "authorType"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        publisher,
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
    console.error("Get publisher books error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книг издательства",
    });
  }
};

/**
 * Получение статистики по издательствам
 * GET /api/publishers/stats
 */
const getPublishersStats = async (req, res) => {
  try {
    // Общее количество издательств
    const totalPublishers = await Publisher.count();

    // Количество активных издательств
    const activePublishers = await Publisher.count({
      where: { isActive: true },
    });

    // Статистика по странам
    const countryStats = await Publisher.findAll({
      attributes: [
        "country",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      group: ["country"],
      order: [
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "DESC",
        ],
      ],
      limit: 10,
      raw: true,
    });

    // Издательства по десятилетиям
    const decadeStats = await Publisher.findAll({
      attributes: [
        [
          require("sequelize").fn(
            "FLOOR",
            require("sequelize").literal("founded_year / 10 * 10")
          ),
          "decade",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      where: {
        founded_year: { [Op.not]: null },
      },
      group: [
        require("sequelize").fn(
          "FLOOR",
          require("sequelize").literal("founded_year / 10 * 10")
        ),
      ],
      order: [
        [
          require("sequelize").fn(
            "FLOOR",
            require("sequelize").literal("founded_year / 10 * 10")
          ),
          "DESC",
        ],
      ],
      raw: true,
    });

    // Топ-10 издательств по количеству книг
    const topPublishers = await Publisher.findAll({
      attributes: [
        "id",
        "name",
        "country",
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("Books.id")
          ),
          "bookCount",
        ],
      ],
      include: [
        {
          model: Book,
          as: "Books",
          attributes: [],
        },
      ],
      group: ["Publisher.id"],
      order: [
        [
          require("sequelize").fn(
            "COUNT",
            require("sequelize").col("Books.id")
          ),
          "DESC",
        ],
      ],
      limit: 10,
      raw: true,
    });

    res.json({
      success: true,
      data: {
        totalPublishers,
        activePublishers,
        inactivePublishers: totalPublishers - activePublishers,
        countryStats,
        decadeStats,
        topPublishers,
      },
    });
  } catch (error) {
    console.error("Get publishers stats error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения статистики издательств",
    });
  }
};

/**
 * Получение списка стран издательств
 * GET /api/publishers/countries
 */
const getPublisherCountries = async (req, res) => {
  try {
    const countries = await Publisher.findAll({
      attributes: [
        [
          require("sequelize").fn(
            "DISTINCT",
            require("sequelize").col("country")
          ),
          "country",
        ],
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      group: ["country"],
      order: [["country", "ASC"]],
      raw: true,
    });

    res.json({
      success: true,
      data: { countries },
    });
  } catch (error) {
    console.error("Get publisher countries error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения списка стран",
    });
  }
};

module.exports = {
  getAllPublishers,
  getPublisherById,
  createPublisher,
  updatePublisher,
  deletePublisher,
  getPublisherBooks,
  getPublishersStats,
  getPublisherCountries,
};
```

## 🛣 Шаг 3: Маршруты для издательств (`src/routes/publishers.js`)

```javascript
const express = require("express");
const publishersController = require("../controllers/publishersController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateCreatePublisher,
  validateUpdatePublisher,
  validateSearchPublishers,
  validatePublisherId,
} = require("../middleware/publishersValidation");

const router = express.Router();

/**
 * @route   GET /api/publishers/stats
 * @desc    Получение статистики по издательствам
 * @access  Public
 */
router.get("/stats", publishersController.getPublishersStats);

/**
 * @route   GET /api/publishers/countries
 * @desc    Получение списка стран издательств
 * @access  Public
 */
router.get("/countries", publishersController.getPublisherCountries);

/**
 * @route   GET /api/publishers
 * @desc    Получение списка издательств с фильтрацией и поиском
 * @access  Public
 * @params  ?page=1&limit=10&search=penguin&country=usa
 *          &minYear=1900&maxYear=2000&isActive=true
 *          &sortBy=name&sortOrder=ASC
 */
router.get(
  "/",
  validateSearchPublishers,
  publishersController.getAllPublishers
);

/**
 * @route   GET /api/publishers/:id
 * @desc    Получение конкретного издательства по ID
 * @access  Public
 * @params  :id - ID издательства
 */
router.get("/:id", validatePublisherId, publishersController.getPublisherById);

/**
 * @route   GET /api/publishers/:id/books
 * @desc    Получение книг конкретного издательства
 * @access  Public
 * @params  :id - ID издательства
 * @query   ?page=1&limit=10&sortBy=publicationYear&sortOrder=DESC
 */
router.get(
  "/:id/books",
  validatePublisherId,
  publishersController.getPublisherBooks
);

/**
 * @route   POST /api/publishers
 * @desc    Создание нового издательства
 * @access  Private (Admin only)
 * @body    {
 *            name, country, founded_year?, website?, contact_email?,
 *            description?, isActive?, address?, phone?, logoUrl?
 *          }
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateCreatePublisher,
  publishersController.createPublisher
);

/**
 * @route   PUT /api/publishers/:id
 * @desc    Обновление издательства
 * @access  Private (Admin only)
 * @params  :id - ID издательства
 * @body    { любые поля из создания (опционально) }
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUpdatePublisher,
  publishersController.updatePublisher
);

/**
 * @route   DELETE /api/publishers/:id
 * @desc    Удаление издательства
 * @access  Private (Admin only)
 * @params  :id - ID издательства
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validatePublisherId,
  publishersController.deletePublisher
);

module.exports = router;
```

## 🔌 Шаг 4: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов издательств
const publishersRoutes = require("./src/routes/publishers");
app.use("/api/publishers", publishersRoutes);
```

## 📝 Примеры использования

### Получение списка издательств с фильтрацией

```bash
curl "http://localhost:3000/api/publishers?page=1&limit=5&country=россия&minYear=1950&maxYear=2000&search=литература&sortBy=founded_year&sortOrder=DESC"
```

### Получение конкретного издательства

```bash
curl http://localhost:3000/api/publishers/1
```

### Создание нового издательства

```bash
curl -X POST http://localhost:3000/api/publishers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Эксмо",
    "country": "Россия",
    "founded_year": 1991,
    "website": "https://eksmo.ru",
    "contact_email": "info@eksmo.ru",
    "description": "Крупнейшее российское издательство",
    "address": "Москва, ул. Зорге, 1",
    "phone": "+7 (495) 411-68-86",
    "isActive": true
  }'
```

### Получение книг издательства

```bash
curl "http://localhost:3000/api/publishers/1/books?page=1&limit=10&sortBy=publicationYear&sortOrder=DESC"
```

### Получение статистики издательств

```bash
curl http://localhost:3000/api/publishers/stats
```

### Получение списка стран

```bash
curl http://localhost:3000/api/publishers/countries
```

## 🔍 Особенности реализации

### 1. Валидация года основания

```javascript
// Проверка разумных границ для года основания
body("founded_year")
  .optional()
  .isInt({ min: 1440, max: new Date().getFullYear() })
  .withMessage(
    `Год основания должен быть между 1440 и ${new Date().getFullYear()}`
  );
```

### 2. Статистика по десятилетиям

```javascript
// Группировка издательств по десятилетиям
const decadeStats = await Publisher.findAll({
  attributes: [
    [
      sequelize.fn("FLOOR", sequelize.literal("founded_year / 10 * 10")),
      "decade",
    ],
    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
  ],
  group: [sequelize.fn("FLOOR", sequelize.literal("founded_year / 10 * 10"))],
  order: [
    [
      sequelize.fn("FLOOR", sequelize.literal("founded_year / 10 * 10")),
      "DESC",
    ],
  ],
});
```

### 3. Поиск по нескольким полям

```javascript
// Поиск по названию и описанию
if (search) {
  whereConditions[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { description: { [Op.iLike]: `%${search}%` } },
  ];
}
```

### 4. Валидация контактной информации

```javascript
// Валидация телефона в международном формате
body("phone")
  .optional()
  .matches(/^[\+]?[1-9][\d]{0,15}$/)
  .withMessage("Телефон должен быть в корректном формате");
```

### 5. Подсчет связанных записей

```javascript
// Включение количества книг в результат
const publishersWithBookCount = publishers.map((publisher) => ({
  ...publisher.toJSON(),
  bookCount: publisher.Books ? publisher.Books.length : 0,
}));
```

## 🔑 Ключевые принципы

1. **Интернационализация**: Поддержка издательств из разных стран
2. **Историческая точность**: Валидация годов основания
3. **Контактная информация**: Полная информация для связи
4. **Статистический анализ**: Аналитика по странам и периодам
5. **Производительность**: Оптимизированные запросы с агрегацией
6. **Целостность данных**: Проверка связей перед удалением

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полный CRUD API для издательств
- ✅ Фильтрация по странам и годам основания
- ✅ Поиск по названию и описанию
- ✅ Статистика по странам и десятилетиям
- ✅ Управление контактной информацией
- ✅ Связи с книгами через One-to-Many
- ✅ Валидация всех типов данных
- ✅ Аналитические возможности для администраторов
