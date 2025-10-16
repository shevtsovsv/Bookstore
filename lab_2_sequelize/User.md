# Модель пользователя (User)

**Файл:** `models/User.js`  
**Тип:** Sequelize Model  
**Таблица:** `users`

## Описание

Модель `User` представляет пользователей интернет-магазина книг и обеспечивает все операции, связанные с аутентификацией, авторизацией и управлением профилем пользователя. Модель включает методы для безопасной работы с паролями, управления историей заказов и получения статистики покупок.

## Структура модели

### Поля данных

| Поле             | Тип         | Описание                   | Валидация                            |
| ---------------- | ----------- | -------------------------- | ------------------------------------ |
| `id`             | INTEGER     | Уникальный идентификатор   | PRIMARY KEY, AUTO_INCREMENT          |
| `email`          | STRING(255) | Электронная почта          | UNIQUE, email format, 5-255 символов |
| `password_hash`  | STRING(255) | Хеш пароля (bcrypt)        | NOT NULL                             |
| `first_name`     | STRING(100) | Имя пользователя           | 1-100 символов (опционально)         |
| `last_name`      | STRING(100) | Фамилия пользователя       | 1-100 символов (опционально)         |
| `orders_history` | JSONB       | История заказов            | Массив объектов заказов              |
| `created_at`     | DATE        | Дата регистрации           | AUTO_SET                             |
| `updated_at`     | DATE        | Дата последнего обновления | AUTO_UPDATE                          |

### Детальное описание полей

#### `email` - Электронная почта

```javascript
email: {
  type: DataTypes.STRING(255),
  allowNull: false,
  unique: {
    name: "users_email_unique",
    msg: "Пользователь с таким email уже существует",
  },
  validate: {
    isEmail: { msg: "Некорректный формат email" },
    len: { args: [5, 255], msg: "Email должен содержать от 5 до 255 символов" }
  }
}
```

#### `orders_history` - История заказов (JSONB)

```javascript
orders_history: {
  type: DataTypes.JSONB,
  allowNull: false,
  defaultValue: [],
  validate: {
    isValidOrdersHistory(value) {
      // Проверка структуры каждого заказа
    }
  }
}
```

**Структура заказа в истории:**

```json
{
  "order_id": "uuid-v4",
  "book_id": 1,
  "title": "Название книги",
  "quantity": 1,
  "price": 899.99,
  "total": 899.99,
  "date": "2025-10-14T12:00:00.000Z"
}
```

## Методы экземпляра

### `checkPassword(password)` - Проверка пароля

```javascript
async checkPassword(password) {
  return await bcrypt.compare(password, this.password_hash);
}
```

- **Назначение:** Безопасная проверка пароля пользователя
- **Параметры:** `password` (string) - пароль для проверки
- **Возвращает:** `Promise<boolean>` - результат сравнения
- **Использование:** Аутентификация при входе в систему

### `addOrder(orderData)` - Добавление заказа

```javascript
async addOrder(orderData) {
  const order = {
    order_id: require("crypto").randomUUID(),
    book_id: orderData.book_id,
    title: orderData.title,
    quantity: orderData.quantity,
    price: parseFloat(orderData.price),
    total: parseFloat(orderData.total),
    date: new Date().toISOString(),
  };

  const currentOrders = this.orders_history || [];
  currentOrders.push(order);
  this.orders_history = currentOrders;
  await this.save();
}
```

- **Назначение:** Добавление нового заказа в историю пользователя
- **Параметры:** `orderData` (Object) - данные заказа
- **Автоматически генерирует:** UUID заказа, текущую дату
- **Обновляет:** Поле `orders_history` и сохраняет в БД

### `getTotalSpent()` - Общая сумма покупок

```javascript
getTotalSpent() {
  if (!this.orders_history || !Array.isArray(this.orders_history)) {
    return 0;
  }
  return this.orders_history.reduce((sum, order) => {
    return sum + (parseFloat(order.total) || 0);
  }, 0);
}
```

- **Назначение:** Вычисление общей суммы всех покупок пользователя
- **Возвращает:** `number` - сумма в рублях
- **Использование:** Статистика, программы лояльности

### `getOrdersCount()` - Количество заказов

```javascript
getOrdersCount() {
  return this.orders_history ? this.orders_history.length : 0;
}
```

- **Назначение:** Подсчет общего количества заказов пользователя
- **Возвращает:** `number` - количество заказов
- **Использование:** Аналитика, рейтинги пользователей

## Статические методы (класса)

### `createUser(userData)` - Создание пользователя

```javascript
User.createUser = async function (userData) {
  const { email, password, first_name, last_name } = userData;

  // Валидация пароля
  if (!password || password.length < 8) {
    throw new Error("Пароль должен содержать минимум 8 символов");
  }

  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    throw new Error(
      "Пароль должен содержать заглавные, строчные буквы и цифры"
    );
  }

  // Хеширование и создание
  const saltRounds = 12;
  const password_hash = await bcrypt.hash(password, saltRounds);

  return await User.create({
    email,
    password_hash,
    first_name,
    last_name,
    orders_history: [],
  });
};
```

