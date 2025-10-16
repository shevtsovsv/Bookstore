const jwt = require("jsonwebtoken");
const { User } = require("../../models");

/**
 * Middleware для проверки JWT токена
 * Добавляет объект user в req если токен валидный
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Токен доступа не предоставлен",
      });
    }

    // Проверяем JWT токен
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Находим пользователя в базе данных
    const user = await User.findByPk(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Пользователь не найден",
      });
    }

    // Добавляем пользователя в запрос
    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        message: "Недействительный токен",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Токен истек",
      });
    }

    console.error("Ошибка аутентификации:", error);
    return res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Middleware для опциональной аутентификации
 * Не возвращает ошибку если токена нет, но добавляет user если есть
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      req.user = null;
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findByPk(decoded.userId);

    req.user = user || null;
    next();
  } catch (error) {
    // При ошибке просто устанавливаем user = null
    req.user = null;
    next();
  }
};

/**
 * Генерация JWT токена для пользователя
 */
const generateToken = (user) => {
  const payload = {
    userId: user.id,
    email: user.email,
  };

  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

/**
 * Middleware для валидации роли пользователя (если нужно в будущем)
 */
const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Требуется аутентификация",
      });
    }

    // В нашей текущей схеме нет ролей, но можно добавить позже
    // if (req.user.role !== role) {
    //   return res.status(403).json({
    //     success: false,
    //     message: 'Недостаточно прав доступа'
    //   });
    // }

    next();
  };
};

module.exports = {
  authenticateToken,
  optionalAuth,
  generateToken,
  requireRole,
};
