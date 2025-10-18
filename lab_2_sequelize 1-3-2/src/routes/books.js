const express = require('express');
const { query } = require('express-validator');
const booksController = require('../controllers/booksController');

const router = express.Router();

/**
 * Валидация для запроса списка книг
 */
const getBooksValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным целым числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  
  query('category')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID категории должен быть положительным целым числом'),
  
  query('publisher')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID издательства должен быть положительным целым числом'),
  
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Минимальная цена должна быть положительным числом'),
  
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Максимальная цена должна быть положительным числом'),
  
  query('sortBy')
    .optional()
    .isIn(['popularity', 'price', 'title', 'publication_year', 'created_at'])
    .withMessage('Неверное поле для сортировки'),
  
  query('sortOrder')
    .optional()
    .isIn(['ASC', 'DESC'])
    .withMessage('Порядок сортировки должен быть ASC или DESC'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Поисковый запрос должен содержать от 1 до 255 символов')
];

/**
 * Валидация для топ книг
 */
const getPopularBooksValidation = [
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Лимит должен быть от 1 до 50')
];

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
 * - sortBy: поле для сортировки (popularity, price, title, publication_year, created_at)
 * - sortOrder: порядок сортировки (ASC, DESC)
 * - inStock: показывать только книги в наличии (по умолчанию true)
 */
router.get('/', getBooksValidation, booksController.getBooks);

/**
 * GET /api/books/popular - Топ популярных книг для главной страницы
 * 
 * Query параметры:
 * - limit: количество книг (по умолчанию 10, максимум 50)
 */
router.get('/popular', getPopularBooksValidation, booksController.getPopularBooks);

/**
 * GET /api/books/:id - Детальная информация о книге
 */
router.get('/:id', booksController.getBookById);

module.exports = router;