const express = require("express");
const router = express.Router();

// Импорты контроллеров и middleware
const booksController = require("../controllers/booksController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const {
  validateQuery,
  validateParams,
  validateBody,
  booksQuerySchema,
  bookIdSchema,
  purchaseSchema,
} = require("../validators");

/**
 * @route GET /api/books/popular
 * @desc Получение популярных книг (должно быть перед /:id)
 * @access Public
 */
router.get(
  "/popular",
  validateQuery(
    require("joi").object({
      limit: require("joi").number().integer().min(1).max(50).default(10),
    })
  ),
  booksController.getPopularBooks
);

/**
 * @route GET /api/books/stats
 * @desc Получение статистики по книгам
 * @access Public
 */
router.get("/stats", booksController.getBooksStats);

/**
 * @route GET /api/books
 * @desc Получение списка книг с фильтрацией и пагинацией
 * @access Public (опциональная аутентификация для персонализации)
 */
router.get(
  "/",
  optionalAuth, // Опциональная аутентификация
  validateQuery(booksQuerySchema),
  booksController.getBooks
);

/**
 * @route GET /api/books/:id
 * @desc Получение детальной информации о книге
 * @access Public
 */
router.get("/:id", validateParams(bookIdSchema), booksController.getBookById);

/**
 * @route POST /api/books/:id/purchase
 * @desc Покупка книги
 * @access Private
 */
router.post(
  "/:id/purchase",
  authenticateToken, // Обязательная аутентификация для покупок
  validateParams(bookIdSchema),
  validateBody(purchaseSchema),
  booksController.purchaseBook
);

module.exports = router;
