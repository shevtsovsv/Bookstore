# 🔐 Пошаговое создание API аутентификации

## 📋 Обзор

Система аутентификации - это основа любого веб-приложения. Она отвечает за:

- Регистрацию новых пользователей
- Вход в систему (логин)
- Проверку подлинности токенов
- Управление профилем пользователя

## 🛠 Технологии

- **bcryptjs** - хеширование паролей
- **jsonwebtoken** - создание и проверка JWT токенов
- **express-validator** - валидация входящих данных

## 📁 Структура файлов

```
src/
├── controllers/authController.js    # Бизнес-логика аутентификации
├── routes/auth.js                  # Маршруты API
├── middleware/auth.js              # Проверка JWT токенов
└── utils/auth.js                   # Утилиты для работы с паролями
```

## 🔧 Шаг 1: Утилиты аутентификации (`src/utils/auth.js`)

```javascript
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

/**
 * Хеширование пароля с использованием bcryptjs
 * @param {string} password - Пароль в открытом виде
 * @returns {Promise<string>} - Хешированный пароль
 */
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Проверка пароля
 * @param {string} password - Пароль в открытом виде
 * @param {string} hashedPassword - Хешированный пароль из БД
 * @returns {Promise<boolean>} - Результат проверки
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Генерация JWT токена
 * @param {Object} payload - Данные для токена (обычно user.id и user.role)
 * @returns {string} - JWT токен
 */
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Проверка JWT токена
 * @param {string} token - JWT токен
 * @returns {Object} - Декодированные данные токена
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  verifyToken,
};
```

## 🔒 Шаг 2: Middleware для проверки аутентификации (`src/middleware/auth.js`)

```javascript
const jwt = require("jsonwebtoken");
const { User } = require("../../models");

/**
 * Middleware для проверки JWT токена
 * Проверяет наличие и валидность токена в заголовке Authorization
 */
const authenticateToken = async (req, res, next) => {
  try {
    // Получаем токен из заголовка Authorization
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Токен доступа не предоставлен",
      });
    }

    // Проверяем валидность токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Получаем пользователя из базы данных
    const user = await User.findByPk(decoded.id, {
      attributes: ["id", "username", "email", "firstName", "lastName", "role"],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    // Добавляем пользователя в объект запроса
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Токен истек",
      });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Недействительный токен",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Ошибка проверки аутентификации",
    });
  }
};

/**
 * Middleware для проверки прав администратора
 * Должен использоваться ПОСЛЕ authenticateToken
 */
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Требуется аутентификация",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Недостаточно прав доступа",
    });
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
};
```

## 🎯 Шаг 3: Контроллер аутентификации (`src/controllers/authController.js`)

```javascript
const { User } = require("../../models");
const { validationResult } = require("express-validator");
const {
  hashPassword,
  comparePassword,
  generateToken,
} = require("../utils/auth");

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Проверяем результаты валидации
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { username, email, password, firstName, lastName } = req.body;

    // Проверяем уникальность username и email
    const existingUser = await User.findOne({
      where: {
        $or: [{ username }, { email }],
      },
    });

    if (existingUser) {
      const field = existingUser.username === username ? "username" : "email";
      return res.status(400).json({
        success: false,
        message: `Пользователь с таким ${field} уже существует`,
      });
    }

    // Хешируем пароль
    const hashedPassword = await hashPassword(password);

    // Создаем пользователя
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "user", // По умолчанию обычный пользователь
    });

    // Генерируем токен
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);

    // Обработка ошибок Sequelize
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Пользователь с такими данными уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка сервера при регистрации",
    });
  }
};

/**
 * Вход в систему
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    // Ищем пользователя по email
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    // Проверяем пароль
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    // Генерируем токен
    const token = generateToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    res.json({
      success: true,
      message: "Успешный вход в систему",
      data: {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        },
        token,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка сервера при входе в систему",
    });
  }
};

/**
 * Получение профиля текущего пользователя
 * GET /api/auth/profile
 */
const getProfile = async (req, res) => {
  try {
    // req.user уже заполнен middleware authenticateToken
    const user = await User.findByPk(req.user.id, {
      attributes: [
        "id",
        "username",
        "email",
        "firstName",
        "lastName",
        "role",
        "createdAt",
      ],
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    res.json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения профиля",
    });
  }
};

/**
 * Обновление профиля пользователя
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { firstName, lastName } = req.body;
    const userId = req.user.id;

    // Обновляем профиль
    await User.update({ firstName, lastName }, { where: { id: userId } });

    // Получаем обновленные данные
    const updatedUser = await User.findByPk(userId, {
      attributes: ["id", "username", "email", "firstName", "lastName", "role"],
    });

    res.json({
      success: true,
      message: "Профиль успешно обновлен",
      data: { user: updatedUser },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления профиля",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};
```

