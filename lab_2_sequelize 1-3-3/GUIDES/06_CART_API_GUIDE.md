# 🛒 Пошаговое создание API для корзины

## 📋 Обзор

API для корзины обеспечивает функциональность интернет-магазина книг. Включает:

- Добавление книг в корзину
- Обновление количества товаров
- Удаление товаров из корзины
- Получение содержимого корзины
- Очистка корзины

## 🛠 Технологии

- **Sequelize** - ORM для работы с базой данных
- **express-validator** - валидация входящих данных
- **Транзакции** - для обеспечения целостности данных
- **Many-to-Many** отношения между пользователями и книгами

## 📁 Структура файлов

```
src/
├── controllers/cartController.js    # Бизнес-логика корзины
├── routes/cart.js                   # Маршруты API
└── middleware/
    └── cartValidation.js            # Валидация данных корзины
```

## 🔧 Шаг 1: Middleware валидации (`src/middleware/cartValidation.js`)

```javascript
const { body, query, param } = require("express-validator");

/**
 * Валидация добавления товара в корзину
 */
const validateAddToCart = [
  body("bookId")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),

  body("quantity")
    .isInt({ min: 1, max: 99 })
    .withMessage("Количество должно быть от 1 до 99"),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Примечания не должны превышать 500 символов"),
];

/**
 * Валидация обновления количества товара в корзине
 */
const validateUpdateCartItem = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),

  body("quantity")
    .isInt({ min: 0, max: 99 })
    .withMessage("Количество должно быть от 0 до 99")
    .custom((value) => {
      if (value === 0) {
        throw new Error(
          "Для удаления товара используйте соответствующий эндпоинт"
        );
      }
      return true;
    }),

  body("notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Примечания не должны превышать 500 символов"),
];

/**
 * Валидация ID книги для удаления из корзины
 */
const validateRemoveFromCart = [
  param("bookId")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),
];

/**
 * Валидация параметров получения корзины
 */
const validateGetCart = [
  query("includeInactive")
    .optional()
    .isBoolean()
    .withMessage("includeInactive должно быть булевым значением"),

  query("groupBy")
    .optional()
    .isIn(["book", "category", "author"])
    .withMessage("Группировка возможна по: book, category, author"),
];

/**
 * Валидация множественного добавления товаров
 */
const validateBulkAddToCart = [
  body("items")
    .isArray({ min: 1, max: 20 })
    .withMessage("Должен быть массив от 1 до 20 элементов"),

  body("items.*.bookId")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),

  body("items.*.quantity")
    .isInt({ min: 1, max: 99 })
    .withMessage("Количество должно быть от 1 до 99"),

  body("items.*.notes")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Примечания не должны превышать 500 символов"),
];

/**
 * Валидация применения промокода
 */
const validateApplyPromoCode = [
  body("promoCode")
    .trim()
    .notEmpty()
    .withMessage("Промокод обязателен")
    .isLength({ min: 3, max: 20 })
    .withMessage("Промокод должен содержать от 3 до 20 символов")
    .matches(/^[A-Z0-9\-_]+$/i)
    .withMessage(
      "Промокод может содержать только буквы, цифры, дефисы и подчеркивания"
    ),
];

module.exports = {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateGetCart,
  validateBulkAddToCart,
  validateApplyPromoCode,
};
```

## 🎯 Шаг 2: Контроллер корзины (`src/controllers/cartController.js`)

