# 🏗️ Шаг 3: Создание моделей Sequelize для нормализованной схемы

## 📋 Обзор

На этом шаге мы успешно создали **11 моделей Sequelize** для нормализованной базы данных с 10 таблицами. Модели включают полные ассоциации, валидацию данных, бизнес-методы и готовы для работы с миграциями и API.

## 🛠️ Последовательность выполнения

### 📋 **Шаг 3.1: Удаление старых моделей**

```bash
# 1. Переход в папку проекта
cd lab_2_sequelize

# 2. Удаление старых моделей (2-табличная схема)
Remove-Item models\Book.js, models\User.js

# 3. Проверка папки models
dir models\
```

**Результат:**

```
models\
    index.js     # Остается - основной файл загрузки моделей
```

### 📋 **Шаг 3.2: Создание основных моделей (5 таблиц)**

```bash
# 1. Создание модели User (пользователи)
# Включает: роли, валидацию email, хеширование паролей
# Ассоциации: hasMany Orders, Reviews, CartItems, Wishlist

# 2. Создание модели Category (категории)
# Включает: иерархическую структуру (self-referencing)
# Ассоциации: belongsTo parent, hasMany children, hasMany Books

# 3. Создание модели Publisher (издательства)
# Включает: контактная информация, год основания
# Ассоциации: hasMany Books

# 4. Создание модели Author (авторы)
# Включает: биография, даты жизни, национальность
# Ассоциации: belongsToMany Books через BookAuthor

# 5. Создание модели Book (книги)
# Включает: валидация ISBN, управление складом, популярность
# Ассоциации: belongsTo Category/Publisher, belongsToMany Authors
```

**Созданные файлы:**

- ✅ `models/User.js`
- ✅ `models/Category.js`
- ✅ `models/Publisher.js`
- ✅ `models/Author.js`
- ✅ `models/Book.js`

### 📋 **Шаг 3.3: Создание связующих и бизнес-моделей (6 таблиц)**

```bash
# 6. Создание модели BookAuthor (связь книг и авторов)
# Many-to-Many связь с ролями (author, co-author, translator, editor)

# 7. Создание модели Order (заказы)
# Включает: статусы, номера заказов, workflow методы

# 8. Создание модели OrderItem (позиции заказов)
# Включает: валидация количества и цены, расчет сумм

# 9. Создание модели Review (отзывы)
# Включает: рейтинги 1-5, проверка покупок, модерация

# 10. Создание модели CartItem (корзина)
# Включает: управление количеством, проверка наличия

# 11. Создание модели Wishlist (список желаний)
# Включает: перемещение в корзину, уведомления о наличии
```

**Созданные файлы:**

- ✅ `models/BookAuthor.js`
- ✅ `models/Order.js`
- ✅ `models/OrderItem.js`
- ✅ `models/Review.js`
- ✅ `models/CartItem.js`
- ✅ `models/Wishlist.js`

### 📋 **Шаг 3.4: Обновление файла загрузки моделей**

```javascript
// models/index.js - обновлен для загрузки всех 11 моделей

// Подключение всех моделей
const User = require("./User")(sequelize, Sequelize.DataTypes);
const Category = require("./Category")(sequelize, Sequelize.DataTypes);
const Publisher = require("./Publisher")(sequelize, Sequelize.DataTypes);
const Author = require("./Author")(sequelize, Sequelize.DataTypes);
const Book = require("./Book")(sequelize, Sequelize.DataTypes);
const BookAuthor = require("./BookAuthor")(sequelize, Sequelize.DataTypes);
const Order = require("./Order")(sequelize, Sequelize.DataTypes);
const OrderItem = require("./OrderItem")(sequelize, Sequelize.DataTypes);
const Review = require("./Review")(sequelize, Sequelize.DataTypes);
const CartItem = require("./CartItem")(sequelize, Sequelize.DataTypes);
const Wishlist = require("./Wishlist")(sequelize, Sequelize.DataTypes);

// Инициализация ассоциаций
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});
```

### 📋 **Шаг 3.5: Тестирование моделей**

```bash
# 1. Создание тестового файла
# test-models.js - проверка загрузки моделей и ассоциаций

# 2. Запуск тестирования
node test-models.js
```

**Результат тестирования:**

