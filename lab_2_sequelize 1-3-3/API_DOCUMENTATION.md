# Bookstore REST API

Полнофункциональный REST API для интернет-магазина книг с аутентификацией JWT и ролевой моделью доступа.

## 🚀 Быстрый старт

### Установка и запуск

```bash
# Установка зависимостей
npm install

# Настройка базы данных
npm run db:setup

# Запуск сервера
npm start
```

Сервер будет доступен по адресу: `http://localhost:3000`

### Информация об API
```
GET /api
```
Получение полного описания всех доступных эндпоинтов.

## 📚 Структура API

### Аутентификация (`/api/auth`)

#### Регистрация пользователя
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123",
  "firstName": "Имя",
  "lastName": "Фамилия"
}
```

#### Вход в систему
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "Успешная авторизация",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "firstName": "Имя",
      "lastName": "Фамилия",
      "role": "user"
    }
  }
}
```

#### Профиль пользователя
```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Книги (`/api/books`)

#### Получение списка книг
```http
GET /api/books?page=1&limit=20&search=javascript&category=1&minPrice=500&maxPrice=2000
```

**Параметры запроса:**
- `page` - номер страницы (по умолчанию: 1)
- `limit` - количество элементов на странице (по умолчанию: 20, максимум: 100)
- `search` - поисковый запрос по названию, описанию, ISBN
- `category` - ID категории
- `publisher` - ID издателя
- `author` - ID автора
- `minPrice`, `maxPrice` - диапазон цен
- `year` - год издания
- `inStock` - только товары в наличии (true/false)

#### Получение книги по ID
```http
GET /api/books/:id
```

#### Создание книги (только админ)
```http
POST /api/books
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "title": "Изучаем JavaScript",
  "description": "Подробное руководство по JavaScript",
  "price": 1500.00,
  "categoryId": 1,
  "publisherId": 1,
  "authorIds": [1, 2],
  "publicationYear": 2024,
  "isbn": "978-5-123456-78-9",
  "pages": 450,
  "stock": 10,
  "image": "https://example.com/book-cover.jpg"
}
```

### Категории (`/api/categories`)

#### Получение всех категорий
```http
GET /api/categories
```

Возвращает иерархическую структуру категорий с подкатегориями.

#### Получение категории по ID
```http
GET /api/categories/:id
```

#### Получение книг категории
```http
GET /api/categories/:id/books?page=1&limit=10
```

#### Создание категории (только админ)
```http
POST /api/categories
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Веб-разработка",
  "description": "Книги по веб-разработке",
  "parentId": 1
}
```

### Издатели (`/api/publishers`)

#### Получение списка издателей
```http
GET /api/publishers?page=1&limit=20&search=питер
```

#### Получение издателя по ID
```http
GET /api/publishers/:id
```

#### Получение книг издателя
```http
GET /api/publishers/:id/books?page=1&limit=10
```

#### Создание издателя (только админ)
```http
POST /api/publishers
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "name": "Новое Издательство",
  "description": "Современное техническое издательство",
  "address": "г. Москва, ул. Примерная, д. 1",
  "phone": "+7 (495) 123-45-67",
  "email": "info@publisher.ru",
  "website": "https://publisher.ru"
}
```

### Авторы (`/api/authors`)

#### Получение списка авторов
```http
GET /api/authors?page=1&limit=20&search=иванов
```

#### Получение автора по ID
```http
GET /api/authors/:id
```

#### Получение книг автора
```http
GET /api/authors/:id/books?page=1&limit=10
```

#### Создание автора (только админ)
```http
POST /api/authors
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "firstName": "Иван",
  "lastName": "Петров",
  "birthDate": "1985-03-15",
  "deathDate": null,
  "nationality": "Русский",
  "biography": "Известный программист и автор технических книг"
}
```

### Корзина (`/api/cart`)

#### Получение корзины пользователя
```http
GET /api/cart
Authorization: Bearer <token>
```

#### Добавление книги в корзину
```http
POST /api/cart
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookId": 1,
  "quantity": 2
}
```

#### Обновление количества в корзине
```http
PUT /api/cart/:cartItemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 3
}
```

#### Удаление товара из корзины
```http
DELETE /api/cart/:cartItemId
Authorization: Bearer <token>
```

#### Очистка корзины
```http
DELETE /api/cart
Authorization: Bearer <token>
```

## 🔐 Аутентификация и авторизация

### JWT Токены
API использует JWT токены для аутентификации. После успешного входа в систему вы получите токен, который необходимо передавать в заголовке `Authorization`:

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Роли пользователей
- **user** - обычный пользователь (доступ к каталогу и корзине)
- **admin** - администратор (полный доступ ко всем операциям)

### Требования к паролям
- Минимум 8 символов
- Хотя бы одна заглавная буква
- Хотя бы одна цифра
- Только английские символы и цифры

## 📄 Формат ответов

### Успешный ответ
```json
{
  "success": true,
  "data": {
    // данные ответа
  },
  "message": "Сообщение (опционально)",
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 100,
    "itemsPerPage": 20,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Ответ с ошибкой
```json
{
  "success": false,
  "message": "Описание ошибки",
  "errors": [
    {
      "field": "email",
      "message": "Некорректный формат email"
    }
  ]
}
```

## 📊 Коды состояния HTTP

- `200` - Успешный запрос
- `201` - Ресурс успешно создан
- `400` - Ошибка валидации данных
- `401` - Требуется аутентификация
- `403` - Недостаточно прав доступа
- `404` - Ресурс не найден
- `500` - Внутренняя ошибка сервера

## 🛠 Валидация данных

API включает комплексную валидацию входящих данных:

### Книги
- `title` - обязательно, 1-200 символов
- `price` - положительное число с точностью до 2 знаков после запятой
- `isbn` - формат ISBN-10 или ISBN-13
- `publicationYear` - год от 1000 до текущего года
- `pages` - положительное число
- `stock` - неотрицательное число

### Пользователи
- `email` - валидный email адрес
- `password` - соответствует требованиям безопасности
- `firstName`, `lastName` - 1-50 символов, только буквы

### Авторы
- `firstName`, `lastName` - 1-50 символов, буквы, пробелы, дефисы
- `birthDate`, `deathDate` - формат YYYY-MM-DD, логическая проверка дат
- `nationality` - только буквы и пробелы

## 🔍 Поиск и фильтрация

### Поиск по книгам
```http
GET /api/books?search=javascript&category=1&minPrice=500&maxPrice=2000&inStock=true
```

### Поиск по авторам
```http
GET /api/authors?search=толстой
```

Поиск поддерживает:
- Частичное совпадение (case-insensitive)
- Поиск по нескольким полям одновременно
- Комбинирование с фильтрами и пагинацией

## 🧪 Тестирование API

### Использование curl
```bash
# Регистрация
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456","firstName":"Тест","lastName":"Пользователь"}'

# Вход
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123456"}'

# Получение книг
curl -X GET "http://localhost:3000/api/books?page=1&limit=5"

# Добавление в корзину (замените TOKEN)
curl -X POST http://localhost:3000/api/cart \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"bookId":1,"quantity":1}'
```

### Тестовый гайд
Запустите файл `test-api-guide.js` для получения подробных примеров всех запросов:
```bash
node test-api-guide.js
```

## 🗄 База данных

### Структура таблиц
- `users` - пользователи системы
- `categories` - категории книг (с поддержкой иерархии)
- `publishers` - издательства
- `authors` - авторы
- `books` - книги
- `book_authors` - связь книги-авторы (многие-ко-многим)
- `cart_items` - элементы корзины пользователей

### Связи
- Категории поддерживают вложенность (parent_id)
- Книги могут иметь нескольких авторов
- Корзина привязана к конкретному пользователю
- Все внешние ключи имеют каскадные ограничения

## 🔧 Конфигурация

Основные настройки в файле `.env`:
```
NODE_ENV=development
PORT=3000
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d

# База данных PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bookstore
DB_USER=postgres
DB_PASSWORD=password
```

## 📝 Логирование

API включает логирование:
- Ошибки сервера записываются в консоль
- Неудачные попытки аутентификации
- Операции администратора
- Ошибки валидации данных

## 🚀 Развертывание

### Production
1. Настройте переменные окружения
2. Убедитесь, что `NODE_ENV=production`
3. Настройте базу данных PostgreSQL
4. Запустите миграции: `npm run db:migrate`
5. Заполните тестовые данные: `npm run db:seed`
6. Запустите сервер: `npm start`

### Docker (опционально)
```dockerfile
FROM node:18
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

---

## 📞 Поддержка

При возникновении проблем:
1. Проверьте логи сервера
2. Убедитесь в корректности JWT токена
3. Проверьте формат входящих данных
4. Используйте эндпоинт `/api/health` для диагностики

**Автор:** Анастасия Варганова  
**Версия API:** 1.0  
**Последнее обновление:** 2024