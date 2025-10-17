# 🚀 Шаг 1: Инициализация проекта и создание базы данных

## 📋 Обзор

На этом шаге мы создадим основу для нашего книжного интернет-магазина с использованием Node.js, Express, PostgreSQL и Sequelize ORM. Это первый этап разработки, где мы настроим проект, установим необходимые зависимости и создадим структуру базы данных.

## 🎯 Цели шага

1. Инициализировать Node.js проект
2. Установить все необходимые зависимости
3. Создать структуру папок проекта
4. Настроить Sequelize для работы с PostgreSQL
5. Создать миграции для всех таблиц БД
6. Создать Sequelize модели
7. Настроить базовый Express сервер

## 📚 Теоретическая часть

### Что такое Sequelize?

**Sequelize** — это современный ORM (Object-Relational Mapping) для Node.js. Он позволяет работать с базами данных используя JavaScript объекты вместо написания SQL запросов.

**Преимущества:**
- Автоматическая защита от SQL-инъекций
- Простая работа с отношениями между таблицами
- Поддержка миграций для версионирования БД
- Единый интерфейс для разных СУБД (PostgreSQL, MySQL, SQLite)

### Структура базы данных

Наша база данных будет состоять из 6 таблиц:

1. **users** — пользователи системы
2. **categories** — категории книг (жанры)
3. **authors** — авторы книг
4. **books** — книги
5. **book_authors** — связь книг и авторов (многие-ко-многим)
6. **cart** — корзина покупок

### Отношения между таблицами:

```
users (1) ←→ (M) cart (M) ←→ (1) books
                              ↓
                          categoryId
                              ↓
                          categories (1)
                              
books (M) ←→ (M) book_authors (M) ←→ (M) authors
```

## 💻 Практическая часть

### 1. Создание структуры проекта

#### 1.1 Создайте папку проекта

```bash
mkdir "lab_2_sequelize 1-3-1"
cd "lab_2_sequelize 1-3-1"
```

**Что делает:** Создает новую директорию для проекта и переходит в нее.

#### 1.2 Инициализируйте npm проект

```bash
npm init -y
```

**Что делает:** Создает файл `package.json` с базовыми настройками проекта. Флаг `-y` автоматически принимает все значения по умолчанию.

**Результат:** Будет создан файл `package.json` — манифест вашего проекта, который содержит информацию о зависимостях и скриптах.

### 2. Установка зависимостей

#### 2.1 Установите production зависимости

```bash
npm install express sequelize pg pg-hstore bcrypt jsonwebtoken joi cors helmet express-rate-limit dotenv
```

**Описание каждого пакета:**

- **express** — веб-фреймворк для создания сервера
- **sequelize** — ORM для работы с базой данных
- **pg** — драйвер PostgreSQL для Node.js
- **pg-hstore** — поддержка специального типа данных PostgreSQL
- **bcrypt** — библиотека для безопасного хеширования паролей
- **jsonwebtoken** — создание и проверка JWT токенов для аутентификации
- **joi** — валидация входящих данных
- **cors** — настройка Cross-Origin Resource Sharing
- **helmet** — повышение безопасности через HTTP заголовки
- **express-rate-limit** — защита от DDoS атак
- **dotenv** — загрузка переменных окружения из .env файла

**Время выполнения:** 30-60 секунд

#### 2.2 Установите development зависимости

```bash
npm install --save-dev nodemon sequelize-cli
```

**Описание:**

- **nodemon** — автоматический перезапуск сервера при изменении файлов
- **sequelize-cli** — утилита командной строки для работы с Sequelize (создание миграций, моделей, заполнение БД)

**Время выполнения:** 15-30 секунд

### 3. Создание структуры папок

```bash
mkdir src
mkdir src/controllers
mkdir src/models
mkdir src/routes
mkdir src/middleware
mkdir src/config
mkdir src/validators
mkdir public
```

**Описание папок:**

