# 🗄️ Шаг 2: Проектирование нормализованной схемы базы данных (10 таблиц)

## 📋 Обзор

На данном шаге мы **пересмотрели архитектуру** и создали **полноценную нормализованную схему** базы данных без ограничения на количество таблиц. Новая схема обеспечивает:

- ✅ **Нормализацию данных** - устранение дублирования
- ✅ **Гибкость и масштабируемость** - легкое добавление новых сущностей
- ✅ **Полную бизнес-функциональность** - корзина, заказы, отзывы, списки желаний
- ✅ **Производительность** - оптимальные индексы и foreign key связи
- ✅ **Целостность данных** - правильные ограничения и каскадные операции

## �️ Последовательность команд для выполнения

### 📋 **Шаг 2.1: Подготовка проекта Sequelize**

```bash
# 1. Переход в папку проекта
cd lab_2_sequelize

# 2. Инициализация проекта Node.js (если не создан)
npm init -y

# 3. Установка Sequelize ORM и PostgreSQL драйвера
npm install sequelize pg pg-hstore

# 4. Установка Sequelize CLI для миграций (глобально или локально)
npm install --save-dev sequelize-cli

# 5. Инициализация структуры Sequelize
npx sequelize-cli init
```

**Что делают эти команды:**

- `npm init -y` - создает package.json с базовой конфигурацией
- `sequelize` - основная ORM библиотека для работы с БД
- `pg` и `pg-hstore` - драйверы для PostgreSQL и поддержка hstore/jsonb
- `sequelize-cli` - утилита командной строки для создания миграций, моделей, seeders
- `npx sequelize-cli init` - создает папки: config, migrations, models, seeders

### 📋 **Шаг 2.2: Настройка PostgreSQL**

```bash
# 1. Установка PostgreSQL (если не установлен)
# Windows: скачать с https://www.postgresql.org/download/windows/
# После установки запустить psql от имени администратора

# 2. Создание пользователя базы данных
psql -U postgres
CREATE USER bookstore_user WITH PASSWORD 'secure_password';
ALTER USER bookstore_user CREATEDB;
\q

# 3. Альтернативный способ - использовать существующего пользователя postgres
# В config.json указать username: "postgres" и ваш пароль
```

**Что делают эти команды:**

- `psql -U postgres` - подключение к PostgreSQL под суперпользователем
- `CREATE USER` - создание нового пользователя с паролем для нашего приложения
- `ALTER USER ... CREATEDB` - даем пользователю права создавать базы данных
- `\q` - выход из psql

### 📋 **Шаг 2.3: Конфигурация подключения к БД**

```bash
# Редактирование файла config/config.json
```

**Содержимое config/config.json:**

```json
{
  "development": {
    "username": "bookstore_user",
    "password": "secure_password",
    "database": "bookstore_dev",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": console.log
  },
  "test": {
    "username": "bookstore_user",
    "password": "secure_password",
    "database": "bookstore_test",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  },
  "production": {
    "username": "bookstore_user",
    "password": "secure_password",
    "database": "bookstore_prod",
    "host": "127.0.0.1",
    "port": 5432,
    "dialect": "postgres",
    "logging": false
  }
}
```

**Параметры конфигурации:**

- `username/password` - учетные данные пользователя PostgreSQL
- `database` - имя базы данных (создается автоматически)
- `host/port` - адрес и порт PostgreSQL сервера
- `dialect` - тип БД (postgres, mysql, sqlite, mssql)
- `logging` - включение/отключение логирования SQL запросов

### 📋 **Шаг 2.4: Создание миграций для таблиц**

```bash
# 1. Создание миграции для таблицы users
npx sequelize-cli migration:generate --name create-users

# 2. Создание миграции для таблицы books
npx sequelize-cli migration:generate --name create-books
```

**Что делают эти команды:**

- Создают файлы миграций в папке `migrations/` с timestamp
- Каждый файл содержит методы `up()` (применение) и `down()` (откат)
- Timestamp обеспечивает правильный порядок выполнения миграций
- Имена файлов: `YYYYMMDDHHMMSS-create-users.js`

### 📋 **Шаг 2.5: Создание сидера для тестовых данных**

```bash
# Создание сидера для заполнения таблицы books тестовыми данными
npx sequelize-cli seed:generate --name demo-books
```

**Что делает эта команда:**

- Создает файл в папке `seeders/` для заполнения таблиц данными
- Сидеры используются для добавления тестовых или начальных данных
- Файл содержит методы `up()` (добавление данных) и `down()` (удаление)

### 📋 **Шаг 2.6: Создание Sequelize моделей**

