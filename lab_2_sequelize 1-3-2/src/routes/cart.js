const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const cartController = require('../controllers/cartController');
const { authenticateToken } = require('../middleware/auth');

/**
 * Middleware для валидации ID корзины
 */
const validateCartItemId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID позиции корзины должен быть положительным числом')
];

/**
 * Middleware для валидации добавления в корзину
 */
const validateAddToCart = [
  body('bookId')
    .notEmpty()
    .withMessage('ID книги обязателен')
    .isInt({ min: 1 })
    .withMessage('ID книги должен быть положительным числом'),
  body('quantity')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество должно быть от 1 до 100')
];

/**
 * Middleware для валидации обновления количества
 */
const validateUpdateQuantity = [
  body('quantity')
    .notEmpty()
    .withMessage('Количество обязательно')
    .isInt({ min: 1, max: 100 })
    .withMessage('Количество должно быть от 1 до 100')
];

// Все маршруты корзины требуют аутентификации
router.use(authenticateToken);

/**
 * @route   GET /api/cart
 * @desc    Получение корзины текущего пользователя
 * @access  Private
 */
router.get('/', cartController.getCart);

/**
 * @route   POST /api/cart
 * @desc    Добавление книги в корзину
 * @access  Private
 * @body    { bookId: number, quantity?: number }
 */
router.post('/', validateAddToCart, cartController.addToCart);

/**
 * @route   PUT /api/cart/:id
 * @desc    Обновление количества товара в корзине
 * @access  Private
 * @params  id - ID позиции в корзине
 * @body    { quantity: number }
 */
router.put('/:id', [...validateCartItemId, ...validateUpdateQuantity], cartController.updateCartItem);

/**
 * @route   DELETE /api/cart/:id
 * @desc    Удаление товара из корзины
 * @access  Private
 * @params  id - ID позиции в корзине
 */
router.delete('/:id', validateCartItemId, cartController.removeFromCart);

/**
 * @route   DELETE /api/cart
 * @desc    Очистка корзины
 * @access  Private
 */
router.delete('/', cartController.clearCart);

module.exports = router;