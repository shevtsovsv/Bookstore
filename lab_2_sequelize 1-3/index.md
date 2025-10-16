# 🏗️ models/index.js - Подробная документация

## 📋 Обзор

Файл `models/index.js` является центральной точкой инициализации Sequelize ORM в проекте. Он отвечает за подключение к базе данных, регистрацию моделей, настройку ассоциаций и экспорт всех компонентов для использования в приложении.

## 🎯 Основные функции

1. **Инициализация подключения к PostgreSQL**
2. **Регистрация моделей User и Book**
3. **Настройка ассоциаций между моделями**
4. **Экспорт объекта `db` с моделями и утилитами**
5. **Предоставление доступа к Sequelize операторам**

## 🔧 Детальный разбор кода

### 1. Импорт зависимостей

```javascript
"use strict";

const fs = require("fs"); // Работа с файловой системой
const path = require("path"); // Работа с путями файлов
const Sequelize = require("sequelize"); // ORM Sequelize
const process = require("process"); // Переменные окружения
```

**Назначение импортов:**

- `fs` - для чтения файлов (в стандартной версии, у нас не используется)
- `path` - для работы с путями к файлам конфигурации
- `Sequelize` - основная ORM библиотека
- `process` - доступ к переменным окружения (NODE_ENV)

### 2. Определение переменных окружения

```javascript
const basename = path.basename(__filename); // "index.js"
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};
```

**Переменные:**

- `basename` - имя текущего файла ("index.js")
- `env` - среда выполнения (development/test/production)
- `config` - конфигурация БД для текущей среды
- `db` - объект для хранения всех моделей и утилит

### 3. Инициализация Sequelize

```javascript
let sequelize;
if (config.use_env_variable) {
  // Подключение через переменную окружения (production)
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  // Подключение через config.json (development/test)
  sequelize = new Sequelize(
    config.database, // bookstore_dev
    config.username, // bookstore_user
    config.password, // secure_password
    config // { host, port, dialect, logging, etc. }
  );
}
```

**Два способа подключения:**

#### Development/Test режим:

```json
{
  "username": "bookstore_user",
  "password": "secure_password",
  "database": "bookstore_dev",
  "host": "127.0.0.1",
  "port": 5432,
  "dialect": "postgres"
}
```

#### Production режим:

```json
{
  "use_env_variable": "DATABASE_URL"
}
```

В этом случае используется переменная окружения `DATABASE_URL` с полной строкой подключения.

### 4. Регистрация моделей

```javascript
// Подключаем модели напрямую
const User = require("./User")(sequelize);
const Book = require("./Book")(sequelize);

// Добавляем модели в объект db
db.User = User;
db.Book = Book;
```

**Особенности нашей реализации:**

- Модели подключаются **напрямую** (не через автоматическое сканирование папки)
- Каждая модель экспортирует функцию, которая принимает `sequelize` instance
- Модели регистрируются в объекте `db` для централизованного доступа

### 5. Инициализация ассоциаций

```javascript
// Инициализация ассоциаций
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
```

**Как работает:**

1. Перебираем все зарегистрированные модели
2. Проверяем наличие статического метода `associate`
3. Вызываем `associate(db)` для настройки связей

**В нашем проекте:** User и Book имеют пустые методы `associate`, так как связи реализованы через JSONB (требование максимум 2 таблицы).

### 6. Экспорт компонентов

```javascript
// Добавляем sequelize и Sequelize в объект db для экспорта
db.sequelize = sequelize; // Экземпляр подключения
db.Sequelize = Sequelize; // Класс Sequelize

// Экспорт операторов Sequelize для использования в контроллерах
db.Op = Sequelize.Op; // Операторы (Op.gt, Op.like, etc.)

module.exports = db;
```

**Экспортируемый объект `db` содержит:**

- `db.User` - модель пользователей
- `db.Book` - модель книг
- `db.sequelize` - instance подключения к БД
- `db.Sequelize` - класс Sequelize для создания новых типов
- `db.Op` - операторы для запросов

## 🌐 Использование в приложении

### В контроллерах:

```javascript
const { User, Book, Op, sequelize } = require("../models");

// Использование моделей
const users = await User.findAll();
const books = await Book.findAll();

// Использование операторов
const expensiveBooks = await Book.findAll({
  where: {
    price: { [Op.gt]: 1000 },
  },
});

// Использование транзакций
const transaction = await sequelize.transaction();
```

### В роутах Express:

```javascript
const db = require("../models");

app.get("/api/books", async (req, res) => {
  try {
    const books = await db.Book.findAvailable({
      limit: 20,
      offset: 0,
    });
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### В тестах:

```javascript
const { User, Book, sequelize } = require("../models");

beforeEach(async () => {
  await sequelize.sync({ force: true }); // Пересоздать таблицы
});

afterAll(async () => {
  await sequelize.close(); // Закрыть подключение
});
```

## 📊 Операторы Sequelize (db.Op)

### Часто используемые операторы:

```javascript
const { Op } = require("../models");

// Сравнение
{ price: { [Op.gt]: 500 } }          // price > 500
{ price: { [Op.gte]: 500 } }         // price >= 500
{ price: { [Op.lt]: 1000 } }         // price < 1000
{ price: { [Op.lte]: 1000 } }        // price <= 1000
{ stock: { [Op.ne]: 0 } }            // stock != 0