- **src/** — исходный код сервера
  - **controllers/** — бизнес-логика (обработка запросов)
  - **models/** — будущие модели (не путать с Sequelize models)
  - **routes/** — определение маршрутов API
  - **middleware/** — промежуточные обработчики (аутентификация, валидация)
  - **config/** — файлы конфигурации
  - **validators/** — схемы валидации данных
- **public/** — статические файлы (HTML, CSS, JS, изображения)

### 4. Копирование статических файлов

Скопируйте статические файлы из lab_1_3:

**Windows (PowerShell):**
```powershell
xcopy "..\lab_1_3\html" "public\html" /E /I
xcopy "..\lab_1_3\style" "public\style" /E /I
xcopy "..\lab_1_3\scripts" "public\scripts" /E /I
xcopy "..\lab_1_3\img" "public\img" /E /I
copy "..\lab_1_3\index.html" "public\"
xcopy "..\lab_1_3\data" "public\data" /E /I
```

**Linux/macOS:**
```bash
cp -r ../lab_1_3/html public/
cp -r ../lab_1_3/style public/
cp -r ../lab_1_3/scripts public/
cp -r ../lab_1_3/img public/
cp ../lab_1_3/index.html public/
cp -r ../lab_1_3/data public/
```

**Что делает:** Переносит весь frontend из первой лабораторной работы в папку public.

### 5. Создание .env файла

Создайте файл `.env` в корне проекта:

```env
# Настройки базы данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USER=postgres
DB_PASSWORD=your_password_here

# JWT Secret для аутентификации
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# Порт сервера
PORT=3000

# Окружение (development, production)
NODE_ENV=development
```

**⚠️ Важно:** 
- Замените `your_password_here` на реальный пароль от PostgreSQL
- Замените `JWT_SECRET` на случайную строку (минимум 32 символа)
- Никогда не добавляйте .env в git (он должен быть в .gitignore)

### 6. Создание .gitignore

Создайте файл `.gitignore`:

```
node_modules/
.env
*.log
.DS_Store
```

**Что это делает:** Исключает из git файлы, которые не должны попадать в репозиторий (зависимости, секретные данные, логи).

### 7. Инициализация Sequelize

```bash
npx sequelize-cli init
```

**Что создается:**

- `config/config.json` — конфигурация подключения к БД
- `models/` — папка для моделей Sequelize
- `migrations/` — папка для миграций
- `seeders/` — папка для начальных данных

### 8. Настройка конфигурации PostgreSQL

Откройте файл `config/config.json` и замените содержимое на:

```json
{
  "development": {
    "username": "postgres",
    "password": "your_password_here",
    "database": "bookstore",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  },
  "test": {
    "username": "postgres",
    "password": "your_password_here",
    "database": "bookstore_test",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  },
  "production": {
    "username": "postgres",
    "password": "your_password_here",
    "database": "bookstore_production",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  }
}
```

**⚠️ Важно:** Замените `your_password_here` на реальный пароль от PostgreSQL.

### 9. Обновление package.json

Откройте `package.json` и обновите секцию `scripts`:

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "db:create": "npx sequelize-cli db:create",
    "db:migrate": "npx sequelize-cli db:migrate",
    "db:seed": "npx sequelize-cli db:seed:all",
    "db:migrate:undo": "npx sequelize-cli db:migrate:undo",
    "db:reset": "npx sequelize-cli db:migrate:undo:all && npx sequelize-cli db:migrate && npx sequelize-cli db:seed:all"
  }
}
```

**Описание скриптов:**

- `npm start` — запуск сервера в production режиме
- `npm run dev` — запуск с автоперезагрузкой (для разработки)
- `npm run db:create` — создание базы данных
- `npm run db:migrate` — применение миграций
- `npm run db:seed` — заполнение БД тестовыми данными
- `npm run db:migrate:undo` — откат последней миграции
- `npm run db:reset` — полный сброс и пересоздание БД

### 10. Создание базового сервера

Создайте файл `server.js` в корне проекта:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware безопасности
app.use(helmet({
  contentSecurityPolicy: false, // Отключаем для локальной разработки
}));

// CORS
app.use(cors());

// Парсинг JSON и URL-encoded данных
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Статические файлы
app.use(express.static(path.join(__dirname, 'public')));

// Базовый роут для проверки сервера
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Сервер работает',
    timestamp: new Date().toISOString()
  });
});

// Главная страница
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ error: 'Страница не найдена' });
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Произошла ошибка сервера',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
  console.log(`📝 Окружение: ${process.env.NODE_ENV}`);
});
```

**Описание кода:**

1. **require('dotenv').config()** — загружает переменные из .env
2. **express()** — создает приложение Express
3. **helmet()** — добавляет заголовки безопасности
4. **cors()** — разрешает кросс-доменные запросы
5. **express.json()** — парсит JSON в запросах
6. **express.static()** — отдает статические файлы
7. **/api/health** — endpoint для проверки работы сервера
8. **Обработчики ошибок** — для 404 и 500 ошибок