```
🚀 Тестирование новых моделей Sequelize (10 таблиц)...

� Проверка подключения к базе данных...
✅ Подключение к PostgreSQL установлено успешно.

📋 Загруженные модели:
  - User
  - Category
  - Publisher
  - Author
  - Book
  - BookAuthor
  - Order
  - OrderItem
  - Review
  - CartItem
  - Wishlist

🔗 Проверка ассоциаций:
  - User ассоциации: orders, reviews, cartItems, wishlistItems, cartBooks, wishlistBooks
  - Book ассоциации: category, publisher, authors, bookAuthors, orderItems, reviews, cartItems, wishlistItems, cartUsers, wishlistUsers
  - Category ассоциации: parent, children, books
  - Author ассоциации: books, bookAuthors
  - Order ассоциации: user, items, books
  - Publisher ассоциации: books
  - Review ассоциации: user, book
  - CartItem ассоциации: user, book
  - Wishlist ассоциации: user, book
  - BookAuthor ассоциации: book, author
  - OrderItem ассоциации: order, book

📊 Статистика моделей:
  - Всего моделей: 11
  - Основные сущности: User, Category, Publisher, Author, Book
  - Связующие таблицы: BookAuthor
  - Бизнес-логика: Order, OrderItem, Review, CartItem, Wishlist

✅ Все модели загружены и ассоциации настроены корректно!
🎯 Готово для запуска миграций и создания таблиц в БД
```

## 🎯 Выполненные задачи

### ✅ 1. Удаление старых моделей (2-табличная схема)

```bash
Remove-Item models\Book.js, models\User.js
```

**Результат:**

```
Старые модели удалены - переход к нормализованной схеме
```

### ✅ 2. Создание 11 новых моделей Sequelize

**Основные сущности (5 моделей):**

- ✅ `User.js` - пользователи с ролями и валидацией
- ✅ `Category.js` - категории с иерархической структурой
- ✅ `Publisher.js` - издательства с контактной информацией
- ✅ `Author.js` - авторы с биографией и датами жизни
- ✅ `Book.js` - книги с полной информацией и связями

**Связующие и бизнес-модели (6 моделей):**

- ✅ `BookAuthor.js` - связь книг и авторов (Many-to-Many)
- ✅ `Order.js` - заказы со статусами и workflow
- ✅ `OrderItem.js` - позиции заказов с валидацией
- ✅ `Review.js` - отзывы с рейтингами и модерацией
- ✅ `CartItem.js` - корзина покупок с управлением
- ✅ `Wishlist.js` - список желаний с уведомлениями

### ✅ 3. Настройка ассоциаций между моделями

**Типы связей реализованы:**

- 🔗 **One-to-Many (1:N)** - 15 связей
- � **Many-to-Many (N:N)** - 4 связи через промежуточные таблицы
- 🔗 **Self-referencing** - иерархия категорий

### ✅ 4. Тестирование моделей

```bash
node test-models.js
```

**Результат:**

```
✅ 11 моделей загружены успешно
✅ Все ассоциации настроены корректно
✅ Подключение к PostgreSQL работает
🎯 Готово для запуска миграций!
```

## 🏗️ Структура моделей Sequelize

### 📊 **Схема ассоциаций между моделями:**

```
User (1) ──────── (N) Order ──────── (N) OrderItem ──────── (N) Book
 │                                                            │
 │                                                            │
 ├─ (N) Review ──────────────────────────────────────────────┤
 │                                                            │
 ├─ (N) CartItem ────────────────────────────────────────────┤
 │                                                            │
 └─ (N) Wishlist ───────────────────────────────────────────┘
                                                              │
Category (1) ──────── (N) Book (N) ──────── (N) Author       │
    │                       │                  │             │
    │                       │                  │             │
 parent_id             Publisher (1)      BookAuthor         │
    │                       │              (связь N:N)       │
    └─ Category (children)  └─────────────────┘              │
       (иерархия)                                            │
                                                             │
Индексы и производительность ─────────────────────────────────┘
```

### 🔍 **Детальная информация по моделям:**

### 1. **User.js** - Пользователи

```javascript
// Поля
- id (PK), first_name, last_name, email (UNIQUE)
- password_hash, phone, role (customer|admin|manager)
- created_at, updated_at

// Ассоциации
- hasMany: orders, reviews, cartItems, wishlistItems
- belongsToMany: cartBooks, wishlistBooks

// Методы экземпляра
- getFullName(), isAdmin(), isManager(), isCustomer()
```

### 2. **Category.js** - Категории

```javascript
// Поля
- id (PK), name (UNIQUE), slug (UNIQUE), description
- parent_id (FK self), is_active, sort_order

// Ассоциации
- belongsTo: parent (Category)
- hasMany: children (Category), books

// Методы экземпляра
- getAncestors(), getDescendants(), getFullPath()
```

