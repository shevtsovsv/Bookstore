const { body, param, query } = require("express-validator");
const { validatePagination, validateSearch } = require("./commonValidation");

/**
 * Валидация ID издателя
 */
const validatePublisherId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID издателя должен быть положительным числом"),
];

/**
 * Валидация создания издателя
 */
const validateCreatePublisher = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Название издательства обязательно")
    .isLength({ min: 2, max: 255 })
    .withMessage("Название должно быть от 2 до 255 символов"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Описание не должно превышать 2000 символов"),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Неверный формат веб-сайта")
    .isLength({ max: 500 })
    .withMessage("URL сайта не должен превышать 500 символов"),

  body("contact_email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Неверный формат email")
    .isLength({ max: 255 })
    .withMessage("Email не должен превышать 255 символов")
    .normalizeEmail(),

  body("founded_year")
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(
      `Год основания должен быть от 1000 до ${new Date().getFullYear()}`
    )
    .toInt(),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Страна не должна превышать 100 символов"),
];

/**
 * Валидация обновления издателя
 */
const validateUpdatePublisher = [
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Название не может быть пустым")
    .isLength({ min: 2, max: 255 })
    .withMessage("Название должно быть от 2 до 255 символов"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Описание не должно превышать 2000 символов"),

  body("website")
    .optional()
    .trim()
    .isURL()
    .withMessage("Неверный формат веб-сайта")
    .isLength({ max: 500 })
    .withMessage("URL сайта не должен превышать 500 символов"),

  body("contact_email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Неверный формат email")
    .isLength({ max: 255 })
    .withMessage("Email не должен превышать 255 символов")
    .normalizeEmail(),

  body("founded_year")
    .optional()
    .isInt({ min: 1000, max: new Date().getFullYear() })
    .withMessage(
      `Год основания должен быть от 1000 до ${new Date().getFullYear()}`
    )
    .toInt(),

  body("country")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Страна не должна превышать 100 символов"),
];

/**
 * Валидация пагинации для издателей
 */
const validatePublishersPagination = [...validatePagination, ...validateSearch];

module.exports = {
  validatePublisherId,
  validateCreatePublisher,
  validateUpdatePublisher,
  validatePublishersPagination,
};
