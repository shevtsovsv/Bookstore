# 🗄️ Шаг 2: Создание и заполнение базы данных

## 📋 Обзор

На этом шаге мы создадим базу данных PostgreSQL, применим миграции для создания таблиц и заполним БД тестовыми данными из первой лабораторной работы.

## 🎯 Цели шага

1. Установить и настроить PostgreSQL
2. Создать базу данных `bookstore`
3. Применить миграции (создать таблицы)
4. Создать seeder файлы с тестовыми данными
5. Заполнить БД начальными данными
6. Проверить структуру БД

## 📚 Теоретическая часть

### Что такое миграции?

**Миграции** — это версионирование схемы базы данных. Каждая миграция описывает изменения в структуре БД (создание таблиц, добавление колонок, изменение типов и т.д.).

**Преимущества:**
- История всех изменений БД
- Возможность откатить изменения (rollback)
- Синхронизация БД между разработчиками
- Автоматическое применение изменений при деплое

### Что такое seeders?

**Seeders** — это файлы для заполнения базы данных начальными или тестовыми данными.

**Применение:**
- Заполнение справочников (категории, роли)
- Создание тестовых данных для разработки
- Демонстрационные данные для презентации

### Порядок выполнения

1. **Создание БД** → 2. **Миграции** → 3. **Seeders**

Важно: Seeders применяются ПОСЛЕ миграций, так как требуют существующие таблицы.

## 💻 Практическая часть

### 1. Установка PostgreSQL

#### Windows