```bash
# 1. Создание модели User
npx sequelize-cli model:generate --name User --attributes email:string,password_hash:string,first_name:string,last_name:string,orders_history:jsonb

# 2. Создание модели Book
npx sequelize-cli model:generate --name Book --attributes title:string,author:string,genre:string,price:decimal,description:text,short_description:text,image:string,popularity:integer,stock:integer,metadata:jsonb
```

**Что делают эти команды:**

- Создают файлы моделей в папке `models/`
- Автоматически генерируют базовую структуру модели
- Создают соответствующие миграции (если не существуют)
- Модели определяют структуру данных и бизнес-логику

## 🏗️ Архитектурное решение

## 📊 Схема базы данных (10 таблиц)

```
┌─────────────────────────────────────────────────────────────────────────────────────────┐
│                                  СХЕМА БАЗЫ ДАННЫХ                                     │
│                              Нормализованная архитектура                               │
└─────────────────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│     USERS       │     │   CATEGORIES    │     │   PUBLISHERS    │     │    AUTHORS      │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │     │ id (PK)         │
│ first_name      │     │ name            │     │ name            │     │ first_name      │
│ last_name       │     │ slug            │     │ country         │     │ last_name       │
│ email (UNIQUE)  │     │ description     │     │ website         │     │ middle_name     │
│ password_hash   │     │ parent_id (FK)  │ ←─┐ │ email           │     │ birth_date      │
│ phone           │     │ is_active       │   │ │ phone           │     │ death_date      │
│ role            │     │ sort_order      │   │ │ address         │     │ nationality     │
│ created_at      │     │ created_at      │   │ │ founded_year    │     │ biography       │
│ updated_at      │     │ updated_at      │   │ │ created_at      │     │ created_at      │
└─────────────────┘     └─────────────────┘   │ │ updated_at      │     │ updated_at      │
         │                        │           │ └─────────────────┘     └─────────────────┘
         │                        │           │                                   │
         │                        │           └─ parent_id ссылается на id        │
         │                        │                        (иерархия категорий)   │
         │                        │                                               │
         ▼                        ▼                                               ▼
┌─────────────────┐     ┌─────────────────────────────────────────────────────────────────┐
│     ORDERS      │     │                         BOOKS                                   │
├─────────────────┤     ├─────────────────────────────────────────────────────────────────┤
│ id (PK)         │     │ id (PK)              │ category_id (FK) ──────────────────────┐ │
│ user_id (FK) ───┼──►  │ title                │ publisher_id (FK) ─────────────────┐   │ │
│ order_number    │     │ description          │ isbn                              │   │ │
│ total_amount    │     │ price                │ pages                             │   │ │
│ status          │     │ stock                │ language                          │   │ │
│ created_at      │     │ popularity           │ publication_year                  │   │ │
│ updated_at      │     │ created_at           │ edition                           │   │ │
│ shipped_at      │     │ updated_at           │ weight                            │   │ │
│ delivered_at    │     └─────────────────────────────────────────────────────────┼───┼─┘
└─────────────────┘                                    │                          │   │
         │                                             │                          │   │
         ▼                                             ▼                          │   │
┌─────────────────┐                         ┌─────────────────┐                  │   │
│   ORDER_ITEMS   │                         │  BOOK_AUTHORS   │                  │   │
├─────────────────┤                         ├─────────────────┤                  │   │
│ id (PK)         │                         │ id (PK)         │                  │   │
│ order_id (FK) ──┼─────────────────────────│ book_id (FK) ───┼──────────────────┘   │
│ book_id (FK) ───┼─────────────────────────│ author_id (FK) ─┼──────────────────────┘
│ quantity        │                         │ role            │
│ price_per_item  │                         │ created_at      │
│ total_price     │                         │ updated_at      │
│ created_at      │                         └─────────────────┘
│ updated_at      │                                   │
└─────────────────┘                                   │
                                                      ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    REVIEWS      │     │   CART_ITEMS    │     │   WISHLIST      │     │                 │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤     │   СВЯЗИ (FK):   │
│ id (PK)         │     │ id (PK)         │     │ id (PK)         │     │                 │
│ user_id (FK) ───┼──►  │ user_id (FK) ───┼──►  │ user_id (FK) ───┼──►  │ FK = Foreign Key│
│ book_id (FK) ───┼──►  │ book_id (FK) ───┼──►  │ book_id (FK) ───┼──►  │ PK = Primary Key│
│ rating          │     │ quantity        │     │ added_at        │     │                 │
│ title           │     │ added_at        │     └─────────────────┘     │ CASCADE DELETE: │
│ comment         │     └─────────────────┘                             │ • user → orders │
│ is_verified     │                                                     │ • order→items  │
│ created_at      │                                                     │ • user → cart  │
│ updated_at      │                                                     │ • user → wish  │
└─────────────────┘                                                     │ • user → review│
                                                                        │                 │
                                                                        │ RESTRICT DELETE:│
                                                                        │ • category→book│
                                                                        │ • publisher→book│
                                                                        │ • book → items │
                                                                        └─────────────────┘

═══════════════════════════════════════════════════════════════════════════════════════════

📊 ОСНОВНЫЕ СВЯЗИ:

1. users (1) ──────── (N) orders         │ Один пользователь → много заказов
2. orders (1) ─────── (N) order_items    │ Один заказ → много позиций
3. books (1) ──────── (N) order_items    │ Одна книга → много позиций заказов
4. categories (1) ─── (N) books          │ Одна категория → много книг
5. publishers (1) ─── (N) books          │ Одно издательство → много книг
6. books (N) ──────── (N) authors        │ Many-to-Many через book_authors
7. users (1) ──────── (N) reviews        │ Один пользователь → много отзывов
8. books (1) ──────── (N) reviews        │ Одна книга → много отзывов
9. users (1) ──────── (N) cart_items     │ Один пользователь → много позиций корзины
10. users (1) ─────── (N) wishlist       │ Один пользователь → много позиций списка желаний

═══════════════════════════════════════════════════════════════════════════════════════════
```

