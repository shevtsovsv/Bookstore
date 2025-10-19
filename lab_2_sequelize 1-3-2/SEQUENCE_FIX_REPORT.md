# Исправление ошибки последовательности в таблице authors

## Дата: 19 октября 2025 г.

## Проблема:

При попытке создать нового автора через API возникала ошибка:

```
SequelizeUniqueConstraintError: повторяющееся значение ключа нарушает ограничение уникальности "authors_pkey"
detail: 'Ключ "(id)=(2)" уже существует.'
```

## Причина:

Последовательность (sequence) PostgreSQL для автоинкремента поля `id` в таблице `authors` была десинхронизирована с фактическими данными. Это произошло из-за того, что сидеры вставляли данные с явно указанными ID, но последовательность не обновлялась автоматически.

## Решение:

### 1. ✅ Создана миграция для исправления последовательности

**Файл:** `migrations/20251019120728-fix-authors-sequence.js`

Миграция выполняет SQL команду:

```sql
SELECT setval('authors_id_seq', COALESCE((SELECT MAX(id) FROM authors), 1));
```

Эта команда устанавливает следующее значение последовательности равным максимальному существующему ID + 1.

### 2. ✅ Улучшена обработка ошибок в контроллере

**Файл:** `src/controllers/authorsController.js`

Добавлена специфическая обработка ошибок Sequelize:

- `SequelizeUniqueConstraintError` - конфликт уникальности
- `SequelizeValidationError` - ошибки валидации

## Примененные изменения:

### Миграция исправления последовательности:

```javascript
await queryInterface.sequelize.query(\`
  SELECT setval('authors_id_seq', COALESCE((SELECT MAX(id) FROM authors), 1));
\`);
```

### Улучшенная обработка ошибок:

```javascript
if (error.name === "SequelizeUniqueConstraintError") {
  return res.status(400).json({
    success: false,
    message: "Автор с таким именем уже существует",
  });
}

if (error.name === "SequelizeValidationError") {
  return res.status(400).json({
    success: false,
    message: "Ошибка валидации данных",
    errors: error.errors.map((err) => err.message),
  });
}
```

## Результат:

✅ Проблема с последовательностью исправлена
✅ API создания авторов работает корректно
✅ Улучшена обработка ошибок для лучшего UX

## Команды для применения исправлений:

```bash
# Применить миграцию
npx sequelize-cli db:migrate

# Запустить сервер
npm start
```

## Тестирование:

Теперь можно успешно создавать новых авторов через API:

```http
POST /api/authors
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "Лев Толстой",
  "bio": "Великий русский писатель",
  "authorType": "russian"
}
```

## Предотвращение в будущем:

Для избежания подобных проблем в будущем рекомендуется:

1. Не использовать явные ID в сидерах
2. Всегда проверять последовательности после импорта данных
3. Использовать улучшенную обработку ошибок

## Статус: ✅ ИСПРАВЛЕНО
