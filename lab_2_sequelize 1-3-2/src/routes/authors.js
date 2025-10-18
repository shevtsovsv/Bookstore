const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const authorsController = require('../controllers/authorsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Middleware для валидации ID автора
 */
const validateAuthorId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID автора должен быть положительным числом')
];

/**
 * Middleware для валидации создания автора
 */
const validateCreateAuthor = [
  body('firstName')
    .trim()
    .notEmpty()
    .withMessage('Имя обязательно')
    .isLength({ min: 1, max: 50 })
    .withMessage('Имя должно быть от 1 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage('Имя содержит недопустимые символы'),
  
  body('lastName')
    .trim()
    .notEmpty()
    .withMessage('Фамилия обязательна')
    .isLength({ min: 1, max: 50 })
    .withMessage('Фамилия должна быть от 1 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage('Фамилия содержит недопустимые символы'),
  
  body('birthDate')
    .optional()
    .isISO8601()
    .withMessage('Неверный формат даты рождения (используйте YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Дата рождения не может быть в будущем');
      }
      return true;
    }),
  
  body('deathDate')
    .optional()
    .isISO8601()
    .withMessage('Неверный формат даты смерти (используйте YYYY-MM-DD)')
    .custom((value) => {
      if (value && new Date(value) > new Date()) {
        throw new Error('Дата смерти не может быть в будущем');
      }
      return true;
    }),
  
  body('nationality')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Национальность не должна превышать 100 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/)
    .withMessage('Национальность содержит недопустимые символы'),
  
  body('biography')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Биография не должна превышать 2000 символов')
];

/**
 * Middleware для валидации обновления автора
 */
const validateUpdateAuthor = [
  body('firstName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Имя не может быть пустым')
    .isLength({ min: 1, max: 50 })
    .withMessage('Имя должно быть от 1 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage('Имя содержит недопустимые символы'),
  
  body('lastName')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Фамилия не может быть пустой')
    .isLength({ min: 1, max: 50 })
    .withMessage('Фамилия должна быть от 1 до 50 символов')
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage('Фамилия содержит недопустимые символы'),
  
  body('birthDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true; // Разрешаем null для удаления даты
      if (value && !Date.parse(value)) {
        throw new Error('Неверный формат даты рождения');
      }
      if (value && new Date(value) > new Date()) {
        throw new Error('Дата рождения не может быть в будущем');
      }
      return true;
    }),
  
  body('deathDate')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true; // Разрешаем null для удаления даты
      if (value && !Date.parse(value)) {
        throw new Error('Неверный формат даты смерти');
      }
      if (value && new Date(value) > new Date()) {
        throw new Error('Дата смерти не может быть в будущем');
      }
      return true;
    }),
  
  body('nationality')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && (typeof value !== 'string' || value.trim().length === 0)) {
        throw new Error('Национальность должна быть строкой');
      }
      if (value && value.length > 100) {
        throw new Error('Национальность не должна превышать 100 символов');
      }
      if (value && !/^[a-zA-Zа-яА-ЯёЁ\s\-]+$/.test(value)) {
        throw new Error('Национальность содержит недопустимые символы');
      }
      return true;
    }),
  
  body('biography')
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && value.length > 2000) {
        throw new Error('Биография не должна превышать 2000 символов');
      }
      return true;
    })
];

/**
 * Middleware для валидации параметров пагинации
 */
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Номер страницы должен быть положительным числом'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Лимит должен быть от 1 до 100'),
  
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Поисковый запрос не должен превышать 100 символов')
];

/**
 * @route   GET /api/authors
 * @desc    Получение списка авторов с пагинацией и поиском
 * @access  Public
 * @query   page, limit, search
 */
router.get('/', validatePagination, authorsController.getAuthors);

/**
 * @route   GET /api/authors/:id
 * @desc    Получение автора по ID
 * @access  Public
 * @params  id - ID автора
 */
router.get('/:id', validateAuthorId, authorsController.getAuthorById);

/**
 * @route   GET /api/authors/:id/books
 * @desc    Получение книг автора с пагинацией
 * @access  Public
 * @params  id - ID автора
 * @query   page, limit
 */
router.get('/:id/books', [...validateAuthorId, ...validatePagination], authorsController.getAuthorBooks);

/**
 * @route   POST /api/authors
 * @desc    Создание нового автора
 * @access  Private (Admin only)
 * @body    { firstName, lastName, birthDate?, deathDate?, nationality?, biography? }
 */
router.post('/', [authenticateToken, requireAdmin, ...validateCreateAuthor], authorsController.createAuthor);

/**
 * @route   PUT /api/authors/:id
 * @desc    Обновление автора
 * @access  Private (Admin only)
 * @params  id - ID автора
 * @body    { firstName?, lastName?, birthDate?, deathDate?, nationality?, biography? }
 */
router.put('/:id', [authenticateToken, requireAdmin, ...validateAuthorId, ...validateUpdateAuthor], authorsController.updateAuthor);

/**
 * @route   DELETE /api/authors/:id
 * @desc    Удаление автора
 * @access  Private (Admin only)
 * @params  id - ID автора
 */
router.delete('/:id', [authenticateToken, requireAdmin, ...validateAuthorId], authorsController.deleteAuthor);

module.exports = router;