## 📋 Детальная информация о полях и ограничениях

### 🔍 **Типы данных и ограничения:**

```sql
-- ═══ USERS (Пользователи) ═══
CREATE TABLE users (
    id SERIAL PRIMARY KEY,                    -- Автоинкремент
    first_name VARCHAR(100) NOT NULL,         -- Имя (обязательное)
    last_name VARCHAR(100) NOT NULL,          -- Фамилия (обязательное)
    email VARCHAR(255) UNIQUE NOT NULL,       -- Email (уникальный)
    password_hash VARCHAR(255) NOT NULL,      -- Хеш пароля
    phone VARCHAR(20),                        -- Телефон (опционально)
    role VARCHAR(20) DEFAULT 'customer'       -- Роль: customer|admin|manager
        CHECK (role IN ('customer', 'admin', 'manager')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══ CATEGORIES (Категории) ═══
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,        -- Название (уникальное)
    slug VARCHAR(255) UNIQUE NOT NULL,        -- URL-slug (уникальный)
    description TEXT,                         -- Описание категории
    parent_id INTEGER REFERENCES categories(id) -- Родительская категория
        ON DELETE SET NULL,                   -- При удалении родителя → NULL
    is_active BOOLEAN DEFAULT true,           -- Активна ли категория
    sort_order INTEGER DEFAULT 0,            -- Порядок сортировки
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══ PUBLISHERS (Издательства) ═══
CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,        -- Название (уникальное)
    country VARCHAR(100),                     -- Страна
    website VARCHAR(255),                     -- Веб-сайт
    email VARCHAR(255),                       -- Email издательства
    phone VARCHAR(20),                        -- Телефон
    address TEXT,                             -- Адрес
    founded_year INTEGER                      -- Год основания
        CHECK (founded_year > 1400 AND founded_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══ AUTHORS (Авторы) ═══
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,         -- Имя автора
    last_name VARCHAR(100) NOT NULL,          -- Фамилия автора
    middle_name VARCHAR(100),                 -- Отчество (опционально)
    birth_date DATE,                          -- Дата рождения
    death_date DATE,                          -- Дата смерти (опционально)
    nationality VARCHAR(100),                 -- Национальность
    biography TEXT,                           -- Биография автора
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT valid_dates CHECK (
        death_date IS NULL OR death_date > birth_date  -- Проверка дат
    )
);

-- ═══ BOOKS (Книги) ═══
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,              -- Название книги
    description TEXT,                         -- Описание книги
    isbn VARCHAR(20) UNIQUE,                  -- ISBN (уникальный, опционально)
    price DECIMAL(10,2) NOT NULL             -- Цена (обязательная)
        CHECK (price >= 0),                  -- Цена не может быть отрицательной
    stock INTEGER NOT NULL DEFAULT 0         -- Количество на складе
        CHECK (stock >= 0),                  -- Склад не может быть отрицательным
    pages INTEGER CHECK (pages > 0),         -- Количество страниц
    language VARCHAR(50) DEFAULT 'ru',       -- Язык книги
    publication_year INTEGER                 -- Год издания
        CHECK (publication_year > 1400 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE)),
    edition VARCHAR(100),                     -- Издание (например, "2-е издание")
    weight DECIMAL(8,3),                      -- Вес книги в кг
    popularity INTEGER DEFAULT 0,            -- Популярность (счетчик продаж)
    category_id INTEGER REFERENCES categories(id) -- FK к категории
        ON DELETE RESTRICT NOT NULL,          -- Нельзя удалить категорию с книгами
    publisher_id INTEGER REFERENCES publishers(id) -- FK к издательству
        ON DELETE RESTRICT NOT NULL,          -- Нельзя удалить издательство с книгами
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ═══ BOOK_AUTHORS (Связь книг и авторов) ═══
CREATE TABLE book_authors (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id)     -- FK к книге
        ON DELETE CASCADE NOT NULL,           -- При удалении книги → удалить связь
    author_id INTEGER REFERENCES authors(id) -- FK к автору
        ON DELETE CASCADE NOT NULL,           -- При удалении автора → удалить связь
    role VARCHAR(50) DEFAULT 'author'        -- Роль: author|co-author|translator|editor
        CHECK (role IN ('author', 'co-author', 'translator', 'editor')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, author_id, role)          -- Уникальная комбинация
);

-- ═══ ORDERS (Заказы) ═══
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)     -- FK к пользователю
        ON DELETE CASCADE NOT NULL,           -- При удалении пользователя → удалить заказы
    order_number VARCHAR(50) UNIQUE NOT NULL, -- Номер заказа (уникальный)
    total_amount DECIMAL(12,2) NOT NULL      -- Общая сумма заказа
        CHECK (total_amount > 0),             -- Сумма должна быть положительной
    status VARCHAR(20) DEFAULT 'pending'     -- Статус заказа
        CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,                    -- Дата отправки
    delivered_at TIMESTAMP                   -- Дата доставки
);

-- ═══ ORDER_ITEMS (Позиции заказов) ═══
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id)   -- FK к заказу
        ON DELETE CASCADE NOT NULL,           -- При удалении заказа → удалить позиции
    book_id INTEGER REFERENCES books(id)     -- FK к книге
        ON DELETE RESTRICT NOT NULL,          -- Нельзя удалить книгу с заказами
    quantity INTEGER NOT NULL                -- Количество книг
        CHECK (quantity > 0),                 -- Количество должно быть положительным
    price_per_item DECIMAL(10,2) NOT NULL   -- Цена за единицу
        CHECK (price_per_item >= 0),          -- Цена не может быть отрицательной
    total_price DECIMAL(12,2) NOT NULL       -- Общая стоимость позиции
        CHECK (total_price >= 0),             -- Стоимость не может быть отрицательной
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, book_id)                 -- Одна книга в заказе (можно изменить quantity)
);

-- ═══ REVIEWS (Отзывы) ═══
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)     -- FK к пользователю
        ON DELETE CASCADE NOT NULL,           -- При удалении пользователя → удалить отзывы
    book_id INTEGER REFERENCES books(id)     -- FK к книге
        ON DELETE CASCADE NOT NULL,           -- При удалении книги → удалить отзывы
    rating INTEGER NOT NULL                  -- Рейтинг от 1 до 5
        CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),                       -- Заголовок отзыва
    comment TEXT,                             -- Текст отзыва
    is_verified_purchase BOOLEAN DEFAULT false, -- Подтвержденная покупка
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                  -- Один отзыв от пользователя на книгу
);

-- ═══ CART_ITEMS (Корзина покупок) ═══
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)     -- FK к пользователю
        ON DELETE CASCADE NOT NULL,           -- При удалении пользователя → очистить корзину
    book_id INTEGER REFERENCES books(id)     -- FK к книге
        ON DELETE CASCADE NOT NULL,           -- При удалении книги → удалить из корзины
    quantity INTEGER DEFAULT 1               -- Количество в корзине
        CHECK (quantity > 0),                 -- Количество должно быть положительным
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                  -- Уникальная позиция в корзине пользователя
);

-- ═══ WISHLIST (Список желаний) ═══
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id)     -- FK к пользователю
        ON DELETE CASCADE NOT NULL,           -- При удалении пользователя → очистить список
    book_id INTEGER REFERENCES books(id)     -- FK к книге
        ON DELETE CASCADE NOT NULL,           -- При удалении книги → удалить из списка
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                  -- Уникальная позиция в списке пользователя
);
```