// Диапазон
{ price: { [Op.between]: [500, 1000] } }  // price BETWEEN 500 AND 1000
{ stock: { [Op.in]: [1, 2, 3] } }         // stock IN (1, 2, 3)

// Текстовый поиск
{ title: { [Op.like]: "%принц%" } }       // LIKE '%принц%'
{ title: { [Op.iLike]: "%принц%" } }      // ILIKE '%принц%' (без учета регистра)

// Логические операторы
{
  [Op.and]: [
    { stock: { [Op.gt]: 0 } },
    { price: { [Op.lt]: 1000 } }
  ]
}

{
  [Op.or]: [
    { genre: "фантастика" },
    { genre: "детектив" }
  ]
}

// JSONB операторы (для metadata)
{ metadata: { [Op.contains]: { categories: ["romance"] } } }  // @>
```

## 🔄 Альтернативные реализации

### Стандартная автоматическая регистрация:

```javascript
// Вместо ручной регистрации можно использовать:
fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    db[model.name] = model;
  });
```

**Но мы используем ручную регистрацию для:**

- Лучшего контроля над процессом
- Избежания циклических зависимостей
- Более понятной архитектуры

### Конфигурация через переменные окружения:

```javascript
// .env файл
DATABASE_URL=postgres://user:pass@localhost:5432/dbname
NODE_ENV=production

// В index.js
require('dotenv').config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: process.env.NODE_ENV === 'development' ? console.log : false
});
```

## 🧪 Тестирование подключения

### Проверка работоспособности:

```javascript
async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log("✅ Подключение к PostgreSQL успешно!");

    // Проверка моделей
    console.log("📚 Доступные модели:", Object.keys(db));

    // Проверка операторов
    console.log("🔧 Операторы доступны:", !!db.Op);
  } catch (error) {
    console.error("❌ Ошибка подключения к БД:", error);
  }
}

testConnection();
```

### Синхронизация моделей:

```javascript
// Создание таблиц (только для разработки!)
await sequelize.sync({ force: true }); // Удаляет и пересоздает
await sequelize.sync({ alter: true }); // Изменяет существующие
await sequelize.sync(); // Создает только отсутствующие
```

**⚠️ Внимание:** В production используйте миграции, не `sync()`!

## 📈 Мониторинг и логирование

### Настройка логирования:

```javascript
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    logging: (sql, timing) => {
      if (process.env.NODE_ENV === "development") {
        console.log(`[${timing}ms] ${sql}`);
      }

      // Логирование медленных запросов
      if (timing > 1000) {
        console.warn(`🐌 Slow query (${timing}ms):`, sql);
      }
    },
    benchmark: true, // Включает timing
  }
);
```

### Мониторинг пула соединений:

```javascript
// Настройка пула соединений
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,
    pool: {
      max: 10, // Максимум соединений
      min: 2, // Минимум соединений
      acquire: 30000, // Таймаут получения соединения (30 сек)
      idle: 10000, // Таймаут простоя (10 сек)
    },
  }
);

// Мониторинг
setInterval(() => {
  const pool = sequelize.connectionManager.pool;
  console.log(
    `🏊‍♂️ Pool: ${pool.size} used, ${pool.available} available, ${pool.pending} pending`
  );
}, 60000); // Каждую минуту
```

## 🔒 Безопасность

### Защита подключения:

```javascript
// config/config.json (production)
{
  "production": {
    "use_env_variable": "DATABASE_URL",
    "dialect": "postgres",
    "dialectOptions": {
      "ssl": {
        "require": true,
        "rejectUnauthorized": false
      }
    },
    "logging": false
  }
}
```

### Переменные окружения (.env):

```bash
# .env файл (НЕ добавлять в git!)
NODE_ENV=production
DATABASE_URL=postgres://user:password@host:5432/database
DB_SSL=true
```

## 🚀 Производительность

### Оптимизация подключения:

```javascript
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    ...config,

    // Настройки производительности
    pool: {
      max: 20, // Больше соединений для высокой нагрузки
      min: 5, // Всегда держим минимум соединений
      acquire: 60000,
      idle: 10000,
    },

    // Настройки диалекта PostgreSQL
    dialectOptions: {
      statement_timeout: 30000, // Таймаут запросов
      query_timeout: 30000,
      application_name: "bookstore_app",
    },

    // Отключение логирования в production
    logging: process.env.NODE_ENV === "development" ? console.log : false,

    // Настройки retry
    retry: {
      max: 3,
      backoffBase: 1000,
      backoffExponent: 1.5,
    },
  }
);
```

## 📝 Заключение

Файл `models/index.js` обеспечивает:

✅ **Централизованное управление моделями** - единая точка доступа  
✅ **Гибкую конфигурацию** - поддержка разных сред (dev/test/prod)  
✅ **Безопасное подключение** - защита через переменные окружения  
✅ **Производительность** - настройка пула соединений и таймаутов  
✅ **Удобство использования** - экспорт моделей и операторов  
✅ **Масштабируемость** - легкое добавление новых моделей

Этот файл является фундаментом всей работы с базой данных в приложении и обеспечивает надежную архитектуру для интернет-магазина книг.
