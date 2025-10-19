const { body, param, query } = require("express-validator");
const { validatePaginationAndSearch } = require("./commonValidation");

/**
 * Middleware для валидации ID автора
 */
const validateAuthorId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID автора должен быть положительным числом"),
];

/**
 * Middleware для валидации создания автора
 */
const validateCreateAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Имя автора обязательно")
    .isLength({ min: 1, max: 100 })
    .withMessage("Имя автора должно быть от 1 до 100 символов")
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage("Имя автора содержит недопустимые символы"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Биография не должна превышать 2000 символов"),

  body("authorType")
    .optional()
    .isIn(["russian", "foreign"])
    .withMessage("Тип автора должен быть russian или foreign"),
];

/**
 * Middleware для валидации обновления автора
 */
const validateUpdateAuthor = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Имя автора не может быть пустым")
    .isLength({ min: 1, max: 100 })
    .withMessage("Имя автора должно быть от 1 до 100 символов")
    .matches(/^[a-zA-Zа-яА-ЯёЁ\s\-'\.]+$/)
    .withMessage("Имя автора содержит недопустимые символы"),

  body("bio")
    .optional({ nullable: true })
    .custom((value) => {
      if (value === null) return true;
      if (value && value.length > 2000) {
        throw new Error("Биография не должна превышать 2000 символов");
      }
      return true;
    }),

  body("authorType")
    .optional()
    .isIn(["russian", "foreign"])
    .withMessage("Тип автора должен быть russian или foreign"),
];

/**
 * Middleware для валидации параметров пагинации для авторов
 * Включает общую валидацию пагинации и поиска + специфичную для авторов
 */
const validateAuthorsPagination = [
  ...validatePaginationAndSearch,
  query("authorType")
    .optional()
    .isIn(["russian", "foreign"])
    .withMessage("Тип автора должен быть russian или foreign"),
];

module.exports = {
  validateAuthorId,
  validateCreateAuthor,
  validateUpdateAuthor,
  validateAuthorsPagination,
};
