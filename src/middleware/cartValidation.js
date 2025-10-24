const { body, param } = require("express-validator");
const { validatePagination } = require("./commonValidation");

/**
 * Валидация ID позиции в корзине
 */
const validateCartItemId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID позиции корзины должен быть положительным числом"),
];

/**
 * Валидация добавления товара в корзину
 */
const validateAddToCart = [
  body("bookId")
    .notEmpty()
    .withMessage("ID книги обязателен")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),
  body("quantity")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Количество должно быть от 1 до 100")
    .toInt(),
];

/**
 * Валидация обновления количества товара
 */
const validateUpdateQuantity = [
  body("quantity")
    .notEmpty()
    .withMessage("Количество обязательно")
    .isInt({ min: 1, max: 100 })
    .withMessage("Количество должно быть от 1 до 100")
    .toInt(),
];

module.exports = {
  validateCartItemId,
  validateAddToCart,
  validateUpdateQuantity,
};
