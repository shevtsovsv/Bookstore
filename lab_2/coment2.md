# 🚀 Детальный план реализации на NodeJS + PostgreSQL + Express

## 📝 Общие принципы архитектуры

### Структура проекта:

```
lab_2_backend/
├── src/
│   ├── controllers/     # Контроллеры API
│   ├── models/         # Модели данных
│   ├── routes/         # Маршруты API
│   ├── middleware/     # Промежуточное ПО
│   ├── config/         # Конфигурация БД
│   ├── migrations/     # Миграции БД
│   ├── validators/     # Валидаторы данных
│   └── utils/          # Утилиты
├── public/             # Статические файлы (HTML, CSS, JS)
├── package.json
└── server.js           # Точка входа
```

## 🔄 Два варианта реализации

### Вариант A: С Sequelize ORM

**Преимущества:**

- Автоматическая валидация данных
- Простые миграции
- Встроенные ассоциации между таблицами
- Защита от SQL-инъекций
- Легкое тестирование

**Недостатки:**

- Дополнительный слой абстракции
- Больше зависимостей
- Сложнее для оптимизации запросов

### Вариант B: Нативный PostgreSQL с pg

**Преимущества:**

- Прямой контроль над SQL
- Лучшая производительность
- Меньше зависимостей
- Более гибкие запросы

**Недостатки:**

- Больше кода для написания
- Необходимость самостоятельной валидации
- Ручная защита от SQL-инъекций

## 🗄️ Схема базы данных

```sql
-- Таблица пользователей
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица книг
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100),
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    short_description TEXT,
    image VARCHAR(255),
    popularity INTEGER DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Таблица заказов
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    book_id INTEGER REFERENCES books(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 🔧 Ключевые технические решения

### 1. Валидация пароля (замечание п.3)

```javascript
// Регулярное выражение для пароля
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/;

// Функция валидации
function validatePassword(password) {
  const hasEnglishChars = /[a-zA-Z]/.test(password);
  const hasDigits = /\d/.test(password);
  const hasUppercase = /[A-Z]/.test(password);

  return hasEnglishChars && hasDigits && hasUppercase && password.length >= 8;
}
```

### 2. Email валидация (замечание п.2)

```javascript
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateEmail(email) {
  return emailRegex.test(email);
}
```

### 3. Бесконечный скроллинг (замечание п.6)

```javascript
// API endpoint с пагинацией
GET /api/books?page=1&limit=10&sort=popularity&stock=available

// Пример контроллера
async function getBooks(req, res) {
    const { page = 1, limit = 10, sort = 'popularity' } = req.query;
    const offset = (page - 1) * limit;

    const books = await Book.findAll({
        where: { stock: { [Op.gt]: 0 } }, // только книги в наличии
        order: [[sort, 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
    });

    res.json(books);
}
```

### 4. Обработка одновременных запросов (замечание п.7)

```javascript
// Использование транзакций для избежания race conditions
async function purchaseBook(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const { bookId, quantity } = req.body;

    // Блокируем строку для обновления
    const book = await Book.findByPk(bookId, {
      lock: true,
      transaction,
    });

    if (!book || book.stock < quantity) {
      throw new Error("Недостаточно товара на складе");
    }

    // Атомарное обновление
    await book.update(
      {
        stock: book.stock - quantity,
        popularity: book.popularity + quantity,
      },
      { transaction }
    );

    // Создание заказа
    await Order.create(
      {
        user_id: req.user.id,
        book_id: bookId,
        quantity,
        total_price: book.price * quantity,
      },
      { transaction }
    );

    await transaction.commit();
    res.json({ success: true });
  } catch (error) {
    await transaction.rollback();
    res.status(400).json({ error: error.message });
  }
}
```

### 5. Система популярности (замечание п.14)

```sql
-- При покупке книги увеличиваем популярность
UPDATE books
SET popularity = popularity + ?,
    stock = stock - ?
WHERE id = ? AND stock >= ?;

-- Получение топ-10 популярных книг
SELECT * FROM books
WHERE stock > 0
ORDER BY popularity DESC
LIMIT 10;
```

## 📊 API Endpoints

### Аутентификация

- `POST /api/auth/register` - Регистрация с валидацией email и пароля
- `POST /api/auth/login` - Вход с email
- `POST /api/auth/logout` - Выход из системы
- `GET /api/auth/me` - Получение информации о текущем пользователе

### Каталог книг

- `GET /api/books` - Список книг с пагинацией и фильтрацией
- `GET /api/books/popular` - Топ-10 популярных книг (замечание п.13)
- `GET /api/books/:id` - Детали конкретной книги

### Покупки

- `POST /api/orders` - Создание заказа (покупка книги)
- `GET /api/orders` - История заказов пользователя

## 🔒 Безопасность и производительность

### Защита от Race Conditions (замечание п.7)

```javascript
// Middleware для rate limiting
const rateLimit = require("express-rate-limit");

const purchaseLimit = rateLimit({
  windowMs: 60 * 1000, // 1 минута
  max: 5, // максимум 5 покупок в минуту
  message: "Слишком много попыток покупки",
});

app.use("/api/orders", purchaseLimit);
```

### Валидация данных (замечания п.1, п.2, п.3)

```javascript
const Joi = require("joi");

const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string()
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{8,}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Пароль должен содержать английские символы, цифры и одну заглавную букву",
    }),
  firstName: Joi.string().optional(),
  lastName: Joi.string().optional(),
});

