const { body, param } = require("express-validator");
const { validatePaginationAndSearch } = require("./commonValidation");

/**
 * Middleware для валидации ID категории
 */
const validateCategoryId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID категории должен быть положительным числом"),
];

/**
 * Middleware для валидации создания категории
 */
const validateCreateCategory = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Название категории обязательно")
    .isLength({ min: 1, max: 100 })
    .withMessage("Название категории должно быть от 1 до 100 символов"),

  body("slug")
    .trim()
    .notEmpty()
    .withMessage("Slug обязателен")
    .isLength({ min: 1, max: 100 })
    .withMessage("Slug должен быть от 1 до 100 символов")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug должен содержать только строчные буквы, цифры и дефисы"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Описание не должно превышать 2000 символов"),
];

/**
 * Middleware для валидации обновления категории
 */
const validateUpdateCategory = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Название категории не может быть пустым")
    .isLength({ min: 1, max: 100 })
    .withMessage("Название категории должно быть от 1 до 100 символов"),

  body("slug")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Slug не может быть пустым")
    .isLength({ min: 1, max: 100 })
    .withMessage("Slug должен быть от 1 до 100 символов")
    .matches(/^[a-z0-9-]+$/)
    .withMessage("Slug должен содержать только строчные буквы, цифры и дефисы"),

  body("description")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && value.length > 2000) {
        throw new Error("Описание не должно превышать 2000 символов");
      }
      return true;
    }),
];

/**
 * Middleware для валидации параметров пагинации для категорий
 * Использует общую валидацию пагинации и поиска
 */
const validateCategoriesPagination = validatePaginationAndSearch;

module.exports = {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoriesPagination,
};
