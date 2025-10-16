# 📚 Упрощенная схема интернет-магазина книг

## 🎯 Описание проекта
Это упрощенная версия интернет-магазина книг с базовой функциональностью:
- ✅ Каталог книг с авторами, категориями и издательствами
- ✅ Пользователи с ролями
- ✅ Корзина покупок
- ❌ Убраны: заказы, отзывы, список желаний

## 🗄️ Структура базы данных (7 таблиц)

### **Основные сущности:**
1. **users** - пользователи с ролями (customer, admin, manager)
2. **categories** - иерархические категории книг
3. **publishers** - издательства
4. **authors** - авторы книг
5. **books** - каталог книг

### **Связующие таблицы:**
6. **book_authors** - связь книг и авторов (many-to-many)
7. **cart_items** - корзина покупок

## 📊 Схема для dbdiagram.io
Файл `database-schema.dbml` содержит полную схему в формате DBML для визуализации на [dbdiagram.io](https://dbdiagram.io/)

## 🚀 Быстрый запуск

```bash
# 1. Переход в папку проекта
cd "lab_2_sequelize 1-3-2"

# 2. Установка зависимостей
npm install

# 3. Создание базы данных
npx sequelize-cli db:create

# 4. Выполнение миграций (создание таблиц)
npx sequelize-cli db:migrate

# 5. Заполнение тестовыми данными
npx sequelize-cli db:seed:all

# 6. Тестирование моделей
node test-models.js
```

## 📁 Структура проекта
```
lab_2_sequelize 1-3-2/
├── config/
│   └── config.json              # Настройки БД
├── migrations/                  # 7 миграций
│   ├── 20241014120001-create-users.js
│   ├── 20241014120002-create-categories.js
│   ├── 20241014120003-create-publishers.js
│   ├── 20241014120004-create-authors.js
│   ├── 20241014120005-create-books.js
│   ├── 20241014120006-create-book-authors.js
│   └── 20241014120010-create-cart-items.js
├── models/                      # 7 моделей Sequelize
│   ├── User.js
│   ├── Category.js
│   ├── Publisher.js
│   ├── Author.js
│   ├── Book.js
│   ├── BookAuthor.js
│   ├── CartItem.js
│   └── index.js
├── seeders/
│   └── 20241014120001-demo-data.js  # Тестовые данные
├── database-schema.dbml         # Схема для dbdiagram.io
├── test-models.js              # Тест моделей
└── README.md                   # Этот файл
```

## 🔗 Основные связи
- `categories.parent_id → categories.id` (иерархия)
- `books.category_id → categories.id` (один ко многим)
- `books.publisher_id → publishers.id` (один ко многим)
- `book_authors.book_id → books.id` (многие ко многим)
- `book_authors.author_id → authors.id` (многие ко многим)
- `cart_items.user_id → users.id` (один ко многим)
- `cart_items.book_id → books.id` (один ко многим)

## 💾 Тестовые данные включают:
- **5 категорий** (включая иерархию)
- **3 издательства** (АСТ, Эксмо, Азбука-Аттикус)
- **6 авторов** (классики русской и зарубежной литературы)
- **6 книг** (с полной информацией)
- **3 пользователя** (admin, manager, customer)
- **2 позиции в корзине** пользователя

## 🛠️ Следующие шаги:
1. Создание API контроллеров
2. Настройка Express сервера
3. Создание фронтенда
4. Добавление аутентификации