// Middleware валидации
function validateRegister(req, res, next) {
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
}
```

### Хеширование паролей

```javascript
const bcrypt = require("bcrypt");

async function hashPassword(password) {
  return await bcrypt.hash(password, 12);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}
```

### JWT токены для сессий

```javascript
const jwt = require("jsonwebtoken");

function generateToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });
}

// Middleware для проверки токена
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Недействительный токен" });
    }
    req.user = user;
    next();
  });
}
```

## 🎨 Frontend обновления

### Бесконечный скроллинг (замечание п.6)

```javascript
// Intersection Observer для загрузки новых порций
let currentPage = 1;
let isLoading = false;

const observer = new IntersectionObserver((entries) => {
  if (entries[0].isIntersecting && !isLoading) {
    loadMoreBooks();
  }
});

async function loadMoreBooks() {
  isLoading = true;

  try {
    const response = await fetch(
      `/api/books?page=${currentPage}&limit=10&sort=popularity`
    );
    const books = await response.json();

    if (books.length > 0) {
      appendBooksToDOM(books);
      currentPage++;
    }
  } catch (error) {
    console.error("Ошибка загрузки книг:", error);
  } finally {
    isLoading = false;
  }
}

// Наблюдение за последним элементом
observer.observe(
  document.querySelector(".books-container .book-item:last-child")
);
```

### Переработка UI (замечания п.10-12)

#### Главная страница с "О нас" (замечание п.10)

```javascript
// Загрузка популярных книг при загрузке страницы
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await fetch("/api/books/popular");
    const popularBooks = await response.json();
    displayPopularBooks(popularBooks);
  } catch (error) {
    console.error("Ошибка загрузки популярных книг:", error);
  }
});

function displayPopularBooks(books) {
  const container = document.getElementById("popular-books");
  container.innerHTML = books
    .map(
      (book) => `
        <div class="book-card">
            <img src="/img/${book.image}" alt="${book.title}">
            <h3>${book.title}</h3>
            <p>${book.author}</p>
            <span class="price">${book.price} ₽</span>
        </div>
    `
    )
    .join("");
}
```

#### Футер с контактами (замечание п.12)

```html
<footer class="footer">
  <div class="footer-content">
    <div class="contact-info">
      <h3>Контакты</h3>
      <p>Email: info@bookstore.ru</p>
      <p>Телефон: +7 (495) 123-45-67</p>
    </div>
    <div class="stores-map">
      <h3>Наши магазины</h3>
      <div id="map"></div>
    </div>
  </div>