### 🔑 **Ключевые особенности схемы:**

1. **Каскадные операции (CASCADE)** - автоматическое удаление связанных записей:

   - При удалении пользователя → удаляются его заказы, отзывы, корзина, список желаний
   - При удалении заказа → удаляются все его позиции
   - При удалении книги → удаляются связи с авторами, отзывы, позиции корзины/списка

2. **Ограничительные операции (RESTRICT)** - защита от случайного удаления:

   - Нельзя удалить категорию, если есть книги в этой категории
   - Нельзя удалить издательство, если есть его книги
   - Нельзя удалить книгу, если есть заказы с этой книгой

3. **Проверочные ограничения (CHECK)** - валидация данных:

   - Цены и количество не могут быть отрицательными
   - Рейтинги от 1 до 5 звезд
   - Годы издания в разумных пределах
   - Роли пользователей из ограниченного списка

4. **Уникальные ограничения (UNIQUE)** - предотвращение дублирования:
   - Один email на пользователя
   - Один ISBN на книгу
   - Один отзыв от пользователя на книгу
   - Одна позиция в корзине/списке желаний

### Новая стратегия: Полная нормализация (10 таблиц)

Отказались от ограничения в 2 таблицы и создали **полноценную нормализованную схему**:

#### **Основные таблицы (5 штук):**

