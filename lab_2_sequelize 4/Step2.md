# 🗄️ Шаг 2: Проектирование схемы базы данных (2 таблицы)

## 📋 Обзор

На данном шаге мы спроектировали оптимальную схему базы данных с учетом ограничения **максимум 2 таблицы** от преподавателя и всех функциональных требований проекта.

## 🎯 Учтенные требования преподавателя

### Критические ограничения:

- ✅ **Максимум 2 таблицы** (новое требование)
- ✅ **Email для авторизации** (замечание 2)
- ✅ **Валидация пароля** (замечание 3)
- ✅ **Поле популярности** (замечание 14)
- ✅ **Количество на складе** (замечание 15)
- ✅ **Race conditions защита** (замечание 7)

## 🏗️ Архитектурное решение

### Выбранная стратегия: Users + Books (без Orders)

Вместо трех таблиц (users, books, orders) используем **JSONB поля** в PostgreSQL:

```sql
users.orders_history JSONB  -- История заказов пользователя
books.metadata JSONB        -- Дополнительные данные книги
```

## 🗄️ Схема базы данных

### Таблица 1: Users

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,           -- Замечание 2
    password_hash VARCHAR(255) NOT NULL,          -- Хеш пароля (bcrypt)
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    orders_history JSONB DEFAULT '[]',            -- История покупок в JSON
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 2: Books

```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    genre VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,                             -- Полное описание
    short_description TEXT,                       -- Краткое описание
    image VARCHAR(255),                           -- Имя файла изображения
    popularity INTEGER DEFAULT 0,                 -- Замечание 14: счетчик покупок
    stock INTEGER DEFAULT 0,                      -- Замечание 15: количество на складе
    metadata JSONB DEFAULT '{}',                  -- Категории, ISBN и др.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## 📊 Структура JSONB полей

### orders_history (в таблице users):

```json
[
  {
    "order_id": "uuid-string",
    "book_id": 1,
    "title": "Название книги",
    "quantity": 2,
    "price": 900.0,
    "total": 1800.0,
    "date": "2025-10-13T10:30:00Z"
  },
  {
    "order_id": "uuid-string-2",
    "book_id": 3,
    "title": "Другая книга",
    "quantity": 1,
    "price": 1200.0,
    "total": 1200.0,
    "date": "2025-10-14T15:45:00Z"
  }
]
```

### metadata (в таблице books):

```json
{
  "categories": ["romance", "foreign", "price-low"],
  "priceCategory": "low",
  "authorType": "foreign",
  "isbn": "978-5-389-12345-1",
  "publisher": "Издательство АСТ",
  "year": 2023,
  "pages": 450
}
```

## 🔍 Преимущества выбранного решения

### 1. **Соответствие ограничениям**

- ✅ Только 2 таблицы вместо 3
- ✅ Сохранена вся функциональность
- ✅ Гибкость через JSONB

### 2. **Производительность PostgreSQL**

- 🚀 JSONB индексируется и быстро запрашивается
- 🔍 GIN индексы для сложных JSON запросов
- 📊 Статистика и аналитика через JSON функции

### 3. **Функциональность**

- 📈 История заказов сохраняется
- 🔢 Популярность отслеживается
- 📦 Склад контролируется
- 🏷️ Категории и метаданные гибкие

### 4. **Масштабируемость**

- 📊 Легко добавлять новые поля в JSON
- 🔄 Миграции не затрагивают структуру таблиц
- 📈 Горизонтальное масштабирование возможно

## 🎯 Решение функциональных задач

### Популярность книг (замечание 14):

```sql
-- Увеличение популярности при покупке
UPDATE books
SET popularity = popularity + quantity,
    updated_at = CURRENT_TIMESTAMP
WHERE id = book_id;

-- Топ-10 популярных книг
SELECT * FROM books
WHERE stock > 0
ORDER BY popularity DESC
LIMIT 10;
```

### История заказов (замечания 7, 8):

```sql
-- Добавление заказа в историю пользователя (атомарно)
UPDATE users
SET orders_history = orders_history || jsonb_build_array(
  jsonb_build_object(
    'order_id', gen_random_uuid()::text,
    'book_id', $1,
    'title', $2,
    'quantity', $3,
    'price', $4,
    'total', $5,
    'date', CURRENT_TIMESTAMP
  )
),
updated_at = CURRENT_TIMESTAMP
WHERE id = user_id;
```

### Фильтрация по складу (замечание 15):

```sql
-- Показываем только книги в наличии
SELECT * FROM books
WHERE stock > 0
ORDER BY popularity DESC;
```

## 📈 Индексы для производительности

### Созданные индексы:

```sql
-- Пользователи
CREATE UNIQUE INDEX users_email_unique_idx ON users(email);

-- Книги
CREATE INDEX books_popularity_idx ON books(popularity);
CREATE INDEX books_stock_idx ON books(stock);
CREATE INDEX books_genre_idx ON books(genre);
CREATE INDEX books_author_idx ON books(author);

-- JSONB индексы (планируются)
CREATE INDEX books_metadata_gin_idx ON books USING GIN(metadata);
CREATE INDEX users_orders_gin_idx ON users USING GIN(orders_history);
```

## 🛡️ Обработка Race Conditions (замечание 7)

### Транзакционная покупка:

```sql
BEGIN;

-- 1. Блокируем книгу для обновления
SELECT id, stock, popularity
FROM books
WHERE id = $1
FOR UPDATE;

-- 2. Проверяем наличие
IF stock >= quantity THEN
  -- 3. Обновляем книгу
  UPDATE books
  SET stock = stock - quantity,
      popularity = popularity + quantity
  WHERE id = $1;

  -- 4. Добавляем в историю пользователя
  UPDATE users SET orders_history = orders_history || $order_json
  WHERE id = $user_id;

  COMMIT;
ELSE
  ROLLBACK;
END IF;
```

## 📝 Созданные файлы

### Миграции:

- ✅ `migrations/20251013143521-create-users.js`
- ✅ `migrations/20251013144458-create-books.js`

### Seeders:

- ✅ `seeders/20251013144632-demo-books.js`

### Данные для тестирования:

```javascript
// Книги с разной популярностью:
"Маленький принц"     → popularity: 150 (самая популярная)
"Гроза"               → popularity: 120
"Человек-амфибия"     → popularity: 95
"Унесённые ветром"    → popularity: 85
"Великий Гэтсби"      → popularity: 78
"Море и звезды"       → popularity: 45

// Книги с разным складом:
"Великий Гэтсби"      → stock: 0 (закончились)
"Гроза"               → stock: 8 (мало)
"Маленький принц"     → stock: 25 (много)
```

## 🚀 Следующие шаги

1. ✅ **Схема БД спроектирована**
2. ⏳ **Запуск миграций** (создание таблиц)
3. ⏳ **Заполнение тестовыми данными**
4. ⏳ **Создание Sequelize моделей**
5. ⏳ **Валидация и ассоциации**

## 💡 Ключевые решения

### 🎯 **Компромиссы:**

- **Отказались от отдельной таблицы Orders** → используем JSONB в users
- **Сохранили всю функциональность** → история, аналитика, отчеты
- **Повысили производительность** → меньше JOIN операций

### ⚡ **Выигрыши:**

- **Простота схемы** - только 2 таблицы
- **Гибкость данных** - JSONB для метаданных
- **Атомарность операций** - все в одной транзакции
- **Соответствие требованиям** - все замечания учтены

**Переход к Шагу 3: Создание и запуск миграций БД** ➡️
