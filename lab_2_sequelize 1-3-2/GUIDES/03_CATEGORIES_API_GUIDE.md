# 🏷️ Пошаговое создание API для категорий

## 📋 Обзор

API для категорий обеспечивает организацию книг по тематическим разделам. Функциональность включает:

- CRUD операции для управления категориями
- Получение книг определенной категории
- Валидацию уникальности slug'ов
- Иерархическую структуру категорий

## 🛠 Технологии

- **Sequelize** - ORM для работы с базой данных
- **express-validator** - валидация входящих данных
- **Slug generation** - создание SEO-friendly URL

## 📁 Структура файлов

```
src/
├── controllers/categoriesController.js    # Бизнес-логика категорий
├── routes/categories.js                   # Маршруты API
└── middleware/
    └── categoriesValidation.js            # Валидация данных категорий
```

## 🔧 Шаг 1: Middleware валидации (`src/middleware/categoriesValidation.js`)

```javascript
const { body, query, param } = require("express-validator");

/**
 * Создание slug из названия категории
 * @param {string} name - Название категории
 * @returns {string} - SEO-friendly slug
 */
const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Удаляем специальные символы
    .replace(/[\s_-]+/g, "-") // Заменяем пробелы и подчеркивания на дефисы
    .replace(/^-+|-+$/g, ""); // Удаляем дефисы в начале и конце
};

/**
 * Валидация создания новой категории
 */
const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Название категории обязательно")
    .isLength({ min: 2, max: 100 })
    .withMessage("Название должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я0-9\s\-_]+$/)
    .withMessage(
      "Название может содержать только буквы, цифры, пробелы, дефисы и подчеркивания"
    ),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug должен содержать от 2 до 100 символов")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Slug может содержать только строчные буквы, цифры и дефисы")
    .custom((value, { req }) => {
      // Если slug не предоставлен, создаем его из названия
      if (!value && req.body.name) {
        req.body.slug = createSlug(req.body.name);
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Описание не должно превышать 500 символов"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Порядок сортировки должен быть неотрицательным числом"),

  body("parentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID родительской категории должен быть положительным числом"),
];

/**
 * Валидация обновления категории
 */
const validateUpdateCategory = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),

  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Название категории не может быть пустым")
    .isLength({ min: 2, max: 100 })
    .withMessage("Название должно содержать от 2 до 100 символов")
    .matches(/^[a-zA-Zа-яА-Я0-9\s\-_]+$/)
    .withMessage(
      "Название может содержать только буквы, цифры, пробелы, дефисы и подчеркивания"
    ),

  body("slug")
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage("Slug должен содержать от 2 до 100 символов")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Slug может содержать только строчные буквы, цифры и дефисы")
    .custom((value, { req }) => {
      // Если обновляется название, но не slug, создаем новый slug
      if (!value && req.body.name) {
        req.body.slug = createSlug(req.body.name);
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Описание не должно превышать 500 символов"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive должно быть булевым значением"),

  body("sortOrder")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Порядок сортировки должен быть неотрицательным числом"),

  body("parentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID родительской категории должен быть положительным числом"),
];

/**
 * Валидация параметров получения категорий
 */
const validateGetCategories = [
  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive должно быть булевым значением"),

  query("parentId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID родительской категории должен быть положительным числом"),

  query("level")
    .optional()
    .isInt({ min: 0, max: 5 })
    .withMessage("Уровень вложенности должен быть от 0 до 5"),

  query("sortBy")
    .optional()
    .isIn(["name", "sortOrder", "createdAt"])
    .withMessage("Сортировка возможна по: name, sortOrder, createdAt"),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC"])
    .withMessage("Порядок сортировки: ASC или DESC"),
];

/**
 * Валидация ID категории в параметре
 */
const validateCategoryId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),
];

/**
 * Валидация slug категории в параметре
 */
const validateCategorySlug = [
  param("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug категории обязателен")
    .matches(/^[a-z0-9\-]+$/)
    .withMessage("Slug может содержать только строчные буквы, цифры и дефисы"),
];

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategories,
  validateCategoryId,
  validateCategorySlug,
  createSlug,
};
```