### 11. Создание миграций

Создайте миграции для всех таблиц:

```bash
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli migration:generate --name create-categories
npx sequelize-cli migration:generate --name create-authors
npx sequelize-cli migration:generate --name create-books
npx sequelize-cli migration:generate --name create-book-authors
npx sequelize-cli migration:generate --name create-cart
```

**Что делает:** Создает файлы миграций в папке `migrations/` с временными метками в названии.

#### 11.1 Миграция users

Откройте `migrations/XXXXXX-create-users.js` и замените содержимое на:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      email: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true
        }
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      firstName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      lastName: {
        type: Sequelize.STRING(50),
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Создаем индексы для оптимизации поиска
    await queryInterface.addIndex('users', ['email']);
    await queryInterface.addIndex('users', ['username']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('users');
  }
};
```

**Поля таблицы users:**

- **id** — первичный ключ, автоинкремент
- **username** — имя пользователя (уникальное)
- **email** — электронная почта (уникальная)
- **password** — хешированный пароль
- **firstName, lastName** — имя и фамилия (необязательные)
- **createdAt, updatedAt** — временные метки

**Индексы:** Созданы на `email` и `username` для быстрого поиска пользователей.

#### 11.2 Миграция categories

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true
      },
      slug: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: 'URL-friendly название (например: fantastika, drama)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('categories', ['slug']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('categories');
  }
};
```

**Поля таблицы categories:**

- **id** — первичный ключ
- **name** — название категории (например: "Фантастика")
- **slug** — URL-friendly название (например: "fantastika")
- **description** — описание категории

#### 11.3 Миграция authors

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('authors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      bio: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Биография автора'
      },
      authorType: {
        type: Sequelize.ENUM('russian', 'foreign'),
        allowNull: false,
        defaultValue: 'russian',
        comment: 'Тип автора: российский или зарубежный'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('authors', ['name']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('authors');
  }
};
```

**Поля таблицы authors:**

- **id** — первичный ключ
- **name** — имя автора
- **bio** — биография
- **authorType** — тип автора (ENUM: 'russian' или 'foreign')

#### 11.4 Миграция books

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('books', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      categoryId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'categories',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0
        }
      },
      priceCategory: {
        type: Sequelize.ENUM('low', 'medium', 'high'),
        allowNull: false,
        defaultValue: 'medium',
        comment: 'Ценовая категория для фильтрации'
      },
      image: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Путь к изображению обложки'
      },
      shortDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      fullDescription: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      stock: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Количество на складе'
      },
      popularity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Счетчик популярности (количество покупок)'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('books', ['categoryId']);
    await queryInterface.addIndex('books', ['priceCategory']);
    await queryInterface.addIndex('books', ['popularity']);
    await queryInterface.addIndex('books', ['stock']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('books');
  }
};
```

**Поля таблицы books:**

- **id** — первичный ключ
- **title** — название книги
- **categoryId** — внешний ключ на categories
- **price** — цена (DECIMAL для точности)
- **priceCategory** — категория цены (low/medium/high)
- **image** — путь к обложке
- **shortDescription** — краткое описание
- **fullDescription** — полное описание
- **stock** — количество на складе
- **popularity** — счетчик покупок

**Внешний ключ:**
- `categoryId` ссылается на `categories.id`
- `CASCADE` при UPDATE — обновляет связанные записи
- `RESTRICT` при DELETE — запрещает удаление категории с книгами

