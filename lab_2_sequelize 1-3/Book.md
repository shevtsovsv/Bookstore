# 📚 Модель Book.js - Подробная документация

## 📋 Обзор

Модель `Book` представляет книги в каталоге интернет-магазина. Это одна из двух основных таблиц базы данных (согласно требованию преподавателя - максимум 2 таблицы). Модель содержит полную информацию о книгах, управление складом, систему популярности и гибкие метаданные в формате JSONB.

## 🗄️ Структура таблицы

### Основные поля

| Поле                  | Тип           | Описание              | Ограничения                |
| --------------------- | ------------- | --------------------- | -------------------------- |
| **id**                | INTEGER       | Первичный ключ        | AUTO_INCREMENT, NOT NULL   |
| **title**             | VARCHAR(255)  | Название книги        | NOT NULL, 1-255 символов   |
| **author**            | VARCHAR(255)  | Автор книги           | NOT NULL, 1-255 символов   |
| **genre**             | VARCHAR(100)  | Жанр книги            | NOT NULL, 1-100 символов   |
| **price**             | DECIMAL(10,2) | Цена книги            | NOT NULL, 0-999999.99      |
| **description**       | TEXT          | Полное описание       | NULL, до 5000 символов     |
| **short_description** | TEXT          | Краткое описание      | NULL, до 500 символов      |
| **image**             | VARCHAR(255)  | Имя файла изображения | NULL, .jpg/.png/.gif/.webp |

### Специальные поля (требования преподавателя)

| Поле           | Тип     | Описание             | Назначение                              |
| -------------- | ------- | -------------------- | --------------------------------------- |
| **popularity** | INTEGER | Счетчик покупок      | Замечание 14: отслеживание популярности |
| **stock**      | INTEGER | Количество на складе | Замечание 15: управление остатками      |
| **metadata**   | JSONB   | Гибкие метаданные    | Категории, ISBN, издательство           |

### Служебные поля

| Поле           | Тип       | Описание                   |
| -------------- | --------- | -------------------------- |
| **created_at** | TIMESTAMP | Дата создания записи       |
| **updated_at** | TIMESTAMP | Дата последнего обновления |

## 🧩 Структура JSONB метаданных

### Пример metadata:

```json
{
  "categories": ["romance", "foreign", "price-low"],
  "priceCategory": "low",
  "authorType": "foreign",
  "isbn": "978-5-389-12345-1",
  "publisher": "Издательство АСТ",
  "year": 2023,
  "pages": 450,
  "language": "ru",
  "binding": "мягкий переплет"
}
```

### Ключевые поля metadata:

- **categories** - массив категорий для фильтрации
- **priceCategory** - автоматическая ценовая категория (low/medium/high)
- **authorType** - тип автора (foreign/domestic)
- **isbn** - международный стандартный номер книги
- **publisher** - название издательства
- **year** - год издания
- **pages** - количество страниц

## 🔧 Методы экземпляра (Instance Methods)

### 1. `isAvailable(quantity = 1)`

**Назначение:** Проверка наличия книги на складе

```javascript
const book = await Book.findByPk(1);
console.log(book.isAvailable(2)); // true/false
console.log(book.isAvailable()); // проверка 1 экземпляра (по умолчанию)
```

**Параметры:**

- `quantity` (number, optional) - требуемое количество (по умолчанию 1)

**Возвращает:** `boolean` - true если книга есть в достаточном количестве

### 2. `getCategories()`

**Назначение:** Получение массива категорий из метаданных

```javascript
const book = await Book.findByPk(1);
const categories = book.getCategories();
console.log(categories); // ["romance", "foreign", "price-low"]
```

**Возвращает:** `Array<string>` - массив категорий или пустой массив

### 3. `hasCategory(category)`

**Назначение:** Проверка принадлежности книги к категории

```javascript
const book = await Book.findByPk(1);
console.log(book.hasCategory("romance")); // true/false
```

**Параметры:**

- `category` (string) - название категории для проверки

**Возвращает:** `boolean` - true если книга принадлежит категории

### 4. `getPriceCategory()`

**Назначение:** Определение ценовой категории книги

```javascript
const book = await Book.findByPk(1);
console.log(book.getPriceCategory()); // "low", "medium", "high"
```

**Логика определения:**

- **low** - цена < 500₽
- **medium** - цена 500-999₽
- **high** - цена ≥ 1000₽

**Возвращает:** `string` - ценовая категория

### 5. `toJSON()`

**Назначение:** Сериализация для API с вычисляемыми полями

```javascript
const book = await Book.findByPk(1);
const json = book.toJSON();

// Дополнительные поля в результате:
// - categories: массив категорий
// - priceCategory: ценовая категория
// - available: boolean наличие на складе
```

## 🏭 Статические методы (Static Methods)

### 1. `findAvailable(options = {})`

**Назначение:** Поиск книг в наличии с фильтрацией и сортировкой

