const jwt = require('jsonwebtoken');
const { User } = require('../../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';

/**
 * Middleware для проверки JWT токена
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Токен доступа не предоставлен'
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Получаем пользователя из базы данных
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не найден'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({
        success: false,
        message: 'Недействительный токен'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        success: false,
        message: 'Токен истёк'
      });
    }

    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Ошибка сервера при проверке аутентификации'
    });
  }
};

/**
 * Middleware для проверки роли пользователя
 */
const requireRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Пользователь не аутентифицирован'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Недостаточно прав доступа'
      });
    }

    next();
  };
};

/**
 * Middleware только для администраторов
 */
const requireAdmin = requireRole(['admin']);

/**
 * Middleware для администраторов и менеджеров
 */
const requireAdminOrManager = requireRole(['admin', 'manager']);

module.exports = {
  authenticateToken,
  requireRole,
  requireAdmin,
  requireAdminOrManager,
  JWT_SECRET
};