#### 11.5 Миграция book_authors

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('book_authors', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      authorId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'authors',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('book_authors', ['bookId', 'authorId'], {
      unique: true,
      name: 'unique_book_author'
    });

    await queryInterface.addIndex('book_authors', ['bookId']);
    await queryInterface.addIndex('book_authors', ['authorId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('book_authors');
  }
};
```

**Поля таблицы book_authors:**

- **id** — первичный ключ
- **bookId** — внешний ключ на books
- **authorId** — внешний ключ на authors

**Уникальный индекс:** Пара (bookId, authorId) должна быть уникальной — одна и та же связь книга-автор не может повторяться.

**Зачем эта таблица?** Реализует отношение многие-ко-многим: у книги может быть несколько авторов, и автор может написать несколько книг.

#### 11.6 Миграция cart

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('cart', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      bookId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'books',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
          min: 1
        }
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('cart', ['userId', 'bookId'], {
      unique: true,
      name: 'unique_user_book_in_cart'
    });

    await queryInterface.addIndex('cart', ['userId']);
    await queryInterface.addIndex('cart', ['bookId']);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('cart');
  }
};
```

**Поля таблицы cart:**

- **id** — первичный ключ
- **userId** — внешний ключ на users
- **bookId** — внешний ключ на books
- **quantity** — количество единиц товара

**Уникальный индекс:** У одного пользователя не может быть дублирующихся записей одной книги в корзине.

### 12. Создание Sequelize моделей

Теперь создадим модели, которые будут использоваться в коде для работы с БД.

#### 12.1 Модель User (models/User.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Метод для проверки пароля
     */
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password);
    }

    static associate(models) {
      User.hasMany(models.Cart, {
        foreignKey: 'userId',
        as: 'cartItems'
      });
    }
  }

  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true,
        len: [6, 255]
      }
    },
    firstName: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    lastName: {
      type: DataTypes.STRING(50),
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Хэшируем пароль перед сохранением
      beforeCreate: async (user) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      }
    }
  });

  return User;
};
```

**Особенности модели User:**

- **checkPassword()** — метод для проверки пароля
- **hooks** — автоматическое хеширование пароля при создании/обновлении
- **validate** — валидация на уровне модели (длина, формат email)

#### 12.2 Модель Category (models/Category.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Category extends Model {
    static associate(models) {
      Category.hasMany(models.Book, {
        foreignKey: 'categoryId',
        as: 'books'
      });
    }
  }

  Category.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        isLowercase: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Category',
    tableName: 'categories',
    timestamps: true
  });

  return Category;
};
```

#### 12.3 Модель Author (models/Author.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Author extends Model {
    static associate(models) {
      Author.belongsToMany(models.Book, {
        through: models.BookAuthor,
        foreignKey: 'authorId',
        otherKey: 'bookId',
        as: 'books'
      });
    }
  }

  Author.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    authorType: {
      type: DataTypes.ENUM('russian', 'foreign'),
      allowNull: false,
      defaultValue: 'russian',
      validate: {
        isIn: [['russian', 'foreign']]
      }
    }
  }, {
    sequelize,
    modelName: 'Author',
    tableName: 'authors',
    timestamps: true
  });

  return Author;
};
```

#### 12.4 Модель Book (models/Book.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Book extends Model {
    static associate(models) {
      Book.belongsTo(models.Category, {
        foreignKey: 'categoryId',
        as: 'category'
      });

      Book.belongsToMany(models.Author, {
        through: models.BookAuthor,
        foreignKey: 'bookId',
        otherKey: 'authorId',
        as: 'authors'
      });

      Book.hasMany(models.Cart, {
        foreignKey: 'bookId',
        as: 'cartItems'
      });
    }
  }

  Book.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    priceCategory: {
      type: DataTypes.ENUM('low', 'medium', 'high'),
      allowNull: false,
      defaultValue: 'medium',
      validate: {
        isIn: [['low', 'medium', 'high']]
      }
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    shortDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fullDescription: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    stock: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    },
    popularity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0
      }
    }
  }, {
    sequelize,
    modelName: 'Book',
    tableName: 'books',
    timestamps: true
  });

  return Book;
};
```