```javascript
const {
  CartItem,
  Book,
  User,
  Category,
  Author,
  Publisher,
} = require("../../models");
const { validationResult } = require("express-validator");
const { Op, sequelize } = require("sequelize");

/**
 * Получение содержимого корзины пользователя
 * GET /api/cart
 */
const getCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { includeInactive = false } = req.query;

    // Условия для книг
    const bookWhere = {};
    if (!includeInactive) {
      bookWhere.stock = { [Op.gt]: 0 }; // Только книги в наличии
    }

    const cartItems = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: "Book",
          where: bookWhere,
          required: true,
          include: [
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
            {
              model: Author,
              as: "Authors",
              through: { attributes: [] },
              attributes: ["id", "name", "authorType"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Вычисляем общую стоимость и количество
    let totalAmount = 0;
    let totalQuantity = 0;
    let totalItems = cartItems.length;

    const itemsWithCalculations = cartItems.map((item) => {
      const itemTotal = item.quantity * item.Book.price;
      totalAmount += itemTotal;
      totalQuantity += item.quantity;

      return {
        ...item.toJSON(),
        itemTotal,
        isAvailable: item.Book.stock >= item.quantity,
        maxAvailable: item.Book.stock,
      };
    });

    // Проверяем наличие недоступных товаров
    const unavailableItems = itemsWithCalculations.filter(
      (item) => !item.isAvailable
    );

    res.json({
      success: true,
      data: {
        cartItems: itemsWithCalculations,
        summary: {
          totalItems,
          totalQuantity,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          currency: "RUB",
          hasUnavailableItems: unavailableItems.length > 0,
          unavailableItemsCount: unavailableItems.length,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения корзины",
    });
  }
};

/**
 * Добавление книги в корзину
 * POST /api/cart/items
 */
const addToCart = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookId, quantity, notes } = req.body;

    // Проверяем существование книги и её наличие
    const book = await Book.findByPk(bookId, { transaction });
    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    if (book.stock === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Книга отсутствует на складе",
      });
    }

    // Проверяем, есть ли уже эта книга в корзине
    const existingCartItem = await CartItem.findOne({
      where: { userId, bookId },
      transaction,
    });

    if (existingCartItem) {
      // Обновляем количество
      const newQuantity = existingCartItem.quantity + quantity;

      if (newQuantity > book.stock) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Недостаточно товара на складе. Доступно: ${book.stock}, в корзине: ${existingCartItem.quantity}`,
        });
      }

      await existingCartItem.update(
        {
          quantity: newQuantity,
          notes: notes || existingCartItem.notes,
        },
        { transaction }
      );

      await transaction.commit();

      // Получаем обновленный элемент корзины
      const updatedCartItem = await CartItem.findByPk(existingCartItem.id, {
        include: [
          {
            model: Book,
            as: "Book",
            attributes: ["id", "title", "price", "stock", "coverImage"],
          },
        ],
      });

      return res.json({
        success: true,
        message: "Количество товара в корзине обновлено",
        data: { cartItem: updatedCartItem },
      });
    }

    // Проверяем доступность нужного количества
    if (quantity > book.stock) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Доступно: ${book.stock}`,
      });
    }

    // Создаем новый элемент корзины
    const cartItem = await CartItem.create(
      {
        userId,
        bookId,
        quantity,
        notes,
      },
      { transaction }
    );

    await transaction.commit();

    // Получаем созданный элемент корзины со связанными данными
    const createdCartItem = await CartItem.findByPk(cartItem.id, {
      include: [
        {
          model: Book,
          as: "Book",
          attributes: ["id", "title", "price", "stock", "coverImage"],
          include: [
            {
              model: Category,
              as: "Category",
              attributes: ["id", "name", "slug"],
            },
          ],
        },
      ],
    });

    res.status(201).json({
      success: true,
      message: "Товар добавлен в корзину",
      data: { cartItem: createdCartItem },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка добавления товара в корзину",
    });
  }
};

/**
 * Обновление количества товара в корзине
 * PUT /api/cart/items/:bookId
 */
const updateCartItem = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookId } = req.params;
    const { quantity, notes } = req.body;

    // Находим элемент корзины
    const cartItem = await CartItem.findOne({
      where: { userId, bookId },
      include: [
        {
          model: Book,
          as: "Book",
          attributes: ["id", "title", "price", "stock"],
        },
      ],
      transaction,
    });

    if (!cartItem) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Товар не найден в корзине",
      });
    }

    // Проверяем доступность нужного количества
    if (quantity > cartItem.Book.stock) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Доступно: ${cartItem.Book.stock}`,
      });
    }

    // Обновляем элемент корзины
    await cartItem.update(
      {
        quantity,
        notes: notes !== undefined ? notes : cartItem.notes,
      },
      { transaction }
    );

    await transaction.commit();

    // Получаем обновленный элемент
    const updatedCartItem = await CartItem.findByPk(cartItem.id, {
      include: [
        {
          model: Book,
          as: "Book",
          attributes: ["id", "title", "price", "stock", "coverImage"],
        },
      ],
    });

    res.json({
      success: true,
      message: "Количество товара обновлено",
      data: { cartItem: updatedCartItem },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления товара в корзине",
    });
  }
};

