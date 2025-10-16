# 💻 Команды для продолжения разработки

## 🚀 Запуск проекта

```bash
cd "c:\Users\tepi_\YandexDisk\0 Программирование\Анастасия Варганова\lab_2_sequelize"
npm run dev
```

## 📊 Следующие команды для Шага 2

```bash
# Создание миграций
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli migration:generate --name create-books
npx sequelize-cli migration:generate --name create-orders

# Создание моделей
npx sequelize-cli model:generate --name User --attributes email:string,password_hash:string
npx sequelize-cli model:generate --name Book --attributes title:string,author:string,genre:string,price:decimal,description:text,popularity:integer,stock:integer,image:string
npx sequelize-cli model:generate --name Order --attributes user_id:integer,book_id:integer,quantity:integer,total_price:decimal

# Запуск миграций
npx sequelize-cli db:create
npx sequelize-cli db:migrate
```

## 🔧 Полезные команды

```bash
# Откат миграций
npx sequelize-cli db:migrate:undo

# Заполнение данными
npx sequelize-cli db:seed:all

# Перезапуск сервера
rs (в терминале nodemon)
```

## 📝 Структура файлов для продолжения

- `src/models/` - Sequelize модели
- `src/controllers/` - API контроллеры
- `src/routes/` - Маршруты API
- `src/validators/` - Валидация данных
- `migrations/` - Миграции БД

## 🎯 Приоритеты следующей сессии

1. Завершить проектирование схемы БД
2. Создать и запустить миграции
3. Настроить модели с валидацией
4. Начать API для аутентификации
