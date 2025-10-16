# 🏗️ Шаг 3: Создание и запуск базы данных

## 📋 Обзор

На этом шаге мы успешно создали PostgreSQL базу данных, выполнили миграции для создания таблиц и заполнили базу тестовыми данными с помощью Sequelize CLI и созданных Sequelize моделей.

## 🛠️ Пошаговые команды для выполнения

### 📋 **Шаг 3.1: Проверка подключения к PostgreSQL**

```bash
# 1. Проверка, что PostgreSQL запущен
# Windows: Диспетчер задач → Службы → postgresql-x64-xx (должна быть запущена)

# 2. Проверка подключения к PostgreSQL
psql -U postgres -h localhost
\l    # Показать список баз данных
\q    # Выйти из psql

# 3. Альтернативная проверка через командную строку
psql -U postgres -c "SELECT version();"
```

**Что делают эти команды:**

- Проверяют, что служба PostgreSQL запущена и доступна
- `psql -U postgres` - подключение к PostgreSQL под суперпользователем
- `\l` - SQL команда для просмотра всех баз данных в системе
- `SELECT version()` - показывает версию PostgreSQL и подтверждает работоспособность

### 📋 **Шаг 3.2: Создание базы данных через Sequelize**

```bash
# 1. Переход в папку проекта
cd lab_2_sequelize

# 2. Проверка конфигурации подключения
cat config/config.json    # Linux/Mac
type config\config.json   # Windows

# 3. Создание базы данных (автоматически по config.json)
npx sequelize-cli db:create

# 4. Проверка, что база создана
psql -U postgres -c "\l" | findstr bookstore    # Windows
psql -U postgres -c "\l" | grep bookstore       # Linux/Mac
```

**Что делают эти команды:**

- `npx sequelize-cli db:create` - читает config.json и создает БД с именем из поля "database"
- Создается БД "bookstore_dev" (для development окружения)
- Команда автоматически использует параметры подключения из конфигурации
- Если БД уже существует, команда завершается успешно

### 📋 **Шаг 3.3: Выполнение миграций (создание таблиц)**

```bash
# 1. Просмотр списка доступных миграций
npx sequelize-cli migration:status

# 2. Выполнение всех pending миграций
npx sequelize-cli db:migrate

# 3. Проверка структуры созданных таблиц
psql -U postgres -d bookstore_dev -c "\dt"    # Показать таблицы
psql -U postgres -d bookstore_dev -c "\d users"    # Структура таблицы users
psql -U postgres -d bookstore_dev -c "\d books"    # Структура таблицы books
```

**Что делают эти команды:**

- `migration:status` - показывает статус миграций (pending/completed)
- `db:migrate` - выполняет все неприменённые миграции по порядку
- Создаются таблицы: `users`, `books`, `SequelizeMeta` (для отслеживания миграций)
- `\dt` - PostgreSQL команда для просмотра всех таблиц
- `\d table_name` - показывает структуру конкретной таблицы

### 📋 **Шаг 3.4: Заполнение тестовыми данными (seeders)**

```bash
# 1. Просмотр доступных сидеров
ls seeders/    # Linux/Mac
dir seeders\   # Windows

# 2. Выполнение всех сидеров
npx sequelize-cli db:seed:all

# 3. Проверка добавленных данных
psql -U postgres -d bookstore_dev -c "SELECT COUNT(*) FROM books;"
psql -U postgres -d bookstore_dev -c "SELECT title, author, price, stock FROM books;"

# 4. Альтернативно - выполнение конкретного сидера
npx sequelize-cli db:seed --seed 20251013144632-demo-books.js
```

**Что делают эти команды:**

- `db:seed:all` - выполняет все файлы сидеров в папке seeders/
- Добавляет тестовые книги в таблицу books
- `SELECT COUNT(*)` - проверяет количество добавленных записей
- `--seed filename` - позволяет выполнить только конкретный сидер

### 📋 **Шаг 3.5: Создание и тестирование моделей Sequelize**

```bash
# 1. Создание файлов моделей (если не созданы)
touch models/User.js    # Linux/Mac
echo. > models\User.js  # Windows

touch models/Book.js    # Linux/Mac
echo. > models\Book.js  # Windows

# 2. Создание тестового файла для проверки моделей
touch test-models.js    # Linux/Mac
echo. > test-models.js  # Windows

# 3. Установка дополнительных зависимостей для моделей
npm install bcrypt joi    # Для хеширования паролей и валидации

# 4. Запуск теста моделей
node test-models.js
```

**Что делают эти команды:**

