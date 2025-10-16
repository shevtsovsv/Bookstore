const express = require("express");
const router = express.Router();

// Импорты контроллеров и middleware
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const {
  validateBody,
  validateQuery,
  registerSchema,
  loginSchema,
} = require("../validators");

/**
 * @route POST /api/auth/register
 * @desc Регистрация нового пользователя
 * @access Public
 */
router.post("/register", validateBody(registerSchema), authController.register);

/**
 * @route POST /api/auth/login
 * @desc Авторизация пользователя
 * @access Public
 */
router.post("/login", validateBody(loginSchema), authController.login);

/**
 * @route GET /api/auth/me
 * @desc Получение информации о текущем пользователе
 * @access Private
 */
router.get("/me", authenticateToken, authController.getProfile);

/**
 * @route PUT /api/auth/profile
 * @desc Обновление профиля пользователя
 * @access Private
 */
router.put(
  "/profile",
  authenticateToken,
  validateBody(
    registerSchema.fork(["email", "password"], (schema) => schema.optional())
  ),
  authController.updateProfile
);

/**
 * @route GET /api/auth/orders
 * @desc Получение истории заказов пользователя
 * @access Private
 */
router.get(
  "/orders",
  authenticateToken,
  validateQuery(
    require("joi").object({
      page: require("joi").number().integer().min(1).default(1),
      limit: require("joi").number().integer().min(1).max(100).default(20),
    })
  ),
  authController.getOrderHistory
);

module.exports = router;
