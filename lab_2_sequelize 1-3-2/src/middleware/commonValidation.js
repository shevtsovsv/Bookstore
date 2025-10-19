const { query } = require("express-validator");

/**
 * Общий middleware для валидации параметров пагинации
 */
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Номер страницы должен быть положительным числом"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть от 1 до 100"),
];

/**
 * Middleware для валидации поискового запроса
 */
const validateSearch = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Поисковый запрос не должен превышать 100 символов"),
];

/**
 * Комбинированный middleware для пагинации и поиска
 */
const validatePaginationAndSearch = [...validatePagination, ...validateSearch];

module.exports = {
  validatePagination,
  validateSearch,
  validatePaginationAndSearch,
};