- `touch/echo` - создают пустые файлы для моделей
- `bcrypt` - библиотека для безопасного хеширования паролей
- `joi` - библиотека для валидации входных данных
- `node test-models.js` - запускает тестирование функциональности моделей

### 📋 **Шаг 3.6: Проверка и диагностика БД**

```bash
# 1. Подключение к базе и проверка данных
psql -U postgres -d bookstore_dev

# В psql выполнить:
\dt                          # Список таблиц
SELECT * FROM "SequelizeMeta";   # История выполненных миграций
SELECT COUNT(*) FROM books;     # Количество книг
SELECT COUNT(*) FROM users;     # Количество пользователей

# 2. Проверка индексов
\di                          # Список всех индексов

# 3. Просмотр JSONB данных
SELECT title, metadata FROM books WHERE metadata IS NOT NULL;

# 4. Выход из psql
\q
```

**Что делают эти команды:**

- Подключаются к созданной базе данных для диагностики
- `SequelizeMeta` - служебная таблица Sequelize для отслеживания миграций
- `\di` - показывает все созданные индексы в базе
- Проверяют корректность JSONB полей и их содержимое

### 📋 **Шаг 3.7: Создание резервной копии БД**

```bash
# 1. Создание дампа базы данных
pg_dump -U postgres -h localhost -d bookstore_dev > bookstore_backup.sql

# 2. Создание дампа только структуры (без данных)
pg_dump -U postgres -h localhost -d bookstore_dev --schema-only > bookstore_schema.sql

# 3. Создание дампа только данных
pg_dump -U postgres -h localhost -d bookstore_dev --data-only > bookstore_data.sql
```

**Что делают эти команды:**

- `pg_dump` - утилита PostgreSQL для создания резервных копий
- `> file.sql` - перенаправляет вывод в файл
- `--schema-only` - сохраняет только структуру таблиц, индексы, ограничения
- `--data-only` - сохраняет только данные без структуры

### 📋 **Шаг 3.8: Откат изменений (при необходимости)**

```bash
# 1. Откат всех миграций (ОСТОРОЖНО - удаляет все таблицы!)
npx sequelize-cli db:migrate:undo:all

# 2. Откат последней миграции
npx sequelize-cli db:migrate:undo

# 3. Откат сидеров (удаление тестовых данных)
npx sequelize-cli db:seed:undo:all

# 4. Полное пересоздание БД
npx sequelize-cli db:drop        # Удаление БД
npx sequelize-cli db:create      # Создание БД
npx sequelize-cli db:migrate     # Выполнение миграций
npx sequelize-cli db:seed:all    # Заполнение данными
```

**Что делают эти команды:**

- `db:migrate:undo` - откатывает миграции в обратном порядке
- `db:seed:undo` - удаляет данные, добавленные сидерами
- `db:drop` - полностью удаляет базу данных
- Последовательность drop→create→migrate→seed полностью пересоздает БД

## 🎯 Выполненные задачи

### ✅ 1. Создание базы данных PostgreSQL

```bash
npx sequelize-cli db:create
```

**Результат:**

```
Database bookstore_dev created.
```

### ✅ 2. Выполнение миграций (создание таблиц)

```bash
npx sequelize-cli db:migrate
```

**Результат:**

```
== 20251013143521-create-users: migrated (0.087s)
== 20251013144458-create-books: migrated (0.071s)
```

**Созданные таблицы:**

- 📋 **users** - пользователи с историей заказов в JSONB
- 📚 **books** - книги с метаданными в JSONB

### ✅ 3. Заполнение тестовыми данными

```bash
npx sequelize-cli db:seed:all
```

**Результат:**

```
== 20251013144632-demo-books: migrated (0.022s)
```

**Добавлено 6 книг с разными характеристиками:**

- Разная популярность (45-150 покупок)
- Разное количество на складе (0-25 штук)
- Разные ценовые категории (550₽-1750₽)

## 🏗️ Структура базы данных

### Таблица `users`

| Поле               | Тип          | Описание                      |
| ------------------ | ------------ | ----------------------------- |
| **id**             | SERIAL       | Автоинкремент ID              |
| **email**          | VARCHAR(255) | Уникальный email для входа    |
| **password_hash**  | VARCHAR(255) | Хеш пароля (bcrypt)           |
| **first_name**     | VARCHAR(100) | Имя пользователя              |
| **last_name**      | VARCHAR(100) | Фамилия пользователя          |
| **orders_history** | **JSONB**    | 🔥 **История покупок в JSON** |
| **created_at**     | TIMESTAMP    | Дата создания                 |
| **updated_at**     | TIMESTAMP    | Дата обновления               |

