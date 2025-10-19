const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Валидация для регистрации
 */
const registerValidation = [
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Имя должно содержать от 1 до 50 символов"),

  body("lastName")
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Фамилия должна содержать от 1 до 50 символов"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Введите корректный email"),

  body("username")
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Username должен содержать от 3 до 50 символов"),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Пароль должен содержать минимум 8 символов"),
];

/**
 * Валидация для авторизации
 */
const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Введите корректный email"),

  body("password").notEmpty().withMessage("Пароль обязателен"),
];

/**
 * Валидация для обновления профиля
 */
const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Имя должно содержать от 1 до 50 символов"),

  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage("Фамилия должна содержать от 1 до 50 символов"),
];

/**
 * POST /api/auth/register - Регистрация
 */
router.post("/register", registerValidation, authController.register);

/**
 * POST /api/auth/login - Авторизация
 */
router.post("/login", loginValidation, authController.login);

/**
 * GET /api/auth/profile - Получение профиля (требует аутентификации)
 */
router.get("/profile", authenticateToken, authController.getProfile);

/**
 * PUT /api/auth/profile - Обновление профиля (требует аутентификации)
 */
router.put(
  "/profile",
  authenticateToken,
  updateProfileValidation,
  authController.updateProfile
);

module.exports = router;