/**
 * Удаление товара из корзины
 * DELETE /api/cart/items/:bookId
 */
const removeFromCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { bookId } = req.params;

    const cartItem = await CartItem.findOne({
      where: { userId, bookId },
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Товар не найден в корзине",
      });
    }

    await cartItem.destroy();

    res.json({
      success: true,
      message: "Товар удален из корзины",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления товара из корзины",
    });
  }
};

/**
 * Очистка всей корзины
 * DELETE /api/cart
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const deletedCount = await CartItem.destroy({
      where: { userId },
    });

    res.json({
      success: true,
      message: "Корзина очищена",
      data: { deletedItems: deletedCount },
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка очистки корзины",
    });
  }
};

/**
 * Множественное добавление товаров в корзину
 * POST /api/cart/bulk
 */
const bulkAddToCart = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const userId = req.user.id;
    const { items } = req.body;

    // Проверяем все книги перед добавлением
    const bookIds = items.map((item) => item.bookId);
    const books = await Book.findAll({
      where: { id: { [Op.in]: bookIds } },
      transaction,
    });

    if (books.length !== bookIds.length) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: "Одна или несколько книг не найдены",
      });
    }

    // Создаем карту книг для быстрого доступа
    const booksMap = new Map(books.map((book) => [book.id, book]));

    // Получаем существующие элементы корзины
    const existingCartItems = await CartItem.findAll({
      where: {
        userId,
        bookId: { [Op.in]: bookIds },
      },
      transaction,
    });

    const existingCartMap = new Map(
      existingCartItems.map((item) => [item.bookId, item])
    );

    const results = [];
    const errors_list = [];

    for (const item of items) {
      const book = booksMap.get(item.bookId);
      const existingCartItem = existingCartMap.get(item.bookId);

      // Проверяем доступность
      const requiredQuantity = existingCartItem
        ? existingCartItem.quantity + item.quantity
        : item.quantity;

      if (requiredQuantity > book.stock) {
        errors_list.push({
          bookId: item.bookId,
          bookTitle: book.title,
          error: `Недостаточно на складе. Доступно: ${book.stock}, требуется: ${requiredQuantity}`,
        });
        continue;
      }

      try {
        if (existingCartItem) {
          // Обновляем существующий элемент
          await existingCartItem.update(
            {
              quantity: requiredQuantity,
              notes: item.notes || existingCartItem.notes,
            },
            { transaction }
          );

          results.push({
            bookId: item.bookId,
            action: "updated",
            newQuantity: requiredQuantity,
          });
        } else {
          // Создаем новый элемент
          await CartItem.create(
            {
              userId,
              bookId: item.bookId,
              quantity: item.quantity,
              notes: item.notes,
            },
            { transaction }
          );

          results.push({
            bookId: item.bookId,
            action: "added",
            quantity: item.quantity,
          });
        }
      } catch (itemError) {
        errors_list.push({
          bookId: item.bookId,
          error: itemError.message,
        });
      }
    }

    await transaction.commit();

    res.json({
      success: errors_list.length === 0,
      message:
        errors_list.length === 0
          ? "Все товары успешно добавлены/обновлены"
          : "Некоторые товары не удалось добавить",
      data: {
        successful: results,
        failed: errors_list,
        successCount: results.length,
        failCount: errors_list.length,
      },
    });
  } catch (error) {
    await transaction.rollback();
    console.error("Bulk add to cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка массового добавления товаров",
    });
  }
};

