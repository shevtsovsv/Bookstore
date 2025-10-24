# 👥 Пошаговое создание API для авторов

## 📋 Обзор

API для авторов обеспечивает управление информацией о писателях и их произведениях. Функциональность включает:

- CRUD операции для управления авторами
- Получение списка книг конкретного автора
- Поиск авторов по имени
- Управление типами авторов (писатель, переводчик, редактор)

## 🛠 Технологии

- **Sequelize** - ORM для работы с базой данных
- **express-validator** - валидация входящих данных
- **Many-to-Many** отношения с книгами через BookAuthor

## 📁 Структура файлов

```
src/
├── controllers/authorsController.js    # Бизнес-логика авторов
├── routes/authors.js                   # Маршруты API
└── middleware/
    └── authorsValidation.js            # Валидация данных авторов
```

## 🔧 Шаг 1: Middleware валидации (`src/middleware/authorsValidation.js`)

```javascript
const { body, query, param } = require("express-validator");

/**
 * Валидация создания нового автора
 */
const validateCreateAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Имя автора обязательно")
    .isLength({ min: 2, max: 100 })
    .withMessage("Имя должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\.\-']+$/)
    .withMessage(
      "Имя может содержать только буквы, пробелы, точки, дефисы и апострофы"
    ),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Биография не должна превышать 2000 символов"),

  body("authorType")
    .isIn(["author", "translator", "editor", "compiler"])
    .withMessage(
      "Тип автора должен быть: author, translator, editor или compiler"
    ),

  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Дата рождения должна быть в формате ISO 8601 (YYYY-MM-DD)")
    .custom((value) => {
      const birthDate = new Date(value);
      const currentDate = new Date();

      if (birthDate > currentDate) {
        throw new Error("Дата рождения не может быть в будущем");
      }

      const minDate = new Date("1800-01-01");
      if (birthDate < minDate) {
        throw new Error("Дата рождения не может быть раньше 1800 года");
      }

      return true;
    }),

  body("deathDate")
    .optional()
    .isISO8601()
    .withMessage("Дата смерти должна быть в формате ISO 8601 (YYYY-MM-DD)")
    .custom((value, { req }) => {
      const deathDate = new Date(value);
      const currentDate = new Date();

      if (deathDate > currentDate) {
        throw new Error("Дата смерти не может быть в будущем");
      }

      if (req.body.birthDate) {
        const birthDate = new Date(req.body.birthDate);
        if (deathDate <= birthDate) {
          throw new Error("Дата смерти должна быть позже даты рождения");
        }
      }

      return true;
    }),

  body("nationality")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Национальность не должна превышать 50 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\-]+$/)
    .withMessage(
      "Национальность может содержать только буквы, пробелы и дефисы"
    ),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Сайт должен быть корректным URL"),

  body("photoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Фото должно быть корректным URL"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),
];

/**
 * Валидация обновления автора
 */
const validateUpdateAuthor = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID автора должен быть положительным числом"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Имя автора не может быть пустым")
    .isLength({ min: 2, max: 100 })
    .withMessage("Имя должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\.\-']+$/)
    .withMessage(
      "Имя может содержать только буквы, пробелы, точки, дефисы и апострофы"
    ),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Биография не должна превышать 2000 символов"),

  body("authorType")
    .optional()
    .isIn(["author", "translator", "editor", "compiler"])
    .withMessage(
      "Тип автора должен быть: author, translator, editor или compiler"
    ),

  body("birthDate")
    .optional()
    .isISO8601()
    .withMessage("Дата рождения должна быть в формате ISO 8601 (YYYY-MM-DD)")
    .custom((value) => {
      const birthDate = new Date(value);
      const currentDate = new Date();

      if (birthDate > currentDate) {
        throw new Error("Дата рождения не может быть в будущем");
      }

      return true;
    }),

  body("deathDate")
    .optional()
    .isISO8601()
    .withMessage("Дата смерти должна быть в формате ISO 8601 (YYYY-MM-DD)")
    .custom((value, { req }) => {
      const deathDate = new Date(value);
      const currentDate = new Date();

      if (deathDate > currentDate) {
        throw new Error("Дата смерти не может быть в будущем");
      }

      return true;
    }),

  body("nationality")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Национальность не должна превышать 50 символов")
    .matches(/^[a-zA-Zа-яА-Я\s\-]+$/)
    .withMessage(
      "Национальность может содержать только буквы, пробелы и дефисы"
    ),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Сайт должен быть корректным URL"),

  body("photoUrl")
    .optional()
    .trim()
    .isURL()
    .withMessage("Фото должно быть корректным URL"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),
];

/**
 * Валидация параметров поиска авторов
 */
const validateSearchAuthors = [
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

  query("authorType")
    .optional()
    .isIn(["author", "translator", "editor", "compiler"])
    .withMessage(
      "Тип автора должен быть: author, translator, editor или compiler"
    ),

  query("nationality")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Национальность не должна превышать 50 символов"),

  query("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  query("sortBy")
    .optional()
    .isIn(["name", "authorType", "birthDate", "createdAt"])
    .withMessage(
      "Сортировка возможна по: name, authorType, birthDate, createdAt"
    ),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Порядок сортировки: ASC или DESC"),
];

/**
 * Валидация ID автора в параметре
 */
const validateAuthorId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID автора должен быть положительным числом"),
];

module.exports = {
  validateCreateAuthor,
  validateUpdateAuthor,
  validateSearchAuthors,
  validateAuthorId,
};
```

