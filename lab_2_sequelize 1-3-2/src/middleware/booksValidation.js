const { query, param } = require("express-validator");
const { validatePagination, validateSearch } = require("./commonValidation");

/**
 * Валидация ID книги
 */
const validateBookId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID книги должен быть положительным числом"),
];

/**
 * Валидация параметров для получения списка книг
 */
const validateBooksQuery = [
  ...validatePagination,
  ...validateSearch,

  query("category")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),

  query("publisher")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID издательства должен быть положительным числом"),

  query("minPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Минимальная цена должна быть неотрицательным числом")
    .toFloat(),

  query("maxPrice")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Максимальная цена должна быть неотрицательным числом")
    .toFloat(),

  query("sortBy")
    .optional()
    .isIn(["popularity", "price", "title", "createdAt"])
    .withMessage(
      "Поле сортировки должно быть одним из: popularity, price, title, createdAt"
    ),

  query("sortOrder")
    .optional()
    .isIn(["ASC", "DESC", "asc", "desc"])
    .withMessage("Порядок сортировки должен быть ASC или DESC"),

  query("inStock")
    .optional()
    .isBoolean()
    .withMessage("Параметр inStock должен быть boolean")
    .toBoolean(),
];

/**
 * Валидация параметров для популярных книг
 */
const validatePopularBooksQuery = [
  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Лимит должен быть от 1 до 50")
    .toInt(),
];

module.exports = {
  validateBookId,
  validateBooksQuery,
  validatePopularBooksQuery,
};