</footer>
```

#### Google Maps с несколькими магазинами (замечание п.11)

```javascript
function initMap() {
  const map = new google.maps.Map(document.getElementById("map"), {
    zoom: 10,
    center: { lat: 55.7558, lng: 37.6176 }, // Москва
  });

  const stores = [
    { lat: 55.7558, lng: 37.6176, name: "Магазин на Красной площади" },
    { lat: 55.7387, lng: 37.6032, name: "Магазин в Замоскворечье" },
    { lat: 55.7753, lng: 37.5983, name: "Магазин в Тверском районе" },
  ];

  stores.forEach((store) => {
    new google.maps.Marker({
      position: { lat: store.lat, lng: store.lng },
      map: map,
      title: store.name,
    });
  });
}
```

#### Кнопка выхода (замечание п.5)

```javascript
// Добавление кнопки выхода в навигацию
function updateNavigation(isLoggedIn) {
  const nav = document.querySelector(".menu");

  if (isLoggedIn) {
    // Добавляем кнопку выхода
    const logoutButton = document.createElement("li");
    logoutButton.innerHTML = '<a href="#" id="logout-btn">Выход</a>';
    nav.appendChild(logoutButton);

    // Обработчик выхода
    document.getElementById("logout-btn").addEventListener("click", logout);

    // Убираем кнопки входа и регистрации
    document.querySelector('a[href="html/login.html"]').parent.style.display =
      "none";
    document.querySelector(
      'a[href="html/register.html"]'
    ).parent.style.display = "none";
  }
}

function logout() {
  localStorage.removeItem("authToken");
  window.location.href = "/index.html";
}
```

### Редирект в каталог после регистрации (замечание п.9)

```javascript
// В форме регистрации
async function handleRegister(event) {
  event.preventDefault();

  const formData = new FormData(event.target);
  const userData = {
    email: formData.get("email"),
    password: formData.get("password"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
  };

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (response.ok) {
      localStorage.setItem("authToken", result.token);
      // Редирект в каталог книг
      window.location.href = "/html/book.html";
    } else {
      showError(result.error);
    }
  } catch (error) {
    showError("Ошибка регистрации");
  }
}
```

## 📦 Зависимости

### Основные пакеты

```json
{
  "name": "bookstore-backend",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "migrate": "node migrations/migrate.js"
  },
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.8.0",
    "bcrypt": "^5.1.0",
    "jsonwebtoken": "^9.0.0",
    "joi": "^17.6.0",
    "cors": "^2.8.5",
    "helmet": "^6.0.0",
    "express-rate-limit": "^6.6.0",
    "dotenv": "^16.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.0"
  }
}
```

### Дополнительно для Sequelize (Вариант A)

```json
{
  "sequelize": "^6.25.0",
  "sequelize-cli": "^6.5.0"
}
```

## 🔧 Примеры конфигурации

### Подключение к PostgreSQL

```javascript
// config/database.js
const { Pool } = require("pg");

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "bookstore",
  password: process.env.DB_PASSWORD || "password",
  port: process.env.DB_PORT || 5432,
});

module.exports = pool;
```

### Основной сервер

```javascript
// server.js
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const authRoutes = require("./src/routes/auth");
const bookRoutes = require("./src/routes/books");
const orderRoutes = require("./src/routes/orders");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.static("public"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/orders", orderRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
```

## 📋 План реализации по этапам

1. **Инициализация проекта** - Настройка окружения
2. **Проектирование БД** - Создание схемы таблиц
3. **Миграции** - Создание таблиц в PostgreSQL
4. **Модели данных** - Выбор между Sequelize/pg
5. **Аутентификация** - Регистрация, вход, валидация
6. **API каталога** - Пагинация, сортировка
7. **Бесконечный скроллинг** - Frontend реализация
8. **Система покупок** - Транзакции, обновление популярности
9. **Главная страница** - Топ книги, "О нас"
10. **UI обновления** - Футер, карта, кнопка выхода
11. **Обработка ошибок** - Race conditions, логирование
12. **Навигация** - Редиректы, управление сессиями

Этот план покрывает все замечания преподавателя и предоставляет детальное техническое описание реализации с двумя вариантами работы с базой данных.
