const { User } = require("../../models");
const { generateToken } = require("../middleware/auth");

/**
 * Регистрация нового пользователя
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Пользователь с таким email уже существует",
      });
    }

    // Создаем нового пользователя (пароль автоматически хешируется в модели)
    const user = await User.createUser({
      email,
      password,
      first_name,
      last_name,
    });

    // Генерируем JWT токен
    const token = generateToken(user);

    // Возвращаем данные пользователя без пароля
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      orders_count: user.getOrdersCount(),
      total_spent: user.getTotalSpent(),
      created_at: user.created_at,
    };

    res.status(201).json({
      success: true,
      message: "Пользователь успешно зарегистрирован",
      data: {
        user: userData,
        token,
        token_type: "Bearer",
      },
    });
  } catch (error) {
    console.error("Ошибка регистрации:", error);

    // Обработка ошибок валидации Sequelize
    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors,
      });
    }

    // Обработка ошибок уникальности
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Пользователь с таким email уже существует",
      });
    }

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Авторизация пользователя
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Аутентификация пользователя
    const user = await User.authenticate(email, password);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Неверный email или пароль",
      });
    }

    // Генерируем JWT токен
    const token = generateToken(user);

    // Возвращаем данные пользователя без пароля
    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      orders_count: user.getOrdersCount(),
      total_spent: user.getTotalSpent(),
      created_at: user.created_at,
    };

    res.json({
      success: true,
      message: "Успешная авторизация",
      data: {
        user: userData,
        token,
        token_type: "Bearer",
      },
    });
  } catch (error) {
    console.error("Ошибка авторизации:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Получение информации о текущем пользователе
 * GET /api/auth/me
 */
const getProfile = async (req, res) => {
  try {
    const user = req.user; // Получаем из middleware аутентификации

    // Обновляем данные пользователя из БД
    await user.reload();

    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      orders_count: user.getOrdersCount(),
      total_spent: user.getTotalSpent(),
      orders_history: user.orders_history,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      data: { user: userData },
    });
  } catch (error) {
    console.error("Ошибка получения профиля:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Обновление профиля пользователя
 * PUT /api/auth/profile
 */
const updateProfile = async (req, res) => {
  try {
    const user = req.user;
    const { first_name, last_name } = req.body;

    // Обновляем только разрешенные поля
    const updates = {};
    if (first_name !== undefined) updates.first_name = first_name;
    if (last_name !== undefined) updates.last_name = last_name;

    await user.update(updates);

    const userData = {
      id: user.id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      orders_count: user.getOrdersCount(),
      total_spent: user.getTotalSpent(),
      updated_at: user.updated_at,
    };

    res.json({
      success: true,
      message: "Профиль успешно обновлен",
      data: { user: userData },
    });
  } catch (error) {
    console.error("Ошибка обновления профиля:", error);

    if (error.name === "SequelizeValidationError") {
      const errors = error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      }));

      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors,
      });
    }

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

/**
 * Получение истории заказов пользователя
 * GET /api/auth/orders
 */
const getOrderHistory = async (req, res) => {
  try {
    const user = req.user;
    const { page = 1, limit = 20 } = req.query;

    // Получаем историю заказов
    const orders = user.orders_history || [];

    // Сортируем по дате (новые сначала)
    const sortedOrders = orders.sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );

    // Пагинация
    const offset = (page - 1) * limit;
    const paginatedOrders = sortedOrders.slice(offset, offset + limit);

    // Статистика
    const totalOrders = orders.length;
    const totalSpent = user.getTotalSpent();
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalOrders,
          pages: totalPages,
        },
        statistics: {
          total_orders: totalOrders,
          total_spent: totalSpent,
        },
      },
    });
  } catch (error) {
    console.error("Ошибка получения истории заказов:", error);

    res.status(500).json({
      success: false,
      message: "Внутренняя ошибка сервера",
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getOrderHistory,
};