#### 12.5 Модель BookAuthor (models/BookAuthor.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class BookAuthor extends Model {
    static associate(models) {
      BookAuthor.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });

      BookAuthor.belongsTo(models.Author, {
        foreignKey: 'authorId',
        as: 'author'
      });
    }
  }

  BookAuthor.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    authorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'authors',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'BookAuthor',
    tableName: 'book_authors',
    timestamps: true
  });

  return BookAuthor;
};
```

#### 12.6 Модель Cart (models/Cart.js)

```javascript
'use strict';
const { Model, DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  class Cart extends Model {
    static associate(models) {
      Cart.belongsTo(models.User, {
        foreignKey: 'userId',
        as: 'user'
      });

      Cart.belongsTo(models.Book, {
        foreignKey: 'bookId',
        as: 'book'
      });
    }
  }

  Cart.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'books',
        key: 'id'
      }
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
      validate: {
        min: 1
      }
    }
  }, {
    sequelize,
    modelName: 'Cart',
    tableName: 'cart',
    timestamps: true
  });

  return Cart;
};
```

### 13. Тестирование базового сервера

Запустите сервер в режиме разработки:

```bash
npm run dev
```

**Ожидаемый вывод:**

```
🚀 Сервер запущен на http://localhost:3000
📝 Окружение: development
```

Откройте в браузере:

1. **http://localhost:3000** — главная страница (из lab_1_3)
2. **http://localhost:3000/api/health** — должен вернуть JSON:
   ```json
   {
     "status": "OK",
     "message": "Сервер работает",
     "timestamp": "2025-10-17T..."
   }
   ```

## ✅ Проверочный список

Убедитесь, что выполнены все пункты:

- [ ] Создана папка проекта `lab_2_sequelize 1-3-1`
- [ ] Выполнен `npm init -y`
- [ ] Установлены все production зависимости
- [ ] Установлены все dev зависимости
- [ ] Создана структура папок (src/, public/)
- [ ] Скопированы статические файлы из lab_1_3
- [ ] Создан файл .env с настройками
- [ ] Создан файл .gitignore
- [ ] Инициализирован Sequelize (`npx sequelize-cli init`)
- [ ] Обновлен config/config.json для PostgreSQL
- [ ] Обновлены scripts в package.json
- [ ] Создан файл server.js
- [ ] Созданы все 6 миграций
- [ ] Заполнены все миграции кодом
- [ ] Созданы все 6 моделей
- [ ] Сервер успешно запускается
- [ ] Главная страница открывается в браузере
- [ ] Endpoint /api/health возвращает корректный ответ

## 📝 Итоговая структура проекта

```
lab_2_sequelize 1-3-1/
├── config/
│   └── config.json           # Конфигурация БД
├── migrations/               # Миграции
│   ├── XXXXXX-create-users.js
│   ├── XXXXXX-create-categories.js
│   ├── XXXXXX-create-authors.js
│   ├── XXXXXX-create-books.js
│   ├── XXXXXX-create-book-authors.js
│   └── XXXXXX-create-cart.js
├── models/                   # Sequelize модели
│   ├── index.js
│   ├── User.js
│   ├── Category.js
│   ├── Author.js
│   ├── Book.js
│   ├── BookAuthor.js
│   └── Cart.js
├── seeders/                  # Будущие seed файлы
├── src/
│   ├── controllers/          # Контроллеры (будущее)
│   ├── models/              # Бизнес-модели (будущее)
│   ├── routes/              # Маршруты (будущее)
│   ├── middleware/          # Middleware (будущее)
│   ├── config/              # Конфигурация (будущее)
│   └── validators/          # Валидаторы (будущее)
├── public/                   # Статические файлы
│   ├── html/
│   ├── style/
│   ├── scripts/
│   ├── img/
│   ├── data/
│   └── index.html
├── .env                      # Переменные окружения
├── .gitignore               # Игнорируемые файлы
├── package.json             # Зависимости и скрипты
├── server.js               # Точка входа приложения
└── step1.md                # Этот файл
```

## 🎓 Что вы изучили

1. **Инициализацию Node.js проекта** с npm
2. **Установку и настройку зависимостей** для веб-сервера
3. **Создание структуры проекта** по принципу MVC
4. **Работу с переменными окружения** (.env файл)
5. **Основы Sequelize ORM** и миграций
6. **Проектирование реляционной БД** с правильными связями
7. **Создание моделей Sequelize** с валидацией и хуками
8. **Настройку Express сервера** с middleware
9. **Отдачу статических файлов** через Express

## 🚀 Следующий шаг

На следующем шаге мы:

1. Создадим базу данных PostgreSQL
2. Применим миграции (создадим таблицы)
3. Создадим seeder файлы для заполнения БД тестовыми данными
4. Проверим структуру БД

**Переход к [Шагу 2: Создание и заполнение базы данных](step2.md)** ➡️