## 🛣 Шаг 4: Маршруты аутентификации (`src/routes/auth.js`)

```javascript
const express = require("express");
const { body } = require("express-validator");
const authController = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

/**
 * Валидация регистрации
 */
const validateRegister = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("Username обязателен")
    .isLength({ min: 3, max: 30 })
    .withMessage("Username должен содержать от 3 до 30 символов")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage(
      "Username может содержать только буквы, цифры и подчеркивания"
    ),

  body("email")
    .trim()
    .isEmail()
    .withMessage("Некорректный формат email")
    .normalizeEmail(),

  body("password")
    .isLength({ min: 8 })
    .withMessage("Пароль должен содержать минимум 8 символов")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]*$/)
    .withMessage(
      "Пароль должен содержать как минимум одну заглавную букву, одну строчную букву и одну цифру"
    ),

  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Имя обязательно")
    .isLength({ max: 50 })
    .withMessage("Имя не должно превышать 50 символов"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Фамилия обязательна")
    .isLength({ max: 50 })
    .withMessage("Фамилия не должна превышать 50 символов"),
];

/**
 * Валидация входа
 */
const validateLogin = [
  body("email")
    .trim()
    .isEmail()
    .withMessage("Некорректный формат email")
    .normalizeEmail(),

  body("password").notEmpty().withMessage("Пароль обязателен"),
];

/**
 * Валидация обновления профиля
 */
const validateUpdateProfile = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("Имя обязательно")
    .isLength({ max: 50 })
    .withMessage("Имя не должно превышать 50 символов"),

  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Фамилия обязательна")
    .isLength({ max: 50 })
    .withMessage("Фамилия не должна превышать 50 символов"),
];

/**
 * @route   POST /api/auth/register
 * @desc    Регистрация нового пользователя
 * @access  Public
 * @body    { username, email, password, firstName, lastName }
 */
router.post("/register", validateRegister, authController.register);

/**
 * @route   POST /api/auth/login
 * @desc    Вход в систему
 * @access  Public
 * @body    { email, password }
 */
router.post("/login", validateLogin, authController.login);

/**
 * @route   GET /api/auth/profile
 * @desc    Получение профиля текущего пользователя
 * @access  Private
 */
router.get("/profile", authenticateToken, authController.getProfile);

/**
 * @route   PUT /api/auth/profile
 * @desc    Обновление профиля пользователя
 * @access  Private
 * @body    { firstName, lastName }
 */
router.put(
  "/profile",
  authenticateToken,
  validateUpdateProfile,
  authController.updateProfile
);

module.exports = router;
```

## 🔌 Шаг 5: Подключение в главном файле (`server.js`)

```javascript
// Подключение маршрутов аутентификации
const authRoutes = require("./src/routes/auth");
app.use("/api/auth", authRoutes);
```

## 📝 Примеры использования

### Регистрация

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Вход в систему

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

### Получение профиля

```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## 🔑 Ключевые принципы

1. **Безопасность паролей**: Всегда хешируем пароли с помощью bcrypt
2. **JWT токены**: Используем для stateless аутентификации
3. **Валидация**: Проверяем все входящие данные
4. **Обработка ошибок**: Возвращаем понятные сообщения об ошибках
5. **Модульность**: Разделяем логику по файлам для удобства поддержки

## ✅ Результат

После выполнения всех шагов у вас будет:

- ✅ Полностью функциональная система регистрации и входа
- ✅ JWT-based аутентификация
- ✅ Защищенные маршруты
- ✅ Валидация всех входящих данных
- ✅ Правильная обработка ошибок