/**
 * Получение статистики корзины
 * GET /api/cart/stats
 */
const getCartStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Общая статистика корзины
    const totalItems = await CartItem.count({ where: { userId } });

    const cartSummary = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: "Book",
          attributes: ["price", "stock"],
        },
      ],
      attributes: ["quantity"],
    });

    let totalQuantity = 0;
    let totalAmount = 0;
    let availableItems = 0;

    cartSummary.forEach((item) => {
      totalQuantity += item.quantity;
      totalAmount += item.quantity * item.Book.price;
      if (item.Book.stock >= item.quantity) {
        availableItems++;
      }
    });

    // Статистика по категориям
    const categoryStats = await CartItem.findAll({
      where: { userId },
      include: [
        {
          model: Book,
          as: "Book",
          include: [
            {
              model: Category,
              as: "Category",
              attributes: ["id", "name"],
            },
          ],
          attributes: ["price"],
        },
      ],
      attributes: ["quantity"],
    });

    const categoryMap = new Map();
    categoryStats.forEach((item) => {
      const categoryName = item.Book.Category?.name || "Без категории";
      const existing = categoryMap.get(categoryName) || { count: 0, amount: 0 };
      existing.count += item.quantity;
      existing.amount += item.quantity * item.Book.price;
      categoryMap.set(categoryName, existing);
    });

    const categoriesBreakdown = Array.from(categoryMap.entries()).map(
      ([name, data]) => ({
        category: name,
        itemCount: data.count,
        totalAmount: parseFloat(data.amount.toFixed(2)),
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalItems,
          totalQuantity,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          availableItems,
          unavailableItems: totalItems - availableItems,
          currency: "RUB",
        },
        categoriesBreakdown,
      },
    });
  } catch (error) {
    console.error("Get cart stats error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения статистики корзины",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  bulkAddToCart,
  getCartStats,
};
```

## 🛣 Шаг 3: Маршруты для корзины (`src/routes/cart.js`)

```javascript
const express = require("express");
const cartController = require("../controllers/cartController");
const { authenticateToken } = require("../middleware/auth");
const {
  validateAddToCart,
  validateUpdateCartItem,
  validateRemoveFromCart,
  validateGetCart,
  validateBulkAddToCart,
} = require("../middleware/cartValidation");

const router = express.Router();

// Все маршруты корзины требуют аутентификации
router.use(authenticateToken);

/**
 * @route   GET /api/cart/stats
 * @desc    Получение статистики корзины
 * @access  Private
 */
router.get("/stats", cartController.getCartStats);

/**
 * @route   GET /api/cart
 * @desc    Получение содержимого корзины
 * @access  Private
 * @params  ?includeInactive=false
 */
router.get("/", validateGetCart, cartController.getCart);

/**
 * @route   POST /api/cart/items
 * @desc    Добавление книги в корзину
 * @access  Private
 * @body    { bookId, quantity, notes? }
 */
router.post("/items", validateAddToCart, cartController.addToCart);

/**
 * @route   POST /api/cart/bulk
 * @desc    Множественное добавление товаров в корзину
 * @access  Private
 * @body    {
 *            items: [
 *              { bookId, quantity, notes? }
 *            ]
 *          }
 */
router.post("/bulk", validateBulkAddToCart, cartController.bulkAddToCart);

/**
 * @route   PUT /api/cart/items/:bookId
 * @desc    Обновление количества товара в корзине
 * @access  Private
 * @params  :bookId - ID книги
 * @body    { quantity, notes? }
 */
router.put(
  "/items/:bookId",
  validateUpdateCartItem,
  cartController.updateCartItem
);

/**
 * @route   DELETE /api/cart/items/:bookId
 * @desc    Удаление товара из корзины
 * @access  Private
 * @params  :bookId - ID книги
 */
router.delete(
  "/items/:bookId",
  validateRemoveFromCart,
  cartController.removeFromCart
);

/**
 * @route   DELETE /api/cart
 * @desc    Очистка всей корзины
 * @access  Private
 */
router.delete("/", cartController.clearCart);

module.exports = router;
```

## 🔌 Шаг 4: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов корзины
const cartRoutes = require("./src/routes/cart");
app.use("/api/cart", cartRoutes);
```

## 📝 Примеры использования

### Получение содержимого корзины

```bash
curl -X GET http://localhost:3000/api/cart \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Добавление книги в корзину

```bash
curl -X POST http://localhost:3000/api/cart/items \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "bookId": 1,
    "quantity": 2,
    "notes": "Подарок для друга"
  }'