## 🎯 Шаг 2: Контроллер авторов (`src/controllers/authorsController.js`)

```javascript
const { Author, Book, BookAuthor } = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение списка авторов с фильтрацией и поиском
 * GET /api/authors
 */
const getAllAuthors = async (req, res) => {
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
      authorType,
      nationality,
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
        { bio: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (authorType) {
      whereConditions.authorType = authorType;
    }

    if (nationality) {
      whereConditions.nationality = { [Op.iLike]: `%${nationality}%` };
    }

    if (isActive !== undefined) {
      whereConditions.isActive = isActive === "true";
    }

    const { count, rows: authors } = await Author.findAndCountAll({
      where: whereConditions,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: Book,
          as: "Books",
          through: { attributes: [] },
          attributes: ["id", "title", "isbn"],
          required: false,
        },
      ],
    });

    // Добавляем количество книг к каждому автору
    const authorsWithBookCount = authors.map((author) => ({
      ...author.toJSON(),
      bookCount: author.Books ? author.Books.length : 0,
    }));

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        authors: authorsWithBookCount,
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
    console.error("Get authors error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения списка авторов",
    });
  }
};

/**
 * Получение конкретного автора по ID
 * GET /api/authors/:id
 */
const getAuthorById = async (req, res) => {
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

    const author = await Author.findByPk(id, {
      include: [
        {
          model: Book,
          as: "Books",
          through: { attributes: [] },
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

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    res.json({
      success: true,
      data: { author },
    });
  } catch (error) {
    console.error("Get author by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения автора",
    });
  }
};

/**
 * Создание нового автора
 * POST /api/authors
 */
const createAuthor = async (req, res) => {
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
      bio,
      authorType,
      birthDate,
      deathDate,
      nationality,
      website,
      photoUrl,
      isActive = true,
    } = req.body;

    // Проверяем уникальность имени автора
    const existingAuthor = await Author.findOne({
      where: { name: { [Op.iLike]: name } },
    });

    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: "Автор с таким именем уже существует",
      });
    }

    const author = await Author.create({
      name,
      bio,
      authorType,
      birthDate: birthDate ? new Date(birthDate) : null,
      deathDate: deathDate ? new Date(deathDate) : null,
      nationality,
      website,
      photoUrl,
      isActive,
    });

    res.status(201).json({
      success: true,
      message: "Автор успешно создан",
      data: { author },
    });
  } catch (error) {
    console.error("Create author error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Автор с такими данными уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка создания автора",
    });
  }
};

/**
 * Обновление автора
 * PUT /api/authors/:id
 */
const updateAuthor = async (req, res) => {
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

    // Проверяем существование автора
    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Проверяем уникальность имени при обновлении
    if (updateData.name) {
      const existingAuthor = await Author.findOne({
        where: {
          name: { [Op.iLike]: updateData.name },
          id: { [Op.ne]: id },
        },
      });

      if (existingAuthor) {
        return res.status(400).json({
          success: false,
          message: "Автор с таким именем уже существует",
        });
      }
    }

    // Преобразуем даты если они переданы
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }
    if (updateData.deathDate) {
      updateData.deathDate = new Date(updateData.deathDate);
    }

    // Дополнительная проверка дат
    if (updateData.birthDate && updateData.deathDate) {
      if (updateData.deathDate <= updateData.birthDate) {
        return res.status(400).json({
          success: false,
          message: "Дата смерти должна быть позже даты рождения",
        });
      }
    }

    await author.update(updateData);

    // Получаем обновленного автора
    const updatedAuthor = await Author.findByPk(id, {
      include: [
        {
          model: Book,
          as: "Books",
          through: { attributes: [] },
          attributes: ["id", "title", "isbn"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Автор успешно обновлен",
      data: { author: updatedAuthor },
    });
  } catch (error) {
    console.error("Update author error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления автора",
    });
  }
};

/**
 * Удаление автора
 * DELETE /api/authors/:id
 */
const deleteAuthor = async (req, res) => {
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

    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Проверяем наличие связанных книг
    const bookCount = await BookAuthor.count({ where: { authorId: id } });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить автора. У него есть ${bookCount} связанных книг(и)`,
      });
    }

    await author.destroy();

    res.json({
      success: true,
      message: "Автор успешно удален",
    });
  } catch (error) {
    console.error("Delete author error:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Невозможно удалить автора, так как он связан с книгами",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка удаления автора",
    });
  }
};