1. **users** - пользователи с ролями (customer, admin, manager)
2. **categories** - категории книг с поддержкой иерархии
3. **publishers** - издательства с контактной информацией
4. **authors** - авторы с биографией и датами жизни
5. **books** - книги с ISBN, связями с категориями и издательствами

#### **Бизнес-логика (5 таблиц):**

6. **book_authors** - связь книг и авторов (many-to-many)
7. **orders** - заказы пользователей со статусами
8. **order_items** - позиции заказов с количеством и ценами
9. **reviews** - отзывы пользователей на книги (1-5 звезд)
10. **cart_items** - корзина покупок пользователей
11. **wishlist** - список желаний пользователей

## 🗄️ Схема нормализованной базы данных

### Таблица 1: Users (Пользователи)

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    role ENUM('customer', 'admin', 'manager') DEFAULT 'customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 2: Categories (Категории)

```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,           -- "Фантастика", "Романтика"
    slug VARCHAR(100) UNIQUE NOT NULL,           -- "fantasy", "romance"
    description TEXT,
    parent_id INTEGER REFERENCES categories(id), -- Для иерархии категорий
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 3: Publishers (Издательства)

```sql
CREATE TABLE publishers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    website VARCHAR(500),
    contact_email VARCHAR(255),
    founded_year INTEGER,
    country VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 4: Authors (Авторы)

```sql
CREATE TABLE authors (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    biography TEXT,
    birth_date DATE,
    death_date DATE,
    nationality VARCHAR(100),
    website VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 5: Books (Книги)

```sql
CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    isbn VARCHAR(20) UNIQUE,                     -- Международный стандартный номер
    publisher_id INTEGER REFERENCES publishers(id),
    category_id INTEGER REFERENCES categories(id) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    stock INTEGER DEFAULT 0,                     -- Количество на складе
    description TEXT,
    short_description TEXT,
    image VARCHAR(255),
    pages INTEGER,
    publication_year INTEGER,
    popularity INTEGER DEFAULT 0,               -- Счетчик покупок
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Таблица 6: Book_Authors (Связь книг и авторов)

```sql
CREATE TABLE book_authors (
    id SERIAL PRIMARY KEY,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
    author_id INTEGER REFERENCES authors(id) ON DELETE CASCADE,
    role ENUM('main_author', 'co_author', 'translator', 'editor') DEFAULT 'main_author',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(book_id, author_id, role)            -- Уникальная связь
);
```

### Таблица 7: Orders (Заказы)

```sql
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE RESTRICT NOT NULL,
    order_number VARCHAR(50) UNIQUE NOT NULL,
    status ENUM('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
    total_amount DECIMAL(10,2) NOT NULL,
    shipping_address TEXT,
    payment_method ENUM('cash', 'card', 'bank_transfer', 'online') DEFAULT 'cash',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP
);
```

### Таблица 8: Order_Items (Позиции заказов)

```sql
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    book_id INTEGER REFERENCES books(id) ON DELETE RESTRICT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price_per_item DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(order_id, book_id)                   -- Один товар в заказе
);
```

### Таблица 9: Reviews (Отзывы)

```sql
CREATE TABLE reviews (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(255),
    comment TEXT,
    is_verified_purchase BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                    -- Один отзыв от пользователя на книгу
);
```

### Таблица 10: Cart_Items (Корзина)

```sql
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                    -- Уникальная позиция в корзине
);
```

### Таблица 11: Wishlist (Список желаний)

```sql
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    book_id INTEGER REFERENCES books(id) ON DELETE CASCADE NOT NULL,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, book_id)                    -- Уникальная позиция в списке
);
```

## 📊 Преимущества нормализованной схемы

### 1. **Нормализация данных**

- ✅ Устранение дублирования информации об авторах/издательствах
- ✅ Правильные foreign key связи обеспечивают целостность
- ✅ Каскадные операции для автоматической очистки связанных данных
- ✅ Нормальные формы (1NF, 2NF, 3NF) соблюдены

