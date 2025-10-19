const express = require("express");
const booksController = require("../controllers/booksController");
const {
  validateBookId,
  validateBooksQuery,
  validatePopularBooksQuery,
} = require("../middleware/booksValidation");

const router = express.Router();

/**
 * GET /api/books - Получение списка книг с пагинацией и фильтрами
 *
 * Query параметры:
 * - page: номер страницы (по умолчанию 1)
 * - limit: количество книг на странице (по умолчанию 10, максимум 100)
 * - category: ID категории для фильтрации
 * - publisher: ID издательства для фильтрации
 * - search: поиск по названию книги
 * - minPrice, maxPrice: ценовой диапазон
 * - sortBy: поле для сортировки (popularity, price, title, createdAt)
 * - sortOrder: порядок сортировки (ASC, DESC)
 * - inStock: показывать только книги в наличии (по умолчанию true)
 */
router.get("/", validateBooksQuery, booksController.getBooks);

/**
 * GET /api/books/popular - Топ популярных книг для главной страницы
 *
 * Query параметры:
 * - limit: количество книг (по умолчанию 10, максимум 50)
 */
router.get(
  "/popular",
  validatePopularBooksQuery,
  booksController.getPopularBooks
);

/**
 * GET /api/books/stats - Статистика магазина
 * Возвращает общую информацию о книгах, жанрах и продажах
 */
router.get("/stats", booksController.getStats);

/**
 * GET /api/books/:id - Детальная информация о книге
 */
router.get("/:id", validateBookId, booksController.getBookById);

module.exports = router;