```

### Обновление количества товара

```bash
curl -X PUT http://localhost:3000/api/cart/items/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "quantity": 3
  }'
```

### Множественное добавление товаров

```bash
curl -X POST http://localhost:3000/api/cart/bulk \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer USER_JWT_TOKEN" \
  -d '{
    "items": [
      { "bookId": 1, "quantity": 2 },
      { "bookId": 3, "quantity": 1, "notes": "Срочно нужна" },
      { "bookId": 5, "quantity": 1 }
    ]
  }'
```

### Удаление товара из корзины

```bash
curl -X DELETE http://localhost:3000/api/cart/items/1 \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Очистка корзины

```bash
curl -X DELETE http://localhost:3000/api/cart \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

### Получение статистики корзины

```bash
curl -X GET http://localhost:3000/api/cart/stats \
  -H "Authorization: Bearer USER_JWT_TOKEN"
```

## 🔍 Особенности реализации

### 1. Использование транзакций

```javascript
// Обеспечение целостности данных при изменении корзины
const transaction = await sequelize.transaction();
try {
  // Операции с базой данных
  await cartItem.update(updateData, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### 2. Проверка наличия товара

```javascript
// Валидация доступности товара
if (quantity > book.stock) {
  return res.status(400).json({
    success: false,
    message: `Недостаточно товара на складе. Доступно: ${book.stock}`,
  });
}
```

### 3. Обработка существующих элементов

```javascript
// Обновление количества или создание нового элемента
const existingCartItem = await CartItem.findOne({
  where: { userId, bookId },
});

if (existingCartItem) {
  // Обновляем количество
  const newQuantity = existingCartItem.quantity + quantity;
  await existingCartItem.update({ quantity: newQuantity });
} else {
  // Создаем новый элемент
  await CartItem.create({ userId, bookId, quantity });
}
```

### 4. Вычисление итогов

```javascript
// Подсчет общей стоимости и количества
let totalAmount = 0;
let totalQuantity = 0;

const itemsWithCalculations = cartItems.map((item) => {
  const itemTotal = item.quantity * item.Book.price;
  totalAmount += itemTotal;
  totalQuantity += item.quantity;
  return { ...item.toJSON(), itemTotal };
});
```

### 5. Массовые операции

```javascript
// Эффективная обработка множественного добавления
const results = [];
const errors = [];

for (const item of items) {
  try {
    // Обработка каждого элемента
    await processCartItem(item);
    results.push({ bookId: item.bookId, status: "success" });
  } catch (error) {
    errors.push({ bookId: item.bookId, error: error.message });
  }
}
```

## 🔑 Ключевые принципы

1. **Целостность данных**: Использование транзакций для критических операций
2. **Проверка наличия**: Валидация stock'а перед добавлением в корзину
3. **Пользовательский опыт**: Подробная информация о доступности товаров
4. **Производительность**: Оптимизированные запросы с JOIN'ами
5. **Безопасность**: Привязка корзины к аутентифицированному пользователю
6. **Гибкость**: Поддержка множественных операций и заметок

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полнофункциональная система корзины
- ✅ Проверка наличия товаров на складе
- ✅ Транзакционная безопасность операций
- ✅ Множественное добавление товаров
- ✅ Подробная статистика корзины
- ✅ Вычисление итоговых сумм
- ✅ Поддержка заметок к товарам
- ✅ Защита от одновременного доступа