### 2. **Гибкость и масштабируемость**

- 🚀 Легко добавлять новых авторов, издательства, категории
- 🔄 Простое изменение связей (книга ↔ автор, книга ↔ категория)
- � Каждая таблица может расти независимо
- 🏗️ Возможность горизонтального шардирования

### 3. **Богатая бизнес-функциональность**

- 📋 **Корзина покупок** - сохраняется между сессиями
- 📝 **Система заказов** - со статусами и детализацией
- ⭐ **Отзывы и рейтинги** - повышение доверия клиентов
- 💝 **Список желаний** - улучшение пользовательского опыта
- 👥 **Роли пользователей** - admin, manager, customer

### 4. **Производительность и аналитика**

- � Богатые возможности для SQL аналитики и отчетов
- 🔍 Оптимальные индексы для всех частых запросов
- ⚡ Быстрые JOIN операции между связанными таблицами
- 📈 Легкое получение статистики продаж, популярности, рейтингов

## 🔗 Связи между таблицами

### **One-to-Many (1:N) связи:**

```sql
categories → books          -- Одна категория → много книг
publishers → books          -- Одно издательство → много книг
users → orders             -- Один пользователь → много заказов
orders → order_items       -- Один заказ → много позиций
users → reviews            -- Один пользователь → много отзывов
books → reviews            -- Одна книга → много отзывов
users → cart_items         -- Один пользователь → много позиций в корзине
users → wishlist           -- Один пользователь → много позиций в списке желаний
```

### **Many-to-Many (N:M) связи:**

```sql
books ↔ authors            -- Через таблицу book_authors
                          -- (книга может иметь несколько авторов,
                          --  автор может написать несколько книг)
```

### **Self-Reference связи:**

```sql
categories → categories    -- parent_id для иерархии категорий
                          -- (Художественная литература → Романтика)
```

## 🎯 Решение бизнес-задач

### **Управление каталогом:**

```sql
-- Получить все книги категории с подкатегориями
WITH RECURSIVE category_tree AS (
  SELECT id, name, parent_id FROM categories WHERE slug = 'fiction'
  UNION ALL
  SELECT c.id, c.name, c.parent_id
  FROM categories c
  JOIN category_tree ct ON c.parent_id = ct.id
)
SELECT b.title, b.price, a.first_name, a.last_name
FROM books b
JOIN book_authors ba ON b.id = ba.book_id
JOIN authors a ON ba.author_id = a.id
WHERE b.category_id IN (SELECT id FROM category_tree);
```

### **Система заказов:**

```sql
-- Создание заказа с проверкой склада
BEGIN;
-- 1. Создаем заказ
INSERT INTO orders (user_id, order_number, total_amount)
VALUES (1, 'ORD-2024-001', 1500.00);

-- 2. Добавляем позиции и уменьшаем склад
INSERT INTO order_items (order_id, book_id, quantity, price_per_item, total_price)
SELECT 1, 5, 2, 750.00, 1500.00
WHERE (SELECT stock FROM books WHERE id = 5) >= 2;

UPDATE books SET stock = stock - 2, popularity = popularity + 2 WHERE id = 5;
COMMIT;
```

### **Аналитика и отчеты:**

```sql
-- Топ авторов по продажам
SELECT
    a.first_name, a.last_name,
    SUM(oi.quantity) as total_sold,
    SUM(oi.total_price) as total_revenue
FROM authors a
JOIN book_authors ba ON a.id = ba.author_id
JOIN books b ON ba.book_id = b.id
JOIN order_items oi ON b.id = oi.book_id
GROUP BY a.id, a.first_name, a.last_name
ORDER BY total_revenue DESC;

-- Средний рейтинг книг по категориям
SELECT
    c.name as category,
    AVG(r.rating) as avg_rating,
    COUNT(r.id) as reviews_count
FROM categories c
JOIN books b ON c.id = b.category_id
LEFT JOIN reviews r ON b.id = r.book_id
GROUP BY c.id, c.name
ORDER BY avg_rating DESC;
```

## 📈 Индексы для производительности

### **Основные индексы (созданы автоматически в миграциях):**