### Таблица `books`

| Поле                  | Тип           | Описание                       |
| --------------------- | ------------- | ------------------------------ |
| **id**                | SERIAL        | Автоинкремент ID               |
| **title**             | VARCHAR(255)  | Название книги                 |
| **author**            | VARCHAR(255)  | Автор книги                    |
| **genre**             | VARCHAR(100)  | Жанр книги                     |
| **price**             | DECIMAL(10,2) | Цена книги                     |
| **description**       | TEXT          | Полное описание                |
| **short_description** | TEXT          | Краткое описание               |
| **image**             | VARCHAR(255)  | Имя файла изображения          |
| **popularity**        | INTEGER       | 🔥 **Счетчик покупок**         |
| **stock**             | INTEGER       | 🔥 **Количество на складе**    |
| **metadata**          | **JSONB**     | 🔥 **Категории и доп. данные** |
| **created_at**        | TIMESTAMP     | Дата создания                  |
| **updated_at**        | TIMESTAMP     | Дата обновления                |

## 🔧 Созданные Sequelize модели

### 📄 `models/User.js` - Модель пользователя

#### 🔑 **Ключевые особенности:**

- ✅ **Хеширование паролей** (bcrypt, 12 раундов)
- ✅ **Валидация email** (формат и уникальность)
- ✅ **Сложность пароля** (8+ символов, заглавные/строчные буквы/цифры)
- ✅ **JSONB история заказов** (UUID, книга, количество, цена, дата)
- ✅ **Методы аутентификации** (createUser, authenticate, findByEmail)

#### 🎯 **Основные методы:**

```javascript
// Создание пользователя с валидацией
const user = await User.createUser({
  email: "test@example.com",
  password: "SecurePass123",
  first_name: "Иван",
  last_name: "Петров",
});

// Аутентификация
const authUser = await User.authenticate("test@example.com", "SecurePass123");

// Добавление заказа в историю
await user.addOrder({
  book_id: 1,
  title: "Маленький принц",
  quantity: 2,
  price: 450.0,
  total: 900.0,
});

// Статистика покупок
console.log(user.getOrdersCount()); // Количество заказов
console.log(user.getTotalSpent()); // Общая сумма
```

### 📚 `models/Book.js` - Модель книги

#### 🔑 **Ключевые особенности:**

- ✅ **Управление складом** (проверка наличия, уменьшение при покупке)
- ✅ **Система популярности** (увеличение при каждой покупке)
- ✅ **JSONB метаданные** (категории, ISBN, издательство)
- ✅ **Поиск и фильтрация** (по тексту, жанру, цене, категориям)
- ✅ **Race condition защита** (блокировки FOR UPDATE в транзакциях)

#### 🎯 **Основные методы:**

```javascript
// Поиск книг в наличии с сортировкой по популярности
const books = await Book.findAvailable({
  limit: 10,
  genre: "детская литература",
  priceMin: 300,
  priceMax: 1000,
});

// Поиск по тексту
const results = await Book.search("принц");

// Атомарная покупка (защита от race conditions)
const transaction = await sequelize.transaction();
const book = await Book.purchaseBooks(bookId, quantity, transaction);
await transaction.commit();

// Популярные книги
const popular = await Book.findPopular(10);

// Статистика склада
const stats = await Book.getStats();
// { total: 6, available: 5, outOfStock: 1, percentage: 83 }
```

## 🧪 Тестирование моделей

### 🚀 **Созданный тест-файл:** `test-models.js`

**Тестируемая функциональность:**

1. ✅ **Подключение к PostgreSQL**
2. ✅ **Создание пользователя** с валидацией пароля
3. ✅ **Аутентификация** (правильный/неправильный пароль)
4. ✅ **Получение книг** из базы данных
5. ✅ **Фильтрация** по наличию на складе
6. ✅ **Поиск** по тексту в названии/авторе
7. ✅ **Покупка книги** (транзакция с блокировкой)
8. ✅ **История заказов** пользователя
9. ✅ **Статистика книг** (общее количество, в наличии, закончились)
10. ✅ **Топ популярных** книг

### 📊 **Результаты тестирования:**

```bash
node test-models.js

🚀 Тестирование моделей Sequelize...

✅ Подключение к PostgreSQL успешно!
✅ Пользователь создан: { id: 3, email: 'test@example.com', name: 'Иван Тестов' }
✅ Аутентификация успешна: Да
✅ Защита от неверного пароля: Работает
✅ Найдено 3 книг в БД
✅ Найдено 5 книг в наличии (сортировка по популярности)
✅ Поиск по "принц": найдено 1 книг
✅ Покупка завершена! Склад уменьшен с 8 до 7
✅ Популярность увеличена с 120 до 121
✅ Статистика: 6 книг всего, 5 в наличии (83% доступности)
✅ Топ-3 популярных книг получены

🎉 Все тесты завершены успешно!
```