## 🎯 Шаг 2: Контроллер категорий (`src/controllers/categoriesController.js`)

```javascript
const { Category, Book } = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение списка всех категорий
 * GET /api/categories
 */
const getAllCategories = async (req, res) => {
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
      includeInactive = false,
      parentId,
      level,
      sortBy = "sortOrder",
      sortOrder = "ASC",
    } = req.query;

    // Построение условий фильтрации
    const whereConditions = {};

    // Фильтр по активности
    if (!includeInactive) {
      whereConditions.isActive = true;
    }

    // Фильтр по родительской категории
    if (parentId) {
      whereConditions.parentId = parentId;
    } else if (level !== undefined && parseInt(level) === 0) {
      whereConditions.parentId = null; // Только корневые категории
    }

    const categories = await Category.findAll({
      where: whereConditions,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: Category,
          as: "children",
          where: includeInactive ? {} : { isActive: true },
          required: false,
          attributes: ["id", "name", "slug", "description", "sortOrder"],
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    // Подсчет книг в каждой категории
    const categoriesWithBookCount = await Promise.all(
      categories.map(async (category) => {
        const bookCount = await Book.count({
          where: { categoryId: category.id },
        });

        return {
          ...category.toJSON(),
          bookCount,
        };
      })
    );

    res.json({
      success: true,
      data: {
        categories: categoriesWithBookCount,
        total: categories.length,
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения списка категорий",
    });
  }
};

/**
 * Получение конкретной категории по ID
 * GET /api/categories/:id
 */
const getCategoryById = async (req, res) => {
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

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "name", "slug", "description", "sortOrder"],
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Подсчет книг в категории
    const bookCount = await Book.count({
      where: { categoryId: id },
    });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toJSON(),
          bookCount,
        },
      },
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения категории",
    });
  }
};

/**
 * Получение категории по slug
 * GET /api/categories/slug/:slug
 */
const getCategoryBySlug = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { slug } = req.params;

    const category = await Category.findOne({
      where: { slug },
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "name", "slug", "description", "sortOrder"],
          where: { isActive: true },
          required: false,
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Подсчет книг в категории
    const bookCount = await Book.count({
      where: { categoryId: category.id },
    });

    res.json({
      success: true,
      data: {
        category: {
          ...category.toJSON(),
          bookCount,
        },
      },
    });
  } catch (error) {
    console.error("Get category by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения категории",
    });
  }
};

/**
 * Создание новой категории
 * POST /api/categories
 */
const createCategory = async (req, res) => {
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
      slug,
      description,
      isActive = true,
      sortOrder = 0,
      parentId,
    } = req.body;

    // Проверяем уникальность slug
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Категория с таким slug уже существует",
      });
    }

    // Если указана родительская категория, проверяем ее существование
    if (parentId) {
      const parentCategory = await Category.findByPk(parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Родительская категория не найдена",
        });
      }

      // Проверяем, что не создаем циклическую зависимость
      if (parentId === parseInt(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Категория не может быть родителем самой себе",
        });
      }
    }

    const category = await Category.create({
      name,
      slug,
      description,
      isActive,
      sortOrder,
      parentId,
    });

    // Получаем созданную категорию со связями
    const createdCategory = await Category.findByPk(category.id, {
      include: [
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Категория успешно создана",
      data: { category: createdCategory },
    });
  } catch (error) {
    console.error("Create category error:", error);

    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Категория с такими данными уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка создания категории",
    });
  }
};

/**
 * Обновление категории
 * PUT /api/categories/:id
 */
const updateCategory = async (req, res) => {
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

    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Проверяем уникальность slug при обновлении
    if (updateData.slug) {
      const existingCategory = await Category.findOne({
        where: {
          slug: updateData.slug,
          id: { [Op.ne]: id }, // Исключаем текущую категорию
        },
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Категория с таким slug уже существует",
        });
      }
    }

    // Проверяем родительскую категорию при обновлении
    if (updateData.parentId) {
      const parentCategory = await Category.findByPk(updateData.parentId);
      if (!parentCategory) {
        return res.status(400).json({
          success: false,
          message: "Родительская категория не найдена",
        });
      }

      // Проверяем циклические зависимости
      if (updateData.parentId === parseInt(id)) {
        return res.status(400).json({
          success: false,
          message: "Категория не может быть родителем самой себе",
        });
      }

      // Проверяем, что не создаем циклическую зависимость через дочерние элементы
      const checkCyclicDependency = async (parentId, targetId) => {
        const children = await Category.findAll({
          where: { parentId: targetId },
          attributes: ["id"],
        });

        for (const child of children) {
          if (child.id === parentId) {
            return true;
          }
          if (await checkCyclicDependency(parentId, child.id)) {
            return true;
          }
        }
        return false;
      };

      const hasCyclicDependency = await checkCyclicDependency(
        updateData.parentId,
        parseInt(id)
      );

      if (hasCyclicDependency) {
        return res.status(400).json({
          success: false,
          message: "Обновление создаст циклическую зависимость",
        });
      }
    }

    // Обновляем категорию
    await category.update(updateData);

    // Получаем обновленную категорию со связями
    const updatedCategory = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: "children",
          attributes: ["id", "name", "slug", "sortOrder"],
        },
        {
          model: Category,
          as: "parent",
          attributes: ["id", "name", "slug"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Категория успешно обновлена",
      data: { category: updatedCategory },
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления категории",
    });
  }
};

/**
 * Удаление категории
 * DELETE /api/categories/:id
 */
const deleteCategory = async (req, res) => {
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

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Проверяем наличие книг в категории
    const bookCount = await Book.count({ where: { categoryId: id } });
    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить категорию. В ней находится ${bookCount} книг(и)`,
      });
    }

    // Проверяем наличие дочерних категорий
    const childrenCount = await Category.count({ where: { parentId: id } });
    if (childrenCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить категорию. У неё есть ${childrenCount} дочерних категорий`,
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: "Категория успешно удалена",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    if (error.name === "SequelizeForeignKeyConstraintError") {
      return res.status(400).json({
        success: false,
        message:
          "Невозможно удалить категорию, так как она используется в других записях",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка удаления категории",
    });
  }
};

/**
 * Получение дерева категорий
 * GET /api/categories/tree
 */
const getCategoriesTree = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const whereConditions = {};
    if (!includeInactive) {
      whereConditions.isActive = true;
    }

    // Получаем все категории
    const allCategories = await Category.findAll({
      where: whereConditions,
      order: [
        ["sortOrder", "ASC"],
        ["name", "ASC"],
      ],
    });

    // Строим дерево категорий
    const buildTree = (categories, parentId = null) => {
      return categories
        .filter((category) => category.parentId === parentId)
        .map((category) => ({
          ...category.toJSON(),
          children: buildTree(categories, category.id),
        }));
    };

    const tree = buildTree(allCategories);

    res.json({
      success: true,
      data: { categoriesTree: tree },
    });
  } catch (error) {
    console.error("Get categories tree error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения дерева категорий",
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
  getCategoriesTree,
};
```

## 🛣 Шаг 3: Маршруты для категорий (`src/routes/categories.js`)

```javascript
const express = require("express");
const categoriesController = require("../controllers/categoriesController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateCreateCategory,
  validateUpdateCategory,
  validateGetCategories,
  validateCategoryId,
  validateCategorySlug,
} = require("../middleware/categoriesValidation");

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Получение списка всех категорий
 * @access  Public
 * @params  ?includeInactive=false&parentId=1&level=0
 *          &sortBy=sortOrder&sortOrder=ASC
 */
router.get("/", validateGetCategories, categoriesController.getAllCategories);

/**
 * @route   GET /api/categories/tree
 * @desc    Получение дерева категорий
 * @access  Public
 * @params  ?includeInactive=false
 */
router.get("/tree", categoriesController.getCategoriesTree);

/**
 * @route   GET /api/categories/slug/:slug
 * @desc    Получение категории по slug
 * @access  Public
 * @params  :slug - slug категории
 */
router.get(
  "/slug/:slug",
  validateCategorySlug,
  categoriesController.getCategoryBySlug
);

/**
 * @route   GET /api/categories/:id
 * @desc    Получение конкретной категории по ID
 * @access  Public
 * @params  :id - ID категории
 */
router.get("/:id", validateCategoryId, categoriesController.getCategoryById);

/**
 * @route   POST /api/categories
 * @desc    Создание новой категории
 * @access  Private (Admin only)
 * @body    {
 *            name, slug?, description?, isActive?,
 *            sortOrder?, parentId?
 *          }
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateCreateCategory,
  categoriesController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Обновление категории
 * @access  Private (Admin only)
 * @params  :id - ID категории
 * @body    { любые поля из создания (опционально) }
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateUpdateCategory,
  categoriesController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Удаление категории
 * @access  Private (Admin only)
 * @params  :id - ID категории
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validateCategoryId,
  categoriesController.deleteCategory
);

module.exports = router;
```

## 🔌 Шаг 4: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов категорий
const categoriesRoutes = require("./src/routes/categories");
app.use("/api/categories", categoriesRoutes);
```

## 📝 Примеры использования

### Получение всех категорий

```bash
curl "http://localhost:3000/api/categories?sortBy=name&sortOrder=ASC"
```

### Получение дерева категорий

```bash
curl http://localhost:3000/api/categories/tree
```

### Получение категории по slug

```bash
curl http://localhost:3000/api/categories/slug/programming
```

### Создание новой категории

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "Программирование",
    "slug": "programming",
    "description": "Книги по программированию и разработке",
    "isActive": true,
    "sortOrder": 10
  }'
```

### Создание подкатегории

```bash
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "name": "JavaScript",
    "slug": "javascript",
    "description": "Книги по JavaScript",
    "parentId": 1,
    "sortOrder": 1
  }'
```

### Обновление категории

```bash
curl -X PUT http://localhost:3000/api/categories/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -d '{
    "description": "Обновленное описание категории",
    "sortOrder": 5
  }'
```

## 🔍 Особенности реализации

### 1. Автоматическое создание slug

```javascript
// Функция создания SEO-friendly slug
const createSlug = (name) => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Удаляем специальные символы
    .replace(/[\s_-]+/g, "-") // Заменяем пробелы на дефисы
    .replace(/^-+|-+$/g, ""); // Удаляем дефисы в начале и конце
};
```

### 2. Иерархическая структура

```javascript
// Построение дерева категорий
const buildTree = (categories, parentId = null) => {
  return categories
    .filter((category) => category.parentId === parentId)
    .map((category) => ({
      ...category.toJSON(),
      children: buildTree(categories, category.id),
    }));
};
```

### 3. Проверка циклических зависимостей

```javascript
// Рекурсивная проверка циклических зависимостей
const checkCyclicDependency = async (parentId, targetId) => {
  const children = await Category.findAll({
    where: { parentId: targetId },
    attributes: ["id"],
  });

  for (const child of children) {
    if (child.id === parentId) return true;
    if (await checkCyclicDependency(parentId, child.id)) return true;
  }
  return false;
};
```

### 4. Подсчет книг в категории

```javascript
// Добавление количества книг к каждой категории
const bookCount = await Book.count({
  where: { categoryId: category.id },
});
```

## 🔑 Ключевые принципы

1. **SEO-оптимизация**: Автоматическое создание slug'ов для URL
2. **Иерархия**: Поддержка многоуровневых категорий
3. **Безопасность**: Проверка циклических зависимостей
4. **Целостность данных**: Проверка перед удалением
5. **Производительность**: Оптимизированные запросы с нужными полями
6. **Гибкость**: Возможность сортировки и фильтрации

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полный CRUD API для категорий
- ✅ Иерархическая структура категорий
- ✅ SEO-friendly URL с помощью slug'ов
- ✅ Дерево категорий для навигации
- ✅ Проверка целостности данных
- ✅ Административные права для управления