```sql
-- === USERS ===
CREATE UNIQUE INDEX users_email_unique_idx ON users(email);
CREATE INDEX users_role_idx ON users(role);
CREATE INDEX users_created_at_idx ON users(created_at);

-- === CATEGORIES ===
CREATE UNIQUE INDEX categories_name_unique_idx ON categories(name);
CREATE UNIQUE INDEX categories_slug_unique_idx ON categories(slug);
CREATE INDEX categories_parent_id_idx ON categories(parent_id);
CREATE INDEX categories_active_sort_idx ON categories(is_active, sort_order);

-- === PUBLISHERS ===
CREATE UNIQUE INDEX publishers_name_unique_idx ON publishers(name);
CREATE INDEX publishers_country_idx ON publishers(country);

-- === AUTHORS ===
CREATE INDEX authors_fullname_idx ON authors(last_name, first_name);
CREATE INDEX authors_nationality_idx ON authors(nationality);
CREATE INDEX authors_birth_date_idx ON authors(birth_date);

-- === BOOKS ===
CREATE UNIQUE INDEX books_isbn_unique_idx ON books(isbn) WHERE isbn IS NOT NULL;
CREATE INDEX books_title_idx ON books(title);
CREATE INDEX books_category_id_idx ON books(category_id);
CREATE INDEX books_publisher_id_idx ON books(publisher_id);
CREATE INDEX books_stock_idx ON books(stock);
CREATE INDEX books_popularity_idx ON books(popularity);
CREATE INDEX books_price_idx ON books(price);
CREATE INDEX books_publication_year_idx ON books(publication_year);
CREATE INDEX books_category_stock_idx ON books(category_id, stock); -- Составной

-- === BOOK_AUTHORS ===
CREATE UNIQUE INDEX book_authors_unique_idx ON book_authors(book_id, author_id, role);
CREATE INDEX book_authors_book_id_idx ON book_authors(book_id);
CREATE INDEX book_authors_author_id_idx ON book_authors(author_id);

-- === ORDERS ===
CREATE UNIQUE INDEX orders_order_number_unique_idx ON orders(order_number);
CREATE INDEX orders_user_id_idx ON orders(user_id);
CREATE INDEX orders_status_idx ON orders(status);
CREATE INDEX orders_created_at_idx ON orders(created_at);
CREATE INDEX orders_user_status_idx ON orders(user_id, status); -- Составной

-- === ORDER_ITEMS ===
CREATE INDEX order_items_order_id_idx ON order_items(order_id);
CREATE INDEX order_items_book_id_idx ON order_items(book_id);
CREATE INDEX order_items_book_quantity_idx ON order_items(book_id, quantity);
CREATE UNIQUE INDEX order_items_order_book_unique_idx ON order_items(order_id, book_id);

-- === REVIEWS ===
CREATE INDEX reviews_book_id_idx ON reviews(book_id);
CREATE INDEX reviews_user_id_idx ON reviews(user_id);
CREATE INDEX reviews_rating_idx ON reviews(rating);
CREATE INDEX reviews_book_rating_idx ON reviews(book_id, rating); -- Составной
CREATE INDEX reviews_verified_purchase_idx ON reviews(is_verified_purchase);
CREATE UNIQUE INDEX reviews_user_book_unique_idx ON reviews(user_id, book_id);

-- === CART_ITEMS ===
CREATE INDEX cart_items_user_id_idx ON cart_items(user_id);
CREATE INDEX cart_items_book_id_idx ON cart_items(book_id);
CREATE INDEX cart_items_added_at_idx ON cart_items(added_at);
CREATE UNIQUE INDEX cart_items_user_book_unique_idx ON cart_items(user_id, book_id);

-- === WISHLIST ===
CREATE INDEX wishlist_user_id_idx ON wishlist(user_id);
CREATE INDEX wishlist_book_id_idx ON wishlist(book_id);
CREATE INDEX wishlist_added_at_idx ON wishlist(added_at);
CREATE UNIQUE INDEX wishlist_user_book_unique_idx ON wishlist(user_id, book_id);
```

## 🛡️ Обработка Race Conditions и безопасность

### **Транзакционная покупка с блокировками:**

```sql
BEGIN;

-- 1. Блокируем книгу для обновления (защита от race conditions)
SELECT id, stock, price
FROM books
WHERE id = $book_id
FOR UPDATE;

-- 2. Проверяем наличие достаточного количества
IF stock >= $quantity THEN
  -- 3. Создаем заказ
  INSERT INTO orders (user_id, order_number, total_amount, status)
  VALUES ($user_id, generate_order_number(), $total, 'pending')
  RETURNING id INTO $order_id;

  -- 4. Добавляем позицию заказа
  INSERT INTO order_items (order_id, book_id, quantity, price_per_item, total_price)
  VALUES ($order_id, $book_id, $quantity, $price, $total);

  -- 5. Уменьшаем склад и увеличиваем популярность
  UPDATE books
  SET stock = stock - $quantity,
      popularity = popularity + $quantity,
      updated_at = CURRENT_TIMESTAMP
  WHERE id = $book_id;

  COMMIT;
ELSE
  ROLLBACK;
  RAISE EXCEPTION 'Недостаточно товара на складе';
END IF;
```