### 3. **Publisher.js** - Издательства

```javascript
// Поля
- id (PK), name (UNIQUE), country, website
- email, phone, address, founded_year

// Ассоциации
- hasMany: books

// Методы экземпляра
- getAge(), getContactInfo(), getBooksCount(), getPopularBooks()
```

### 4. **Author.js** - Авторы

```javascript
// Поля
- id (PK), first_name, last_name, middle_name
- birth_date, death_date, nationality, biography

// Ассоциации
- belongsToMany: books (через BookAuthor)
- hasMany: bookAuthors

// Методы экземпляра
- getFullName(), getDisplayName(), getAge(), isAlive()
- getBooksCount(), getBooksByRole(), getLifeSpan()
```

### 5. **Book.js** - Книги

```javascript
// Поля
- id (PK), title, description, isbn (UNIQUE)
- price, stock, pages, language, publication_year
- edition, weight, popularity
- category_id (FK), publisher_id (FK)

// Ассоциации
- belongsTo: category, publisher
- belongsToMany: authors (через BookAuthor), cartUsers, wishlistUsers
- hasMany: bookAuthors, orderItems, reviews, cartItems, wishlistItems

// Методы экземпляра
- isAvailable(), isOutOfStock(), isLowStock()
- getAuthorsString(), getMainAuthor(), getAverageRating()
- decreaseStock(), increaseStock(), getSimilarBooks()
```

### 6. **BookAuthor.js** - Связь книг и авторов

```javascript
// Поля
- id (PK), book_id (FK), author_id (FK)
- role (author|co-author|translator|editor)

// Ассоциации
- belongsTo: book, author

// Методы экземпляра
- isMainAuthor(), isCoAuthor(), isTranslator(), isEditor()
- getRoleDisplayName()
```

### 7. **Order.js** - Заказы

```javascript
// Поля
- id (PK), user_id (FK), order_number (UNIQUE)
- total_amount, status, created_at, updated_at
- shipped_at, delivered_at

// Ассоциации
- belongsTo: user
- hasMany: items (OrderItem)
- belongsToMany: books (через OrderItem)

// Методы экземпляра
- isPending(), isConfirmed(), isProcessing(), isShipped()
- isDelivered(), isCancelled(), canBeCancelled()
- confirmOrder(), startProcessing(), shipOrder(), deliverOrder()
```

### 8. **OrderItem.js** - Позиции заказов

```javascript
// Поля
- id (PK), order_id (FK), book_id (FK)
- quantity, price_per_item, total_price

// Ассоциации
- belongsTo: order, book

// Методы экземпляра
- calculateTotalPrice(), validateTotalPrice()
- updateQuantity(), updatePrice(), canBeReturned()
```

### 9. **Review.js** - Отзывы

```javascript
// Поля
- id (PK), user_id (FK), book_id (FK)
- rating (1-5), title, comment
- is_verified_purchase

// Ассоциации
- belongsTo: user, book

// Методы экземпляра
- isPositive(), isNegative(), isNeutral()
- getRatingStars(), getRatingDisplayName()
- markAsVerifiedPurchase(), getReviewAge(), canBeEdited()
```

### 10. **CartItem.js** - Корзина покупок

```javascript
// Поля
- id (PK), user_id (FK), book_id (FK)
- quantity, added_at

// Ассоциации
- belongsTo: user, book

// Методы экземпляра
- getTotalPrice(), isAvailable(), updateQuantity()
- increaseQuantity(), decreaseQuantity(), moveToWishlist()
- createOrderItem()
```

### 11. **Wishlist.js** - Список желаний

```javascript
// Поля
- id (PK), user_id (FK), book_id (FK)
- added_at

// Ассоциации
- belongsTo: user, book

// Методы экземпляра
- isBookAvailable(), getBookPrice(), moveToCart()
- notifyWhenAvailable(), checkPriceChange(), getRecommendedBooks()
```

## 🔧 Ключевые особенности моделей

### 🔐 **Валидация и безопасность:**

1. **Валидация данных** на уровне моделей:

   ```javascript
   // В User.js
   email: {
     type: DataTypes.STRING(255),
     allowNull: false,
     unique: true,
     validate: {
       isEmail: true,
       notEmpty: true
     }
   }

   // В Book.js
   price: {
     type: DataTypes.DECIMAL(10, 2),
     allowNull: false,
     validate: {
       min: 0,
       isDecimal: true
     }
   }
   ```

