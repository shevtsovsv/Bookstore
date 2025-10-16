const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, "public")));

// Маршрут для главной страницы
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Заглушки для API routes (добавим позже)
app.use("/api/auth", (req, res) => {
  res.json({ message: "Auth routes будут добавлены позже" });
});

app.use("/api/books", (req, res) => {
  res.json({ message: "Books routes будут добавлены позже" });
});

app.use("/api/orders", (req, res) => {
  res.json({ message: "Orders routes будут добавлены позже" });
});

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

app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на порту ${PORT}`);
  console.log(`📖 Главная страница: http://localhost:${PORT}`);
  console.log(`📚 API endpoints: http://localhost:${PORT}/api`);
});