### **Проверка целостности данных:**

```sql
-- Проверка, что все заказы имеют позиции
SELECT o.id, o.order_number
FROM orders o
LEFT JOIN order_items oi ON o.id = oi.order_id
WHERE oi.id IS NULL;

-- Проверка соответствия сумм в заказе
SELECT
    o.id,
    o.total_amount as order_total,
    SUM(oi.total_price) as items_total
FROM orders o
JOIN order_items oi ON o.id = oi.order_id
GROUP BY o.id, o.total_amount
HAVING o.total_amount != SUM(oi.total_price);
```

## 📝 Созданные файлы

### **Миграции (11 файлов):**

- ✅ `20241014120001-create-users.js` - Пользователи с ролями
- ✅ `20241014120002-create-categories.js` - Категории с иерархией
- ✅ `20241014120003-create-publishers.js` - Издательства
- ✅ `20241014120004-create-authors.js` - Авторы с биографией
- ✅ `20241014120005-create-books.js` - Книги с FK связями
- ✅ `20241014120006-create-book-authors.js` - Связь книг и авторов
- ✅ `20241014120007-create-orders.js` - Заказы со статусами
- ✅ `20241014120008-create-order-items.js` - Позиции заказов
- ✅ `20241014120009-create-reviews.js` - Отзывы и рейтинги
- ✅ `20241014120010-create-cart-items.js` - Корзина покупок
- ✅ `20241014120011-create-wishlist.js` - Список желаний

### **Сидеры (1 файл):**

- ✅ `20241014120001-demo-data.js` - Полные тестовые данные для всех таблиц

### **Тестовые данные включают:**

```javascript
// Основные справочники:
5 категорий     → включая иерархию (Художественная → Романтика, Драма, Фантастика)
3 издательства  → АСТ, Эксмо, Азбука-Аттикус
6 авторов       → русские и зарубежные классики

// Каталог книг:
6 книг          → с полной информацией (ISBN, описания, цены, склад)
6 связей        → книга ↔ автор

// Пользователи и активность:
3 пользователя  → admin, manager, customer
2 заказа        → с разными статусами (delivered, processing)
3 позиции       → детализация заказов
2 отзыва        → с рейтингами 5 звезд
2 позиции       → в корзине пользователя
1 позиция       → в списке желаний (книга не в наличии)
```

## �🚀 Следующие шаги

1. ✅ **Нормализованная схема БД спроектирована** (10 таблиц)
2. ✅ **11 миграций созданы** с правильным порядком выполнения
3. ✅ **Сидер с полными тестовыми данными** подготовлен
4. ⏳ **Запуск миграций** (создание всех таблиц в БД)
5. ⏳ **Заполнение тестовыми данными** (выполнение сидера)
6. ⏳ **Создание новых Sequelize моделей** (для всех 10 таблиц)
7. ⏳ **Настройка ассоциаций** между моделями

## 💡 Ключевые преимущества новой архитектуры

### 🎯 **По сравнению с 2-табличной схемой:**

| Аспект                 | 2 таблицы (старое)                  | 10 таблиц (новое)               |
| ---------------------- | ----------------------------------- | ------------------------------- |
| **Нормализация**       | ❌ Дублирование авторов/издательств | ✅ Полная нормализация          |
| **Целостность**        | ⚠️ JSONB без контроля               | ✅ Foreign Key ограничения      |
| **Производительность** | ⚠️ GIN индексы по JSONB             | ✅ Обычные B-tree индексы       |
| **Гибкость**           | ❌ Сложно изменять структуру JSON   | ✅ Легко добавлять поля/таблицы |
| **Аналитика**          | ❌ Сложные JSON запросы             | ✅ Простые SQL JOIN             |
| **Масштабирование**    | ❌ Монолитные таблицы               | ✅ Независимое масштабирование  |
| **Функциональность**   | ⚠️ Ограниченная                     | ✅ Полный интернет-магазин      |

### ⚡ **Новые возможности:**

- ✅ **Корзина покупок** - сохраняется между сессиями
- ✅ **Система заказов** - полный workflow от создания до доставки
- ✅ **Отзывы и рейтинги** - увеличение доверия клиентов
- ✅ **Список желаний** - улучшение UX
- ✅ **Управление ролями** - admin, manager, customer
- ✅ **Иерархия категорий** - организация каталога
- ✅ **Управление авторами** - биографии, даты жизни
- ✅ **Информация об издательствах** - контакты, страна

**Переход к Шагу 3: Создание и запуск миграций БД** ➡️