/**
 * Получение книг конкретного автора
 * GET /api/authors/:id/books
 */
const getAuthorBooks = async (req, res) => {
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
    const { page = 1, limit = 10 } = req.query;

    const offset = (page - 1) * limit;

    // Проверяем существование автора
    const author = await Author.findByPk(id, {
      attributes: ["id", "name", "authorType"],
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Получаем книги автора
    const { count, rows: books } = await Book.findAndCountAll({
      include: [
        {
          model: Author,
          as: "Authors",
          through: { attributes: [] },
          where: { id },
          attributes: ["id", "name", "authorType"],
        },
        {
          model: require("../../models").Category,
          as: "Category",
          attributes: ["id", "name", "slug"],
        },
        {
          model: require("../../models").Publisher,
          as: "Publisher",
          attributes: ["id", "name"],
        },
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [["publicationYear", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        author,
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
    console.error("Get author books error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книг автора",
    });
  }
};

/**
 * Получение статистики по авторам
 * GET /api/authors/stats
 */
const getAuthorsStats = async (req, res) => {
  try {
    // Общее количество авторов
    const totalAuthors = await Author.count();

    // Количество активных авторов
    const activeAuthors = await Author.count({ where: { isActive: true } });

    // Статистика по типам авторов
    const authorTypeStats = await Author.findAll({
      attributes: [
        "authorType",
        [
          require("sequelize").fn("COUNT", require("sequelize").col("id")),
          "count",
        ],
      ],
      group: ["authorType"],
      raw: true,
    });

    // Топ-10 авторов по количеству книг
    const topAuthors = await Author.findAll({
      attributes: [
        "id",
        "name",
        "authorType",
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
          through: { attributes: [] },
          attributes: [],
        },
      ],
      group: ["Author.id"],
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
        totalAuthors,
        activeAuthors,
        inactiveAuthors: totalAuthors - activeAuthors,
        authorTypeStats,
        topAuthors,
      },
    });
  } catch (error) {
    console.error("Get authors stats error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения статистики авторов",
    });
  }
};

module.exports = {
  getAllAuthors,
  getAuthorById,
  createAuthor,
  updateAuthor,
  deleteAuthor,
  getAuthorBooks,
  getAuthorsStats,
};
```

## 🛣 Шаг 3: Маршруты для авторов (`src/routes/authors.js`)

```javascript
const express = require("express");
const authorsController = require("../controllers/authorsController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateCreateAuthor,
  validateUpdateAuthor,
  validateSearchAuthors,
  validateAuthorId,
} = require("../middleware/authorsValidation");

const router = express.Router();

/**
 * @route   GET /api/authors/stats
 * @desc    Получение статистики по авторам
 * @access  Public
 */
router.get("/stats", authorsController.getAuthorsStats);

/**
 * @route   GET /api/authors
 * @desc    Получение списка авторов с фильтрацией и поиском
 * @access  Public
 * @params  ?page=1&limit=10&search=tolstoy&authorType=author
 *          &nationality=russian&isActive=true
 *          &sortBy=name&sortOrder=ASC
 */
router.get("/", validateSearchAuthors, authorsController.getAllAuthors);

/**
 * @route   GET /api/authors/:id
 * @desc    Получение конкретного автора по ID
 * @access  Public
 * @params  :id - ID автора
 */
router.get("/:id", validateAuthorId, authorsController.getAuthorById);

/**
 * @route   GET /api/authors/:id/books
 * @desc    Получение книг конкретного автора
 * @access  Public
 * @params  :id - ID автора
 * @query   ?page=1&limit=10
 */
router.get("/:id/books", validateAuthorId, authorsController.getAuthorBooks);

/**
 * @route   POST /api/authors
 * @desc    Создание нового автора
 * @access  Private (Admin only)
 * @body    {
 *            name, bio?, authorType, birthDate?, deathDate?,
 *            nationality?, website?, photoUrl?, isActive?
 *          }
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateCreateAuthor,
  authorsController.createAuthor
);

/**
 * @route   PUT /api/authors/:id
 * @desc    Обновление автора
 * @access  Private (Admin only)
 * @params  :id - ID автора
 * @body    { любые поля из создания (опционально) }
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUpdateAuthor,
  authorsController.updateAuthor
);

/**
 * @route   DELETE /api/authors/:id
 * @desc    Удаление автора
 * @access  Private (Admin only)
 * @params  :id - ID автора
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateAuthorId,
  authorsController.deleteAuthor
);

module.exports = router;
```

## 🔌 Шаг 4: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов авторов
const authorsRoutes = require("./src/routes/authors");
app.use("/api/authors", authorsRoutes);
```

## 📝 Примеры использования

### Получение списка авторов с фильтрацией

```bash
curl "http://localhost:3000/api/authors?page=1&limit=5&authorType=author&nationality=russian&search=толстой&sortBy=name&sortOrder=ASC"
```

### Получение конкретного автора

```bash
curl http://localhost:3000/api/authors/1
```

### Создание нового автора

```bash
curl -X POST http://localhost:3000/api/authors \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Лев Николаевич Толстой",
    "bio": "Великий русский писатель и мыслитель",
    "authorType": "author",
    "birthDate": "1828-09-09",
    "deathDate": "1910-11-20",
    "nationality": "Русский",
    "photoUrl": "https://example.com/tolstoy.jpg",
    "isActive": true
  }'
```

### Получение книг автора

```bash
curl "http://localhost:3000/api/authors/1/books?page=1&limit=10"
```

### Получение статистики авторов

```bash
curl http://localhost:3000/api/authors/stats
```

## 🔍 Особенности реализации

### 1. Работа с датами

```javascript
// Валидация дат с проверкой логики
body("deathDate")
  .optional()
  .isISO8601()
  .custom((value, { req }) => {
    const deathDate = new Date(value);
    if (req.body.birthDate) {
      const birthDate = new Date(req.body.birthDate);
      if (deathDate <= birthDate) {
        throw new Error("Дата смерти должна быть позже даты рождения");
      }
    }
    return true;
  });
```

### 2. Поиск с учетом регистра

```javascript
// Case-insensitive поиск
const whereConditions = {};
if (search) {
  whereConditions[Op.or] = [
    { name: { [Op.iLike]: `%${search}%` } },
    { bio: { [Op.iLike]: `%${search}%` } },
  ];
}
```

### 3. Проверка уникальности с исключением

```javascript
// При обновлении исключаем текущую запись
const existingAuthor = await Author.findOne({
  where: {
    name: { [Op.iLike]: updateData.name },
    id: { [Op.ne]: id }, // Исключаем текущего автора
  },
});
```

### 4. Статистика с группировкой

```javascript
// Группировка по типу автора
const authorTypeStats = await Author.findAll({
  attributes: [
    "authorType",
    [sequelize.fn("COUNT", sequelize.col("id")), "count"],
  ],
  group: ["authorType"],
  raw: true,
});
```

### 5. Many-to-Many отношения

```javascript
// Включение связанных книг через промежуточную таблицу
include: [
  {
    model: Book,
    as: "Books",
    through: { attributes: [] }, // Исключаем данные промежуточной таблицы
    attributes: ["id", "title", "isbn"],
  },
];
```

## 🔑 Ключевые принципы

1. **Валидация данных**: Тщательная проверка дат, типов и форматов
2. **Поиск и фильтрация**: Гибкая система поиска по имени и биографии
3. **Типизация авторов**: Поддержка разных ролей (автор, переводчик, редактор)
4. **Целостность данных**: Проверка связей перед удалением
5. **Производительность**: Оптимизированные запросы с пагинацией
6. **Статистика**: Аналитическая информация для администраторов

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полный CRUD API для авторов
- ✅ Гибкая система поиска и фильтрации
- ✅ Поддержка разных типов авторов
- ✅ Связи с книгами через many-to-many
- ✅ Валидация дат и логических связей
- ✅ Статистические данные для аналитики
- ✅ Защита от удаления связанных записей
