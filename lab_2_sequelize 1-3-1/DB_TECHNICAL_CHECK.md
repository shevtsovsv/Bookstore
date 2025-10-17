# Техническая проверка базы данных

## 🔍 Детальная проверка соответствия требованиям

### 1. Проверка поля популярности

```sql
-- Проверяем структуру таблицы books
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'books' AND column_name = 'popularity';
```

### 2. Проверка валидации email

```javascript
// В модели User.js:
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: true,
  validate: {
    isEmail: true,     // ✅ Валидация email
    notEmpty: true,    // ✅ Не пустое поле
  },
}
```

### 3. Проверка индексов для производительности

```sql
-- Индексы в таблице books для быстрого поиска
CREATE INDEX books_popularity_idx ON books(popularity);
CREATE INDEX books_stock_idx ON books(stock);
CREATE INDEX books_category_stock_idx ON books(category_id, stock);
```

### 4. Проверка связи автор-книга

```javascript
// Many-to-Many через book_authors
Book.belongsToMany(Author, {
  through: models.BookAuthor,
  foreignKey: "book_id",
  otherKey: "author_id",
  as: "authors",
});
```

### 5. Методы для увеличения популярности

```javascript
async decreaseStock(quantity) {
  if (this.stock < quantity) {
    throw new Error("Недостаточно товара на складе");
  }
  this.stock -= quantity;
  this.popularity += quantity;  // ✅ Увеличиваем популярность
  return await this.save();
}
```

## ✅ Все требования к БД выполнены!