```javascript
// Базовое использование
const books = await Book.findAvailable({
  limit: 10,
  offset: 0,
});

// Расширенная фильтрация
const books = await Book.findAvailable({
  limit: 20,
  offset: 0,
  genre: "детская литература",
  author: "Экзюпери",
  priceMin: 300,
  priceMax: 1000,
  categories: ["romance", "foreign"],
});
```

**Параметры options:**

- `limit` (number) - количество результатов (по умолчанию 20)
- `offset` (number) - смещение для пагинации (по умолчанию 0)
- `genre` (string) - фильтр по жанру (ILIKE поиск)
- `author` (string) - фильтр по автору (ILIKE поиск)
- `priceMin` (number) - минимальная цена
- `priceMax` (number) - максимальная цена
- `categories` (Array<string>) - фильтр по категориям (JSONB)

**Возвращает:** `Promise<Array<Book>>` - массив книг, отсортированный по популярности

### 2. `findPopular(limit = 10)`

**Назначение:** Получение самых популярных книг в наличии

```javascript
const popularBooks = await Book.findPopular(5);
```

**Параметры:**

- `limit` (number) - количество книг (по умолчанию 10)

**Возвращает:** `Promise<Array<Book>>` - топ книг по популярности

### 3. `search(query, options = {})`

**Назначение:** Полнотекстовый поиск по книгам

```javascript
// Поиск по всем полям
const results = await Book.search("принц");

// Поиск с настройками
const results = await Book.search("Гэтсби", {
  limit: 5,
  offset: 0,
  onlyAvailable: false, // включить книги не в наличии
});
```

**Поиск выполняется по полям:**

- title (название)
- author (автор)
- genre (жанр)
- description (описание)

**Параметры:**

- `query` (string) - поисковый запрос
- `options.limit` (number) - количество результатов (по умолчанию 20)
- `options.offset` (number) - смещение (по умолчанию 0)
- `options.onlyAvailable` (boolean) - только в наличии (по умолчанию true)

### 4. `purchaseBooks(bookId, quantity, transaction = null)`

**Назначение:** Атомарная покупка книг с защитой от race conditions

```javascript
// Использование в транзакции (рекомендуется)
const transaction = await sequelize.transaction();
try {
  const book = await Book.purchaseBooks(1, 2, transaction);
  await transaction.commit();
  console.log(`Куплено! Осталось: ${book.stock}`);
} catch (error) {
  await transaction.rollback();
  console.error("Ошибка покупки:", error.message);
}

// Использование без транзакции (не рекомендуется)
const book = await Book.purchaseBooks(1, 1);
```

**Что делает:**

1. Блокирует запись книги (`LOCK.UPDATE`)
2. Проверяет наличие достаточного количества
3. Атомарно уменьшает склад и увеличивает популярность
4. Возвращает обновленную книгу

**Параметры:**

- `bookId` (number) - ID книги
- `quantity` (number) - количество для покупки
- `transaction` (Transaction, optional) - Sequelize транзакция

**Исключения:**

- "Книга не найдена" - если ID не существует
- "Недостаточно товара на складе" - если quantity > stock

### 5. `getStats()`

**Назначение:** Получение статистики по каталогу книг

```javascript
const stats = await Book.getStats();
console.log(stats);
// {
//   total: 6,           // всего книг
//   available: 5,       // в наличии
//   outOfStock: 1,      // закончились
//   percentage: 83      // процент доступности
// }
```

**Возвращает:** `Promise<Object>` с полями:

- `total` - общее количество книг
- `available` - количество книг в наличии
- `outOfStock` - количество книг не в наличии
- `percentage` - процент доступности (0-100)

## 🛡️ Валидация данных

### Валидация полей модели

```javascript
// Название книги
title: {
  validate: {
    notEmpty: { msg: "Название книги не может быть пустым" },
    len: { args: [1, 255], msg: "Название должно содержать от 1 до 255 символов" }
  }
}

// Цена
price: {
  validate: {
    isDecimal: { msg: "Цена должна быть числом" },
    min: { args: [0], msg: "Цена не может быть отрицательной" },
    max: { args: [999999.99], msg: "Цена слишком высокая" }
  }
}

// Изображение
image: {
  validate: {
    isValidImageName(value) {
      if (value && !/\.(jpg|jpeg|png|gif|webp)$/i.test(value)) {
        throw new Error("Неподдерживаемый формат изображения");
      }
    }
  }
}

// Популярность
popularity: {
  validate: {
    isInt: { msg: "Популярность должна быть целым числом" },
    min: { args: [0], msg: "Популярность не может быть отрицательной" }
  }
}

// Метаданные
metadata: {
  validate: {
    isValidMetadata(value) {
      if (typeof value !== "object" || Array.isArray(value)) {
        throw new Error("Метаданные должны быть объектом");
      }

      if (value.categories && !Array.isArray(value.categories)) {
        throw new Error("Категории должны быть массивом");
      }

      if (value.priceCategory && !["low", "medium", "high"].includes(value.priceCategory)) {
        throw new Error("Неверная ценовая категория");
      }
    }
  }
}
```

## 📈 Индексы для производительности

### Созданные индексы:

```javascript
indexes: [
  {
    fields: ["popularity"],
    name: "books_popularity_idx", // Сортировка по популярности
  },
  {
    fields: ["stock"],
    name: "books_stock_idx", // Фильтрация по наличию
  },
  {
    fields: ["genre"],
    name: "books_genre_idx", // Поиск по жанру
  },
  {
    fields: ["author"],
    name: "books_author_idx", // Поиск по автору
  },
  {
    fields: ["price"],
    name: "books_price_idx", // Фильтрация по цене
  },
  {
    using: "gin",
    fields: ["metadata"],
    name: "books_metadata_gin_idx", // JSONB индекс для категорий
  },
];
```

## 🔍 Примеры SQL запросов

### 1. Популярные книги в наличии:

```sql
SELECT * FROM books
WHERE stock > 0
ORDER BY popularity DESC, created_at DESC
LIMIT 10;
```

### 2. Поиск по JSONB категориям:

```sql
SELECT * FROM books
WHERE metadata @> '{"categories": ["romance"]}'
AND stock > 0;
```

### 3. Фильтрация по цене и жанру:

```sql
SELECT * FROM books
WHERE stock > 0
AND price BETWEEN 500 AND 1000
AND genre ILIKE '%детская%'
ORDER BY popularity DESC;
```

### 4. Полнотекстовый поиск:

```sql
SELECT * FROM books
WHERE (
  title ILIKE '%принц%' OR
  author ILIKE '%принц%' OR
  genre ILIKE '%принц%' OR
  description ILIKE '%принц%'
)
AND stock > 0
ORDER BY popularity DESC;
```

## 🧪 Примеры использования

### Создание новой книги:

```javascript
const newBook = await Book.create({
  title: "Новая книга",
  author: "Новый автор",
  genre: "фантастика",
  price: 750.0,
  description: "Увлекательная история...",
  short_description: "Краткое описание",
  image: "book-cover.jpg",
  popularity: 0,
  stock: 15,
  metadata: {
    categories: ["sci-fi", "new", "price-medium"],
    priceCategory: "medium",
    isbn: "978-5-123-45678-9",
    publisher: "Новое издательство",
    year: 2025,
    pages: 320,
  },
});
```

### Каталог с пагинацией:

```javascript
async function getCatalogPage(page = 1, pageSize = 20, filters = {}) {
  const offset = (page - 1) * pageSize;

  const books = await Book.findAvailable({
    limit: pageSize,
    offset: offset,
    ...filters,
  });

  const total = await Book.count({
    where: { stock: { [Op.gt]: 0 } },
  });

  return {
    books,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      hasNext: page < Math.ceil(total / pageSize),
      hasPrev: page > 1,
    },
  };
}
```

### Покупка с обработкой ошибок:

```javascript
async function purchaseBook(bookId, quantity, userId) {
  const transaction = await sequelize.transaction();

  try {
    // 1. Покупаем книгу (атомарно)
    const book = await Book.purchaseBooks(bookId, quantity, transaction);

    // 2. Добавляем в историю пользователя
    const user = await User.findByPk(userId, { transaction });
    await user.addOrder({
      book_id: bookId,
      title: book.title,
      quantity: quantity,
      price: book.price,
      total: book.price * quantity,
    });

    await transaction.commit();

    return {
      success: true,
      book: book,
      message: `Успешно куплено ${quantity} экз. "${book.title}"`,
    };
  } catch (error) {
    await transaction.rollback();

    return {
      success: false,
      error: error.message,
    };
  }
}
```

## 🚀 Производительность и оптимизация

### Рекомендации по использованию:

1. **Всегда используйте транзакции** для purchaseBooks()
2. **Используйте limit/offset** для больших каталогов
3. **Кешируйте популярные книги** в Redis/Memcached
4. **Создавайте составные индексы** для частых фильтров
5. **Используйте EXPLAIN ANALYZE** для анализа запросов

### Мониторинг производительности:

```javascript
// Логирование медленных запросов
const sequelize = new Sequelize(config, {
  logging: (sql, timing) => {
    if (timing > 1000) {
      // Запросы > 1 секунды
      console.warn(`Slow query (${timing}ms):`, sql);
    }
  },
  benchmark: true,
});
```

## 🔗 Связи с другими моделями

В нашей архитектуре с 2 таблицами связи реализованы через JSONB:

- **User.orders_history** содержит book_id для связи с книгами
- **Book.metadata** может содержать дополнительную информацию
- Прямые Sequelize ассоциации не используются (по требованию преподавателя)

## 📝 Заключение

Модель Book обеспечивает:

✅ **Полную функциональность каталога** - поиск, фильтрация, сортировка  
✅ **Управление складом** - проверка наличия, атомарные покупки  
✅ **Систему популярности** - отслеживание покупок  
✅ **Гибкие метаданные** - JSONB для категорий и доп. информации  
✅ **Высокую производительность** - индексы для всех частых запросов  
✅ **Защиту от race conditions** - транзакционные блокировки  
✅ **Полную валидацию** - проверка всех входных данных

Модель готова для использования в высоконагруженном интернет-магазине книг.
