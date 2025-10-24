# Рефакторинг Middleware - Вынос валидации в отдельные файлы

## Дата: 19 октября 2025 г.

## Проблема:

Все middleware для валидации располагались непосредственно в файле роутов `src/routes/authors.js`, что делало файл громоздким и нарушало принцип разделения ответственности.

## Решение:

Создана модульная структура middleware с разделением общей и специфичной логики валидации.

## Созданные файлы:

### 1. ✅ `src/middleware/commonValidation.js`

**Назначение:** Общие middleware для валидации, которые могут использоваться в разных роутах

**Содержит:**

- `validatePagination` - валидация параметров пагинации (page, limit)
- `validateSearch` - валидация поискового запроса
- `validatePaginationAndSearch` - комбинированная валидация

```javascript
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Номер страницы должен быть положительным числом"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Лимит должен быть от 1 до 100"),
];
```

### 2. ✅ `src/middleware/authorsValidation.js`

**Назначение:** Специфичные middleware для валидации авторов

**Содержит:**

- `validateAuthorId` - валидация ID автора
- `validateCreateAuthor` - валидация при создании автора
- `validateUpdateAuthor` - валидация при обновлении автора
- `validateAuthorsPagination` - валидация пагинации + фильтр по типу автора

```javascript
const validateCreateAuthor = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Имя автора обязательно")
    .isLength({ min: 1, max: 100 })
    .withMessage("Имя автора должно быть от 1 до 100 символов"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Биография не должна превышать 2000 символов"),

  body("authorType")
    .optional()
    .isIn(["russian", "foreign"])
    .withMessage("Тип автора должен быть russian или foreign"),
];
```

## Обновленные файлы:

### ✅ `src/routes/authors.js`

**Изменения:**

- Убраны все определения middleware (более 80 строк кода)
- Добавлены импорты из отдельных файлов
- Роуты стали чище и читабельнее

**До:**

```javascript
const { body, param, query } = require("express-validator");
// 80+ строк middleware определений...
```

**После:**

```javascript
const {
  validateAuthorId,
  validateCreateAuthor,
  validateUpdateAuthor,
  validateAuthorsPagination,
} = require("../middleware/authorsValidation");
```

## Преимущества рефакторинга:

### 🎯 Разделение ответственности

- Роуты отвечают только за маршрутизацию
- Middleware вынесены в отдельные модули
- Логика валидации изолирована

### 🔄 Переиспользование

- Общие middleware можно использовать в других роутах
- Валидация пагинации стандартизирована
- Избежание дублирования кода

### 📖 Читабельность

- Файл роутов стал значительно короче и понятнее
- Легче найти и изменить конкретную валидацию
- Улучшена структура проекта

### 🧪 Тестируемость

- Middleware можно тестировать независимо
- Проще мокать валидацию в тестах
- Лучшая изоляция логики

## Структура файлов после рефакторинга:

```
src/
├── middleware/
│   ├── auth.js                    # Аутентификация (существовал)
│   ├── commonValidation.js        # Общая валидация (новый)
│   └── authorsValidation.js       # Валидация авторов (новый)
├── routes/
│   └── authors.js                 # Роуты авторов (обновлен)
└── controllers/
    └── authorsController.js       # Контроллер (без изменений)
```

## Использование в роутах:

```javascript
// Получение списка авторов с фильтрацией
router.get("/", validateAuthorsPagination, authorsController.getAuthors);

// Создание автора с полной валидацией
router.post(
  "/",
  [authenticateToken, requireAdmin, ...validateCreateAuthor],
  authorsController.createAuthor
);
```

## Возможности для расширения:

1. **Другие сущности:** Аналогично можно создать `booksValidation.js`, `categoriesValidation.js`
2. **Общие паттерны:** Добавить в `commonValidation.js` валидацию для дат, email, телефонов
3. **Композиция:** Создавать сложные валидации из простых блоков

## Статус: ✅ ЗАВЕРШЕНО

Middleware успешно вынесены в отдельные файлы, код стал более модульным и поддерживаемым!