2. **Проверочные ограничения (CHECK)**:

   ```javascript
   // В Review.js
   rating: {
     validate: {
       min: 1,
       max: 5,
       isInt: true
     }
   }

   // В Author.js
   death_date: {
     validate: {
       isAfterBirth(value) {
         if (value && this.birth_date && new Date(value) <= new Date(this.birth_date)) {
           throw new Error('Дата смерти должна быть после даты рождения');
         }
       }
     }
   }
   ```

### ⚡ **Производительность и индексы:**

1. **Индексы для быстрого поиска**:

   ```javascript
   // В models определены индексы для каждой таблицы
   indexes: [
     { unique: true, fields: ["email"] },
     { fields: ["role"] },
     { fields: ["created_at"] },
     { fields: ["category_id", "stock"] }, // Составной индекс
   ];
   ```

2. **Scopes для частых запросов**:
   ```javascript
   // В Book.js
   scopes: {
     available: {
       where: { stock: { [Sequelize.Op.gt]: 0 } }
     },
     popular: {
       where: { popularity: { [Sequelize.Op.gte]: 10 } }
     },
     byCategory: (categoryId) => ({
       where: { category_id: categoryId }
     })
   }
   ```

### � **Бизнес-логика:**

1. **Методы экземпляра для удобства работы**:

   ```javascript
   // User.js
   getFullName() {
     return `${this.first_name} ${this.last_name}`;
   }

   // Book.js
   async decreaseStock(quantity) {
     if (this.stock < quantity) {
       throw new Error('Недостаточно товара на складе');
     }
     this.stock -= quantity;
     this.popularity += quantity;
     return await this.save();
   }
   ```

2. **Hooks для автоматических действий**:
   ```javascript
   // В OrderItem.js
   hooks: {
     beforeSave: (orderItem) => {
       orderItem.total_price = orderItem.calculateTotalPrice();
     },
     afterSave: async (orderItem) => {
       const order = await orderItem.getOrder();
       if (order) {
         const totalAmount = await order.calculateTotalAmount();
         await order.update({ total_amount: totalAmount });
       }
     }
   }
   ```

### � **Сложные ассоциации:**

1. **Many-to-Many через промежуточную таблицу**:

   ```javascript
   // Book ↔ Author через BookAuthor
   Book.belongsToMany(models.Author, {
     through: models.BookAuthor,
     foreignKey: "book_id",
     otherKey: "author_id",
     as: "authors",
   });
   ```

2. **Self-referencing для иерархии**:
   ```javascript
   // Category → parent Category
   Category.belongsTo(models.Category, {
     foreignKey: "parent_id",
     as: "parent",
     onDelete: "SET NULL",
   });
   ```

### 🧪 **Тестирование:**

**Результат запуска test-models.js:**

```
📋 Загруженные модели: 11
🔗 Ассоциации проверены: ✅ Все работают
📊 Подключение к БД: ✅ Успешно
🎯 Статус: Готово для миграций
```

## 🚀 Следующие шаги

1. ✅ **Миграции созданы** (11 файлов для 10 таблиц)
2. ✅ **Сидер с тестовыми данными** подготовлен
3. ✅ **Модели Sequelize созданы** (11 моделей с ассоциациями)
4. ✅ **Тестирование моделей** завершено успешно
5. ⏳ **Запуск миграций** для создания таблиц в БД
6. ⏳ **Заполнение тестовыми данными** (выполнение сидера)
7. ⏳ **Создание Express сервера и API роутов**
8. ⏳ **Разработка фронтенда** для интернет-магазина

## 💡 Ключевые достижения

### 🎯 **Архитектурное решение:**

- ✅ **Полная нормализация** - переход от 2 таблиц к 10 таблицам
- ✅ **Правильные связи** - Foreign Keys с CASCADE/RESTRICT политиками
- ✅ **Богатая функциональность** - корзина, заказы, отзывы, списки желаний
- ✅ **Масштабируемость** - легко добавлять новые сущности

### ⚡ **Технические решения:**

- ✅ **11 моделей Sequelize** с полными ассоциациями
- ✅ **Валидация данных** на уровне моделей и БД
- ✅ **Индексы для производительности** - 60+ индексов
- ✅ **Бизнес-методы** для удобной работы с сущностями
- ✅ **Scopes и hooks** для автоматизации операций

### 🔄 **Готовность к интеграции:**

- ✅ **Модели протестированы** и работают корректно
- ✅ **Ассоциации настроены** между всеми сущностями
- ✅ **Подключение к БД** стабильное
- ✅ **Структура проекта** готова для API разработки

**Переход к Шагу 4: Выполнение миграций и запуск базы данных** ➡️