- **Назначение:** Безопасное создание нового пользователя с валидацией
- **Валидация пароля:** Минимум 8 символов, заглавные/строчные буквы + цифры
- **Автоматически:** Хеширует пароль с солью (saltRounds: 12)

### `findByEmail(email)` - Поиск по email

```javascript
User.findByEmail = async function (email) {
  return await User.findOne({
    where: { email: email.toLowerCase() },
  });
};
```

- **Назначение:** Поиск пользователя по электронной почте
- **Особенности:** Автоматическое приведение к нижнему регистру
- **Использование:** Аутентификация, проверка уникальности

### `authenticate(email, password)` - Аутентификация

```javascript
User.authenticate = async function (email, password) {
  const user = await User.findByEmail(email);
  if (user && (await user.checkPassword(password))) {
    return user;
  }
  return null;
};
```

- **Назначение:** Полная аутентификация пользователя
- **Возвращает:** `User` при успехе, `null` при неудаче
- **Использование:** Вход в систему

## Hooks (хуки жизненного цикла)

### `beforeCreate` - Хеширование при создании

```javascript
beforeCreate: async (user) => {
  if (user.dataValues.password) {
    const saltRounds = 12;
    user.password_hash = await bcrypt.hash(
      user.dataValues.password,
      saltRounds
    );
    delete user.dataValues.password; // Удаляем plain password
  }
};
```

### `beforeUpdate` - Хеширование при обновлении

```javascript
beforeUpdate: async (user) => {
  if (user.changed("password") && user.dataValues.password) {
    const saltRounds = 12;
    user.password_hash = await bcrypt.hash(
      user.dataValues.password,
      saltRounds
    );
    delete user.dataValues.password; // Удаляем plain password
  }
};
```

## Индексы

### 1. Уникальный индекс email

```javascript
{
  unique: true,
  fields: ["email"],
  name: "users_email_unique_idx"
}
```

- **Назначение:** Быстрый поиск по email, гарантия уникальности

### 2. Индекс даты создания

```javascript
{
  fields: ["created_at"],
  name: "users_created_at_idx"
}
```

- **Назначение:** Сортировка пользователей по дате регистрации

## Безопасность

### Хеширование паролей

- **Алгоритм:** bcrypt с солью
- **Сложность:** 12 раундов (высокая безопасность)
- **Автоматизация:** Через хуки beforeCreate/beforeUpdate

### Валидация паролей

- **Минимальная длина:** 8 символов
- **Требования:** Заглавные + строчные буквы + цифры
- **Регулярное выражение:** `/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/`

## Примеры использования

### Регистрация нового пользователя

```javascript
try {
  const user = await User.createUser({
    email: "user@example.com",
    password: "SecurePass123",
    first_name: "Иван",
    last_name: "Петров",
  });
  console.log("Пользователь создан:", user.id);
} catch (error) {
  console.error("Ошибка регистрации:", error.message);
}
```

### Аутентификация

```javascript
const user = await User.authenticate("user@example.com", "SecurePass123");
if (user) {
  console.log("Вход выполнен для пользователя:", user.email);
} else {
  console.log("Неверные учетные данные");
}
```

### Добавление заказа

```javascript
await user.addOrder({
  book_id: 1,
  title: "Маленький принц",
  quantity: 1,
  price: 899.99,
  total: 899.99,
});

console.log("Общая сумма покупок:", user.getTotalSpent());
console.log("Количество заказов:", user.getOrdersCount());
```

### Получение истории заказов

```javascript
const user = await User.findByPk(1);
const history = user.orders_history;

history.forEach((order) => {
  console.log(`Заказ ${order.order_id}: ${order.title} - ${order.total}₽`);
});
```

## Связи с другими моделями

### Через JSONB (orders_history)

- **Книги:** ID книг хранятся в истории заказов
- **Заказы:** Полная информация о покупках
- **Преимущества:** Денормализация для быстрого доступа

### Виртуальные связи

```javascript
// Можно добавить при необходимости
static associate(models) {
  // User.hasMany(models.Order, { foreignKey: 'user_id' });
}
```

## Конфигурация модели

### Timestamps

```javascript
{
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at"
}
```

### Название таблицы

```javascript
{
  tableName: "users",
  modelName: "User"
}
```

## Производительность

### Оптимизации

- **Индексы:** На критичные поля (email, created_at)
- **JSONB:** Эффективное хранение истории заказов
- **Валидация:** На уровне модели для целостности данных

### Рекомендации

- Использовать `findByEmail()` вместо прямых запросов
- Применять `authenticate()` для проверки учетных данных
- Регулярно анализировать историю заказов для аналитики

## Соответствие требованиям

- ✅ **Безопасность:** Bcrypt хеширование, валидация паролей
- ✅ **Производительность:** Оптимальные индексы
- ✅ **Гибкость:** JSONB для истории заказов
- ✅ **Целостность:** Комплексная валидация данных
- ✅ **Удобство:** Методы высокого уровня для типовых операций
- ✅ **Аудит:** Временные метки для отслеживания активности