1. Скачайте установщик с [официального сайта PostgreSQL](https://www.postgresql.org/download/windows/)
2. Запустите установщик
3. Выберите компоненты (PostgreSQL Server, pgAdmin 4, Command Line Tools)
4. Установите пароль для пользователя `postgres` (запомните его!)
5. Порт оставьте по умолчанию: `5432`
6. Завершите установку

**Проверка установки:**

```bash
psql --version
```

Должно вывести версию PostgreSQL (например: `psql (PostgreSQL) 16.0`)

#### macOS

Используйте Homebrew:

```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

### 2. Создание пользователя и базы данных

#### Вариант 1: Через psql (командная строка)

**Windows:**

```bash
psql -U postgres
```

**Linux/macOS:**

```bash
sudo -u postgres psql
```

**В psql выполните:**

```sql
-- Создание пользователя (если нужен отдельный пользователь)
CREATE USER bookstore_user WITH PASSWORD 'secure_password';

-- Создание базы данных
CREATE DATABASE bookstore OWNER postgres;

-- Предоставление прав пользователю (опционально)
GRANT ALL PRIVILEGES ON DATABASE bookstore TO bookstore_user;

-- Выход
\q
```

#### Вариант 2: Через Sequelize CLI (рекомендуется)

Убедитесь, что в `config/config.json` указаны правильные данные:

```json
{
  "development": {
    "username": "postgres",
    "password": "ваш_пароль",
    "database": "bookstore",
    "host": "localhost",
    "port": 5432,
    "dialect": "postgres"
  }
}
```

**⚠️ Важно:** Замените `ваш_пароль` на реальный пароль PostgreSQL!

Создайте БД командой:

```bash
npm run db:create
```

**Ожидаемый вывод:**

```
Sequelize CLI [Node: 20.19.5, CLI: 6.6.3, ORM: 6.37.7]

Loaded configuration file "config/config.json".
Using environment "development".
Database bookstore created.
```

**Что делает:** Создает базу данных `bookstore` с указанными параметрами из конфигурации.

### 3. Применение миграций

Теперь создадим таблицы в базе данных:

```bash
npm run db:migrate
```

**Ожидаемый вывод:**

```
Sequelize CLI [Node: 20.19.5, CLI: 6.6.3, ORM: 6.37.7]

Loaded configuration file "config/config.json".
Using environment "development".
== 20251017142906-create-users: migrating =======
== 20251017142906-create-users: migrated (0.123s)

== 20251017142915-create-categories: migrating =======
== 20251017142915-create-categories: migrated (0.089s)

== 20251017142916-create-authors: migrating =======
== 20251017142916-create-authors: migrated (0.095s)

== 20251017142917-create-books: migrating =======
== 20251017142917-create-books: migrated (0.145s)

== 20251017142917-create-book-authors: migrating =======
== 20251017142917-create-book-authors: migrated (0.102s)

== 20251017142918-create-cart: migrating =======
== 20251017142918-create-cart: migrated (0.098s)
```

**Что происходит:**

1. Sequelize проверяет, какие миграции уже применены (таблица `SequelizeMeta`)
2. Применяет новые миграции в порядке их создания (по временной метке в имени)
3. Создает таблицы в БД согласно определениям в миграциях
4. Создает индексы и внешние ключи

**Созданные таблицы:**

- `users` — пользователи
- `categories` — категории книг
- `authors` — авторы
- `books` — книги
- `book_authors` — связь книг и авторов
- `cart` — корзина покупок
- `SequelizeMeta` — история миграций (служебная)

### 4. Проверка структуры БД

Подключитесь к БД и проверьте таблицы:

```bash
psql -U postgres -d bookstore
```

**В psql выполните:**

```sql
-- Список таблиц
\dt

-- Структура таблицы users
\d users

-- Структура таблицы books
\d books

-- Все индексы в БД
\di

-- Внешние ключи
SELECT
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Выход
\q
```

**Ожидаемые таблицы:**

```
          List of relations
 Schema |      Name       | Type  |  Owner
--------+-----------------+-------+----------
 public | SequelizeMeta   | table | postgres
 public | authors         | table | postgres
 public | book_authors    | table | postgres
 public | books           | table | postgres
 public | cart            | table | postgres
 public | categories      | table | postgres
 public | users           | table | postgres
```

### 5. Создание seeder файлов

Мы уже создали seeder файлы на шаге 1. Давайте проверим их содержимое.

#### 5.1 Seeder для категорий (seeders/XXXXXX-demo-categories.js)

Этот файл заполняет таблицу `categories` четырьмя жанрами книг:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('categories', [
      {
        id: 1,
        name: 'Романтика',
        slug: 'romance',
        description: 'Романтические произведения о любви и отношениях',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Драма',
        slug: 'drama',
        description: 'Драматические произведения с глубоким смыслом',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Биография',
        slug: 'bio',
        description: 'Биографические и документальные произведения',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Фантастика',
        slug: 'fantasy',
        description: 'Фантастические и научно-фантастические произведения',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('categories', null, {});
  }
};
```

**Описание:**

- **up()** — метод для применения seeder (вставка данных)
- **down()** — метод для отката (удаление данных)
- **bulkInsert()** — массовая вставка записей
- **createdAt, updatedAt** — временные метки

#### 5.2 Seeder для авторов (seeders/XXXXXX-demo-authors.js)

Добавляет 6 авторов из первой лабораторной работы:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('authors', [
      {
        id: 1,
        name: 'Маргарет Митчелл',
        bio: 'Американская писательница, автор романа "Унесённые ветром"',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        name: 'Александр Островский',
        bio: 'Русский драматург, создатель репертуара русского театра',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        name: 'Алексей Бирюлин',
        bio: 'Современный российский писатель',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 4,
        name: 'Александр Беляев',
        bio: 'Русский и советский писатель-фантаст, один из основоположников советской научной фантастики',
        authorType: 'russian',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 5,
        name: 'Антуан де Сент-Экзюпери',
        bio: 'Французский писатель, поэт, эссеист и профессиональный лётчик',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 6,
        name: 'Фрэнсис Скотт Фицджеральд',
        bio: 'Американский писатель, крупнейший представитель "потерянного поколения" в литературе',
        authorType: 'foreign',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('authors', null, {});
  }
};
```

**Поля:**

- **name** — имя автора
- **bio** — биография
- **authorType** — тип автора ('russian' или 'foreign')

#### 5.3 Seeder для книг (seeders/XXXXXX-demo-books.js)

Добавляет 6 книг из первой лабораторной работы с полями для отслеживания популярности и наличия на складе:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('books', [
      {
        id: 1,
        title: 'Унесённые ветром',
        categoryId: 1, // Романтика
        price: 900,
        priceCategory: 'low',
        image: 'book1.jpg',
        shortDescription: '«Унесённые ветром» — масштабная история о любви, войне и выживании на фоне Гражданской войны в США.',
        fullDescription: '«Унесённые ветром» — роман американской писательницы Маргарет Митчелл...',
        stock: 15,
        popularity: 156,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // ... остальные книги
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('books', null, {});
  }
};
```

**Новые поля:**

- **stock** — количество на складе (от 8 до 25 единиц)
- **popularity** — счетчик покупок (от 45 до 312)

**Значения популярности:**

1. Маленький принц — 312 (самая популярная)
2. Человек-амфибия — 203
3. Великий Гэтсби — 178
4. Унесённые ветром — 156
5. Гроза — 87
6. Море и звезды — 45 (наименее популярная)

#### 5.4 Seeder для связи книг и авторов (seeders/XXXXXX-demo-book-authors.js)

Создает связи один-к-одному для каждой книги:

```javascript
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('book_authors', [
      {
        id: 1,
        bookId: 1,
        authorId: 1, // Унесённые ветром - Маргарет Митчелл
        createdAt: new Date(),
        updatedAt: new Date()
      },
      // ... остальные связи
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('book_authors', null, {});
  }
};
```

**Примечание:** В нашем примере у каждой книги один автор, но таблица `book_authors` позволяет создавать связи многие-ко-многим (книга может иметь несколько авторов).

### 6. Применение seeders

Заполним БД тестовыми данными:

```bash
npm run db:seed
```

**Ожидаемый вывод:**

```
Sequelize CLI [Node: 20.19.5, CLI: 6.6.3, ORM: 6.37.7]

Loaded configuration file "config/config.json".
Using environment "development".
== 20251017143657-demo-categories: migrating =======
== 20251017143657-demo-categories: migrated (0.045s)

== 20251017143657-demo-authors: migrating =======
== 20251017143657-demo-authors: migrated (0.038s)

== 20251017143658-demo-books: migrating =======
== 20251017143658-demo-books: migrated (0.052s)

== 20251017143659-demo-book-authors: migrating =======
== 20251017143659-demo-book-authors: migrated (0.029s)
```

**Что происходит:**

1. Sequelize выполняет seeders в порядке их создания
2. Вставляет данные в таблицы
3. Сохраняет информацию о примененных seeders в таблице `SequelizeData`

### 7. Проверка данных в БД

Подключитесь к БД и проверьте данные:

```bash
psql -U postgres -d bookstore
```

**Выполните SQL запросы:**

```sql
-- Количество записей в каждой таблице
SELECT 'categories' as table_name, COUNT(*) as count FROM categories
UNION ALL
SELECT 'authors', COUNT(*) FROM authors
UNION ALL
SELECT 'books', COUNT(*) FROM books
UNION ALL
SELECT 'book_authors', COUNT(*) FROM book_authors;

-- Все категории
SELECT * FROM categories;

-- Все авторы
SELECT id, name, "authorType" FROM authors;

-- Книги с информацией о категории
SELECT 
  b.id,
  b.title,
  b.price,
  b."priceCategory",
  b.stock,
  b.popularity,
  c.name as category
FROM books b
JOIN categories c ON b."categoryId" = c.id
ORDER BY b.popularity DESC;

-- Книги с авторами
SELECT 
  b.title,
  a.name as author,
  a."authorType"
FROM books b
JOIN book_authors ba ON b.id = ba."bookId"
JOIN authors a ON ba."authorId" = a.id;

-- Топ-3 самые популярные книги
SELECT title, popularity, stock
FROM books
ORDER BY popularity DESC
LIMIT 3;

-- Книги, которых осталось мало на складе (меньше 10 штук)
SELECT title, stock, price
FROM books
WHERE stock < 10
ORDER BY stock ASC;

-- Выход
\q
```

**Ожидаемые результаты:**

```
 table_name    | count
---------------+-------
 categories    |     4
 authors       |     6
 books         |     6
 book_authors  |     6
```

### 8. Тестирование БД через Sequelize модели

Создайте тестовый скрипт `test-db.js` в корне проекта:

```javascript
require('dotenv').config();
const db = require('./models');

async function testDatabase() {
  try {
    // Тест подключения
    await db.sequelize.authenticate();
    console.log('✅ Подключение к БД успешно установлено');

    // Получение всех книг с авторами и категориями
    const books = await db.Book.findAll({
      include: [
        {
          model: db.Category,
          as: 'category',
          attributes: ['name', 'slug']
        },
        {
          model: db.Author,
          as: 'authors',
          through: { attributes: [] }, // Не показывать промежуточную таблицу
          attributes: ['name', 'authorType']
        }
      ],
      order: [['popularity', 'DESC']]
    });

    console.log('\n📚 Книги в БД (по популярности):');
    console.log('═'.repeat(80));

    books.forEach((book, index) => {
      const author = book.authors[0];
      console.log(`\n${index + 1}. ${book.title}`);
      console.log(`   Автор: ${author.name} (${author.authorType})`);
      console.log(`   Категория: ${book.category.name}`);
      console.log(`   Цена: ${book.price} руб. (${book.priceCategory})`);
      console.log(`   Популярность: ${book.popularity} покупок`);
      console.log(`   На складе: ${book.stock} шт.`);
    });

    // Получение категорий с количеством книг
    const categories = await db.Category.findAll({
      include: [{
        model: db.Book,
        as: 'books',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        [db.sequelize.fn('COUNT', db.sequelize.col('books.id')), 'bookCount']
      ],
      group: ['Category.id'],
      raw: true
    });

    console.log('\n\n📂 Категории:');
    console.log('═'.repeat(40));
    categories.forEach(cat => {
      console.log(`${cat.name}: ${cat.bookCount} книг(и)`);
    });

    // Получение авторов по типу
    const russianAuthors = await db.Author.count({ where: { authorType: 'russian' } });
    const foreignAuthors = await db.Author.count({ where: { authorType: 'foreign' } });

    console.log('\n\n👥 Статистика по авторам:');
    console.log('═'.repeat(40));
    console.log(`Российские авторы: ${russianAuthors}`);
    console.log(`Зарубежные авторы: ${foreignAuthors}`);

    // Книги с низким запасом
    const lowStock = await db.Book.findAll({
      where: {
        stock: {
          [db.Sequelize.Op.lt]: 10
        }
      },
      attributes: ['title', 'stock'],
      order: [['stock', 'ASC']]
    });

    if (lowStock.length > 0) {
      console.log('\n\n⚠️  Книги с низким запасом (< 10 шт.):');
      console.log('═'.repeat(40));
      lowStock.forEach(book => {
        console.log(`${book.title}: ${book.stock} шт.`);
      });
    }

    console.log('\n\n✅ Все тесты пройдены успешно!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Ошибка:', error);
    process.exit(1);
  }
}

testDatabase();
```

**Запустите тест:**

```bash
node test-db.js
```

**Ожидаемый вывод:**

```
✅ Подключение к БД успешно установлено

📚 Книги в БД (по популярности):
═══════════════════════════════════════════════════════════════

1. Маленький принц
   Автор: Антуан де Сент-Экзюпери (foreign)
   Категория: Фантастика
   Цена: 890 руб. (low)
   Популярность: 312 покупок
   На складе: 25 шт.

2. Человек-амфибия
   Автор: Александр Беляев (russian)
   Категория: Фантастика
   Цена: 1750 руб. (high)
   Популярность: 203 покупок
   На складе: 12 шт.

... (остальные книги)

📂 Категории:
════════════════════════════════════════
Романтика: 1 книг(и)
Драма: 2 книг(и)
Биография: 1 книг(и)
Фантастика: 2 книг(и)

👥 Статистика по авторам:
════════════════════════════════════════
Российские авторы: 3
Зарубежные авторы: 3

⚠️  Книги с низким запасом (< 10 шт.):
════════════════════════════════════════
Море и звезды: 8 шт.

✅ Все тесты пройдены успешно!
```

### 9. Полезные команды для работы с БД

#### Откат последней миграции

```bash
npm run db:migrate:undo
```

#### Откат всех миграций

```bash
npx sequelize-cli db:migrate:undo:all
```

#### Пересоздание БД с нуля

```bash
npm run db:reset
```

Эта команда:
1. Откатывает все миграции
2. Применяет все миграции заново
3. Заполняет БД seeders

#### Откат конкретного seeder

```bash
npx sequelize-cli db:seed:undo --seed 20251017143657-demo-categories.js
```

#### Откат всех seeders

```bash
npx sequelize-cli db:seed:undo:all
```

## ✅ Проверочный список

Убедитесь, что выполнены все пункты:

- [ ] PostgreSQL установлен и запущен
- [ ] База данных `bookstore` создана
- [ ] Файл `config/config.json` содержит правильные данные подключения
- [ ] Выполнена команда `npm run db:migrate` без ошибок
- [ ] Создано 6 таблиц + SequelizeMeta
- [ ] Выполнена команда `npm run db:seed` без ошибок
- [ ] В таблице `categories` 4 записи
- [ ] В таблице `authors` 6 записей
- [ ] В таблице `books` 6 записей
- [ ] В таблице `book_authors` 6 записей
- [ ] Тестовый скрипт `test-db.js` выполняется успешно
- [ ] Данные в БД соответствуют данным из lab_1_3

## 📊 Итоговая структура БД

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│   users     │       │  categories  │       │   authors   │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id (PK)     │       │ id (PK)      │       │ id (PK)     │
│ username    │       │ name         │       │ name        │
│ email       │       │ slug         │       │ bio         │
│ password    │       │ description  │       │ authorType  │
│ firstName   │       └──────────────┘       └─────────────┘
│ lastName    │                │                     │
└─────────────┘                │                     │
      │                        │                     │
      │                   ┌────▼─────────────────────▼────┐
      │                   │         books                 │
      │                   ├───────────────────────────────┤
      │                   │ id (PK)                       │
      │                   │ title                         │
      │                   │ categoryId (FK)               │
      │                   │ price                         │
      │                   │ priceCategory                 │
      │                   │ image                         │
      │                   │ shortDescription              │
      │                   │ fullDescription               │
      │                   │ stock                         │
      │                   │ popularity                    │
      │                   └───────────────────────────────┘
      │                        │              │
      │                        │              │
      │                   ┌────▼──────┐  ┌───▼─────────┐
      │                   │book_authors│  │    cart     │
      │                   ├────────────┤  ├─────────────┤
      │                   │ id (PK)    │  │ id (PK)     │
      │                   │ bookId(FK) │  │ userId (FK) │◄──┘
      │                   │authorId(FK)│  │ bookId (FK) │
      │                   └────────────┘  │ quantity    │
      │                                   └─────────────┘
      └────────────────────────────────────────┘
```

## 🎓 Что вы изучили

1. **Установку и настройку PostgreSQL**
2. **Создание базы данных** через Sequelize CLI
3. **Применение миграций** для создания таблиц
4. **Создание seeder файлов** для заполнения БД
5. **Работу с внешними ключами** и связями между таблицами
6. **Проверку структуры БД** через psql
7. **Тестирование БД** через Sequelize модели
8. **SQL запросы** для анализа данных

## 🚀 Следующий шаг

На следующем шаге мы:

1. Создадим API endpoints для работы с книгами
2. Реализуем аутентификацию и регистрацию пользователей
3. Создадим маршруты для корзины покупок
4. Подключим frontend к backend API

**Переход к [Шагу 3: Разработка API endpoints](step3.md)** ➡️
