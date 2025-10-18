const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const publishersController = require('../controllers/publishersController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

/**
 * Middleware для валидации ID издателя
 */
const validatePublisherId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID издателя должен быть положительным числом')
];

/**
 * Middleware для валидации создания издателя
 */
const validateCreatePublisher = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Название издательства обязательно')
    .isLength({ min: 2, max: 100 })
    .withMessage('Название должно быть от 2 до 100 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Адрес не должен превышать 500 символов'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Неверный формат телефона')
    .isLength({ max: 20 })
    .withMessage('Телефон не должен превышать 20 символов'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Неверный формат email')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Неверный формат веб-сайта')
];

/**
 * Middleware для валидации обновления издателя
 */
const validateUpdatePublisher = [
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Название не может быть пустым')
    .isLength({ min: 2, max: 100 })
    .withMessage('Название должно быть от 2 до 100 символов'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов'),
  
  body('address')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Адрес не должен превышать 500 символов'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^[\d\s\-\+\(\)]+$/)
    .withMessage('Неверный формат телефона')
    .isLength({ max: 20 })
    .withMessage('Телефон не должен превышать 20 символов'),
  
  body('email')
    .optional()
    .trim()
    .isEmail()
    .withMessage('Неверный формат email')
    .normalizeEmail(),
  
  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Неверный формат веб-сайта')
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
 * @route   GET /api/publishers
 * @desc    Получение списка издателей с пагинацией и поиском
 * @access  Public
 * @query   page, limit, search
 */
router.get('/', validatePagination, publishersController.getPublishers);

/**
 * @route   GET /api/publishers/:id
 * @desc    Получение издателя по ID
 * @access  Public
 * @params  id - ID издателя
 */
router.get('/:id', validatePublisherId, publishersController.getPublisherById);

/**
 * @route   GET /api/publishers/:id/books
 * @desc    Получение книг издателя с пагинацией
 * @access  Public
 * @params  id - ID издателя
 * @query   page, limit
 */
router.get('/:id/books', [...validatePublisherId, ...validatePagination], publishersController.getPublisherBooks);

/**
 * @route   POST /api/publishers
 * @desc    Создание нового издателя
 * @access  Private (Admin only)
 * @body    { name, description?, address?, phone?, email?, website? }
 */
router.post('/', [authenticateToken, requireAdmin, ...validateCreatePublisher], publishersController.createPublisher);

/**
 * @route   PUT /api/publishers/:id
 * @desc    Обновление издателя
 * @access  Private (Admin only)
 * @params  id - ID издателя
 * @body    { name?, description?, address?, phone?, email?, website? }
 */
router.put('/:id', [authenticateToken, requireAdmin, ...validatePublisherId, ...validateUpdatePublisher], publishersController.updatePublisher);

/**
 * @route   DELETE /api/publishers/:id
 * @desc    Удаление издателя
 * @access  Private (Admin only)
 * @params  id - ID издателя
 */
router.delete('/:id', [authenticateToken, requireAdmin, ...validatePublisherId], publishersController.deletePublisher);

module.exports = router;