## 🔍 Данные в базе

### 📚 **Книги в каталоге:**

| Название             | Автор                   | Цена  | Популярность | Склад    |
| -------------------- | ----------------------- | ----- | ------------ | -------- |
| **Маленький принц**  | Антуан де Сент-Экзюпери | 450₽  | 🔥 **150**   | 25       |
| **Гроза**            | Александр Островский    | 550₽  | 🔥 **121**   | 7        |
| **Человек-амфибия**  | Александр Беляев        | 1750₽ | 95           | 20       |
| **Унесённые ветром** | Маргарет Митчелл        | 900₽  | 86           | 14       |
| **Море и звезды**    | Алексей Бирюлин         | 1670₽ | 45           | 12       |
| **Великий Гэтсби**   | Фрэнсис Фицджеральд     | 1200₽ | 78           | ❌ **0** |

### 🎯 **Особенности данных:**

- ✅ Разные **ценовые категории** (low: <500₽, medium: 500-1000₽, high: >1000₽)
- ✅ Разная **популярность** для тестирования сортировки
- ✅ **Нулевой склад** у одной книги для проверки фильтрации
- ✅ **JSONB метаданные** с категориями (`romance`, `foreign`, `price-low`)

## 🔧 Индексы для производительности

### 📈 **Созданные индексы:**

**Для таблицы users:**

- `users_email_unique_idx` - уникальный индекс по email
- `users_created_at_idx` - индекс для сортировки по дате

**Для таблицы books:**

- `books_popularity_idx` - индекс для сортировки по популярности
- `books_stock_idx` - индекс для фильтрации по наличию
- `books_genre_idx` - индекс для поиска по жанру
- `books_author_idx` - индекс для поиска по автору
- `books_price_idx` - индекс для фильтрации по цене
- `books_metadata_gin_idx` - **GIN индекс** для JSONB метаданных

## 🛡️ Безопасность и надежность

### 🔒 **Реализованная защита:**

1. **Хеширование паролей** - bcrypt с 12 раундами
2. **Валидация входных данных** - Joi схемы в моделях
3. **SQL инъекции** - автоматическая защита через Sequelize ORM
4. **Race conditions** - блокировки `FOR UPDATE` в транзакциях
5. **Ограничения БД** - constraints на уровне PostgreSQL

### ⚡ **Атомарные операции:**

```javascript
// Покупка книги - атомарная операция
const transaction = await sequelize.transaction();
try {
  const book = await Book.purchaseBooks(bookId, quantity, transaction);
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

## 📊 SQL запросы (примеры)

### 🔍 **Популярные книги в наличии:**

```sql
SELECT * FROM books
WHERE stock > 0
ORDER BY popularity DESC, created_at DESC
LIMIT 10;
```

### 🔍 **Поиск по JSONB категориям:**

```sql
SELECT * FROM books
WHERE metadata @> '{"categories": ["romance"]}'
AND stock > 0;
```

### 🔍 **История заказов пользователя:**

```sql
SELECT
  email,
  jsonb_array_length(orders_history) as orders_count,
  (
    SELECT SUM((order_item->>'total')::numeric)
    FROM jsonb_array_elements(orders_history) as order_item
  ) as total_spent
FROM users
WHERE id = 1;
```

## 🚀 Следующие шаги

1. ✅ **База данных создана и протестирована**
2. ✅ **Модели Sequelize работают корректно**
3. ⏳ **Создание Express сервера и API роутов**
4. ⏳ **Аутентификация JWT и middleware**
5. ⏳ **API для каталога книг с бесконечным скроллингом**
6. ⏳ **API для покупок и корзины**

## 💡 Ключевые достижения

### 🎯 **Архитектурные решения:**

- ✅ **2 таблицы вместо 3** - выполнено требование преподавателя
- ✅ **JSONB для гибкости** - история заказов и метаданные
- ✅ **Полная функциональность** - все замечания преподавателя учтены

### ⚡ **Производительность:**

- ✅ **Оптимизированные запросы** - индексы для всех частых операций
- ✅ **Транзакционная безопасность** - защита от race conditions
- ✅ **Масштабируемость** - JSONB позволяет легко добавлять поля

**Переход к Шагу 4: Создание Express API сервера** ➡️
