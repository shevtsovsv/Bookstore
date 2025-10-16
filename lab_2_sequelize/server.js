const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

// Импорт моделей и проверка подключения к БД
const { sequelize } = require("./models");

// Импорт API роутеров
const apiRoutes = require("./src/routes");

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting для защиты от DDoS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 100, // максимум 100 запросов с одного IP за окно
  message: {
    success: false,
    message: "Слишком много запросов с вашего IP. Попробуйте позже.",
  },
});

// Специальный лимит для аутентификации (более строгий)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 минут
  max: 10, // максимум 10 попыток входа за 15 минут
  message: {
    success: false,
    message: "Слишком много попыток входа. Попробуйте через 15 минут.",
  },
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Применяем rate limiting
app.use(limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

// Статические файлы
app.use(express.static(path.join(__dirname, "public")));

// Маршрут для главной страницы
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API роуты
app.use("/api", apiRoutes);

// Обработка 404 (должна быть перед обработкой ошибок)
app.use((req, res, next) => {
  res.status(404).json({ error: "Страница не найдена" });
});

// Обработка ошибок (должна быть в самом конце)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: "Внутренняя ошибка сервера",
    message: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Проверка подключения к базе данных при старте
const startServer = async () => {
  try {
    // Проверяем подключение к PostgreSQL
    await sequelize.authenticate();
    console.log("✅ Подключение к PostgreSQL установлено");

    // Запускаем сервер
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на порту ${PORT}`);
      console.log(`📖 Главная страница: http://localhost:${PORT}`);
      console.log(`📚 API endpoints: http://localhost:${PORT}/api`);
      console.log(`🔍 API документация: http://localhost:${PORT}/api/info`);
      console.log(
        `❤️ Проверка здоровья API: http://localhost:${PORT}/api/health`
      );
    });
  } catch (error) {
    console.error("❌ Ошибка подключения к базе данных:", error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("🔄 Получен сигнал SIGTERM, закрываем сервер...");
  await sequelize.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("🔄 Получен сигнал SIGINT, закрываем сервер...");
  await sequelize.close();
  process.exit(0);
});

// Запускаем сервер
startServer();
