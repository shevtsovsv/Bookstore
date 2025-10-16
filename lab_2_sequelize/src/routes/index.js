const express = require("express");
const router = express.Router();

// Импорт роутеров
const authRoutes = require("./authRoutes");
const booksRoutes = require("./booksRoutes");

/**
 * API роуты
 */

// Аутентификация: /api/auth/*
router.use("/auth", authRoutes);

// Книги: /api/books/*
router.use("/books", booksRoutes);

/**
 * Здоровье API - проверка работоспособности
 * GET /api/health
 */
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API работает нормально",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

/**
 * Информация об API
 * GET /api/info
 */
router.get("/info", (req, res) => {
  res.json({
    success: true,
    data: {
      name: "Bookstore API",
      version: "1.0.0",
      description: "REST API для интернет-магазина книг",
      endpoints: {
        auth: {
          "POST /api/auth/register": "Регистрация пользователя",
          "POST /api/auth/login": "Авторизация пользователя",
          "GET /api/auth/me": "Получение профиля пользователя",
          "PUT /api/auth/profile": "Обновление профиля пользователя",
          "GET /api/auth/orders": "История заказов пользователя",
        },
        books: {
          "GET /api/books": "Список книг с фильтрацией",
          "GET /api/books/popular": "Популярные книги",
          "GET /api/books/stats": "Статистика по книгам",
          "GET /api/books/:id": "Детальная информация о книге",
          "POST /api/books/:id/purchase": "Покупка книги",
        },
        utility: {
          "GET /api/health": "Проверка работоспособности API",
          "GET /api/info": "Информация об API",
        },
      },
      features: [
        "JWT аутентификация",
        "Валидация данных (Joi)",
        "Пагинация и фильтрация",
        "Транзакционные покупки",
        "Защита от Race Conditions",
        "JSONB для гибких данных",
        "Полнотекстовый поиск",
      ],
    },
  });
});

/**
 * Обработка несуществующих API роутов
 */
router.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint не найден",
    requested_url: req.originalUrl,
    method: req.method,
    available_endpoints: "/api/info",
  });
});

module.exports = router;
