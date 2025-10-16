const Joi = require("joi");

/**
 * Валидация данных регистрации
 */
const registerSchema = Joi.object({
  email: Joi.string().email().min(5).max(255).required().messages({
    "string.email": "Некорректный формат email",
    "string.min": "Email должен содержать минимум 5 символов",
    "string.max": "Email не должен превышать 255 символов",
    "any.required": "Email обязателен для заполнения",
  }),

  password: Joi.string()
    .min(8)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      "string.min": "Пароль должен содержать минимум 8 символов",
      "string.pattern.base":
        "Пароль должен содержать заглавные, строчные буквы и цифры",
      "any.required": "Пароль обязателен для заполнения",
    }),

  first_name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Имя не может быть пустым",
    "string.max": "Имя не должно превышать 100 символов",
  }),

  last_name: Joi.string().min(1).max(100).optional().messages({
    "string.min": "Фамилия не может быть пустой",
    "string.max": "Фамилия не должна превышать 100 символов",
  }),
});

/**
 * Валидация данных входа
 */
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    "string.email": "Некорректный формат email",
    "any.required": "Email обязателен для заполнения",
  }),

  password: Joi.string().required().messages({
    "any.required": "Пароль обязателен для заполнения",
  }),
});

/**
 * Валидация параметров поиска книг
 */
const booksQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

  limit: Joi.number().integer().min(1).max(100).default(20),

  search: Joi.string().min(1).max(255).optional(),

  genre: Joi.string().max(100).optional(),

  author: Joi.string().max(255).optional(),

  priceMin: Joi.number().min(0).optional(),

  priceMax: Joi.number().min(0).optional(),

  categories: Joi.alternatives()
    .try(Joi.string(), Joi.array().items(Joi.string()))
    .optional(),

  sortBy: Joi.string()
    .valid("popularity", "price", "created_at", "title")
    .default("popularity"),

  sortOrder: Joi.string().valid("asc", "desc").default("desc"),

  onlyAvailable: Joi.boolean().default(true),
});

/**
 * Валидация данных покупки
 */
const purchaseSchema = Joi.object({
  quantity: Joi.number().integer().min(1).max(100).default(1).messages({
    "number.min": "Количество должно быть больше 0",
    "number.max": "Нельзя купить больше 100 экземпляров за раз",
  }),
});

/**
 * Валидация ID книги в параметрах URL
 */
const bookIdSchema = Joi.object({
  id: Joi.number().integer().min(1).required().messages({
    "number.base": "ID книги должно быть числом",
    "number.min": "ID книги должно быть больше 0",
    "any.required": "ID книги обязательно",
  }),
});

/**
 * Middleware для валидации тела запроса
 */
const validateBody = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors,
      });
    }

    req.body = value;
    next();
  };
};

/**
 * Middleware для валидации параметров запроса (query string)
 */
const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      stripUnknown: true,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Ошибка валидации параметров",
        errors,
      });
    }

    req.query = value;
    next();
  };
};

/**
 * Middleware для валидации параметров URL
 */
const validateParams = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.params, {
      abortEarly: false,
      convert: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join("."),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Ошибка валидации параметров URL",
        errors,
      });
    }

    req.params = value;
    next();
  };
};

module.exports = {
  // Схемы валидации
  registerSchema,
  loginSchema,
  booksQuerySchema,
  purchaseSchema,
  bookIdSchema,

  // Middleware для валидации
  validateBody,
  validateQuery,
  validateParams,
};
