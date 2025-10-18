const express = require('express');
const { body } = require('express-validator');
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

/**
 * Валидация для создания категории
 */
const createCategoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Название категории должно содержать от 1 до 255 символов'),
  
  body('slug')
    .trim()
    .isLength({ min: 1, max: 255 })
    .matches(/^[a-z0-9-]+$/)
    .withMessage('Slug должен содержать только строчные буквы, цифры и дефисы'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Описание не должно превышать 1000 символов'),
  
  body('parent_id')
    .optional()
    .isInt({ min: 1 })
    .withMessage('ID родительской категории должно быть положительным числом'),
  
  body('sort_order')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Порядок сортировки должен быть неотрицательным числом')
];

/**
 * GET /api/categories - Получение всех категорий
 * Query параметры:
 * - includeInactive: boolean - включить неактивные категории
 */
router.get('/', categoriesController.getCategories);

/**
 * GET /api/categories/:id - Получение категории по ID с книгами
 * Query параметры:
 * - page: number - номер страницы для книг
 * - limit: number - количество книг на страницу
 */
router.get('/:id', categoriesController.getCategoryById);

/**
 * POST /api/categories - Создание категории (только админы)
 */
router.post('/', 
  authenticateToken, 
  requireAdmin, 
  createCategoryValidation, 
  categoriesController.createCategory
);

module.exports = router;