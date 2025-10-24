/**
 * Тестирование REST API Bookstore
 * Этот файл содержит примеры запросов ко всем API эндпоинтам
 * 
 * Для тестирования:
 * 1. Запустите сервер: node server.js
 * 2. Используйте Postman, curl или другой HTTP клиент
 * 3. Сначала зарегистрируйтесь и получите токен
 * 4. Используйте токен для авторизованных запросов
 */

const BASE_URL = 'http://localhost:3000';

// Тестовые данные
const testData = {
  user: {
    email: 'test@example.com',
    password: 'Test123456',
    firstName: 'Тестовый',
    lastName: 'Пользователь'
  },
  admin: {
    email: 'admin@example.com',
    password: 'Admin123456',
    firstName: 'Админ',
    lastName: 'Системы'
  }
};

console.log('=== BOOKSTORE API ТЕСТИРОВАНИЕ ===\n');

console.log('1. ОСНОВНАЯ ИНФОРМАЦИЯ');
console.log(`GET ${BASE_URL}/api`);
console.log('Описание: Получение информации о всех доступных API эндпоинтах\n');

console.log('2. ПРОВЕРКА РАБОТОСПОСОБНОСТИ');
console.log(`GET ${BASE_URL}/api/health`);
console.log('Описание: Проверка статуса сервера\n');

console.log('=== АУТЕНТИФИКАЦИЯ ===\n');

console.log('3. РЕГИСТРАЦИЯ ПОЛЬЗОВАТЕЛЯ');
console.log(`POST ${BASE_URL}/api/auth/register`);
console.log('Body:', JSON.stringify(testData.user, null, 2));
console.log('Описание: Регистрация нового пользователя\n');

console.log('4. ВХОД В СИСТЕМУ');
console.log(`POST ${BASE_URL}/api/auth/login`);
console.log('Body:', JSON.stringify({
  email: testData.user.email,
  password: testData.user.password
}, null, 2));
console.log('Описание: Получение JWT токена для авторизации\n');

console.log('5. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ');
console.log(`GET ${BASE_URL}/api/auth/profile`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Описание: Получение информации о текущем пользователе\n');

console.log('=== КНИГИ ===\n');

console.log('6. СПИСОК КНИГ');
console.log(`GET ${BASE_URL}/api/books?page=1&limit=10&search=программирование`);
console.log('Описание: Получение списка книг с фильтрами\n');

console.log('7. КНИГА ПО ID');
console.log(`GET ${BASE_URL}/api/books/1`);
console.log('Описание: Получение подробной информации о книге\n');

console.log('8. ПОИСК КНИГ');
console.log(`GET ${BASE_URL}/api/books/search?q=JavaScript&category=1&minPrice=500&maxPrice=2000`);
console.log('Описание: Расширенный поиск книг\n');

console.log('9. СОЗДАНИЕ КНИГИ (ТОЛЬКО АДМИН)');
console.log(`POST ${BASE_URL}/api/books`);
console.log('Headers: Authorization: Bearer <ADMIN_TOKEN>');
console.log('Body:', JSON.stringify({
  title: 'Изучаем JavaScript',
  description: 'Полное руководство по современному JavaScript',
  price: 1500.00,
  categoryId: 1,
  publisherId: 1,
  authorIds: [1, 2],
  publicationYear: 2024,
  isbn: '978-5-123456-78-9',
  pages: 450,
  stock: 10
}, null, 2));
console.log('Описание: Создание новой книги\n');

console.log('=== КАТЕГОРИИ ===\n');

console.log('10. СПИСОК КАТЕГОРИЙ');
console.log(`GET ${BASE_URL}/api/categories`);
console.log('Описание: Получение иерархической структуры категорий\n');

console.log('11. КАТЕГОРИЯ ПО ID');
console.log(`GET ${BASE_URL}/api/categories/1`);
console.log('Описание: Получение информации о категории\n');

console.log('12. КНИГИ КАТЕГОРИИ');
console.log(`GET ${BASE_URL}/api/categories/1/books?page=1&limit=5`);
console.log('Описание: Получение книг определённой категории\n');

console.log('13. СОЗДАНИЕ КАТЕГОРИИ (ТОЛЬКО АДМИН)');
console.log(`POST ${BASE_URL}/api/categories`);
console.log('Headers: Authorization: Bearer <ADMIN_TOKEN>');
console.log('Body:', JSON.stringify({
  name: 'Веб-разработка',
  description: 'Книги по созданию веб-приложений',
  parentId: 1
}, null, 2));
console.log('Описание: Создание новой категории\n');

console.log('=== ИЗДАТЕЛИ ===\n');

console.log('14. СПИСОК ИЗДАТЕЛЕЙ');
console.log(`GET ${BASE_URL}/api/publishers?page=1&limit=10&search=питер`);
console.log('Описание: Получение списка издательств\n');

console.log('15. ИЗДАТЕЛЬ ПО ID');
console.log(`GET ${BASE_URL}/api/publishers/1`);
console.log('Описание: Получение информации об издательстве\n');

console.log('16. КНИГИ ИЗДАТЕЛЯ');
console.log(`GET ${BASE_URL}/api/publishers/1/books?page=1&limit=5`);
console.log('Описание: Получение книг определённого издательства\n');

console.log('17. СОЗДАНИЕ ИЗДАТЕЛЯ (ТОЛЬКО АДМИН)');
console.log(`POST ${BASE_URL}/api/publishers`);
console.log('Headers: Authorization: Bearer <ADMIN_TOKEN>');
console.log('Body:', JSON.stringify({
  name: 'Новое Издательство',
  description: 'Современное техническое издательство',
  address: 'г. Москва, ул. Примерная, д. 1',
  phone: '+7 (495) 123-45-67',
  email: 'info@newpublisher.ru',
  website: 'https://newpublisher.ru'
}, null, 2));
console.log('Описание: Создание нового издательства\n');

console.log('=== АВТОРЫ ===\n');

console.log('18. СПИСОК АВТОРОВ');
console.log(`GET ${BASE_URL}/api/authors?page=1&limit=10&search=иванов`);
console.log('Описание: Получение списка авторов\n');

console.log('19. АВТОР ПО ID');
console.log(`GET ${BASE_URL}/api/authors/1`);
console.log('Описание: Получение информации об авторе\n');

console.log('20. КНИГИ АВТОРА');
console.log(`GET ${BASE_URL}/api/authors/1/books?page=1&limit=5`);
console.log('Описание: Получение книг определённого автора\n');

console.log('21. СОЗДАНИЕ АВТОРА (ТОЛЬКО АДМИН)');
console.log(`POST ${BASE_URL}/api/authors`);
console.log('Headers: Authorization: Bearer <ADMIN_TOKEN>');
console.log('Body:', JSON.stringify({
  firstName: 'Иван',
  lastName: 'Петров',
  birthDate: '1985-03-15',
  nationality: 'Русский',
  biography: 'Известный программист и автор технических книг'
}, null, 2));
console.log('Описание: Создание нового автора\n');

console.log('=== КОРЗИНА ===\n');

console.log('22. ПОЛУЧЕНИЕ КОРЗИНЫ');
console.log(`GET ${BASE_URL}/api/cart`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Описание: Получение содержимого корзины пользователя\n');

console.log('23. ДОБАВЛЕНИЕ В КОРЗИНУ');
console.log(`POST ${BASE_URL}/api/cart`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Body:', JSON.stringify({
  bookId: 1,
  quantity: 2
}, null, 2));
console.log('Описание: Добавление книги в корзину\n');

console.log('24. ОБНОВЛЕНИЕ КОЛИЧЕСТВА');
console.log(`PUT ${BASE_URL}/api/cart/1`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Body:', JSON.stringify({
  quantity: 3
}, null, 2));
console.log('Описание: Изменение количества товара в корзине\n');

console.log('25. УДАЛЕНИЕ ИЗ КОРЗИНЫ');
console.log(`DELETE ${BASE_URL}/api/cart/1`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Описание: Удаление конкретного товара из корзины\n');

console.log('26. ОЧИСТКА КОРЗИНЫ');
console.log(`DELETE ${BASE_URL}/api/cart`);
console.log('Headers: Authorization: Bearer <TOKEN>');
console.log('Описание: Полная очистка корзины\n');

console.log('=== ПРИМЕРЫ CURL КОМАНД ===\n');

console.log('# Регистрация пользователя');
console.log(`curl -X POST ${BASE_URL}/api/auth/register \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(testData.user)}'`);
console.log('');

console.log('# Вход в систему');
console.log(`curl -X POST ${BASE_URL}/api/auth/login \\
  -H "Content-Type: application/json" \\
  -d '{"email": "${testData.user.email}", "password": "${testData.user.password}"}'`);
console.log('');

console.log('# Получение списка книг');
console.log(`curl -X GET "${BASE_URL}/api/books?page=1&limit=5"`);
console.log('');

console.log('# Добавление в корзину (замените TOKEN на реальный токен)');
console.log(`curl -X POST ${BASE_URL}/api/cart \\
  -H "Authorization: Bearer TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{"bookId": 1, "quantity": 1}'`);
console.log('');

console.log('=== КОДЫ ОТВЕТОВ ===\n');
console.log('200 - Успешный запрос');
console.log('201 - Ресурс создан');
console.log('400 - Ошибка валидации данных');
console.log('401 - Не авторизован');
console.log('403 - Нет прав доступа');
console.log('404 - Ресурс не найден');
console.log('500 - Внутренняя ошибка сервера\n');

console.log('=== ВАЖНЫЕ ПРИМЕЧАНИЯ ===\n');
console.log('1. Для авторизованных запросов используйте заголовок: Authorization: Bearer <TOKEN>');
console.log('2. Администраторские функции доступны только пользователям с ролью "admin"');
console.log('3. Все даты в формате ISO 8601 (YYYY-MM-DD)');
console.log('4. Пагинация: page (номер страницы), limit (элементов на странице)');
console.log('5. Поиск поддерживает частичное совпадение (case-insensitive)');
console.log('6. При создании книги authorIds - массив ID авторов');
console.log('7. Корзина привязана к конкретному пользователю по JWT токену\n');

console.log('Запустите сервер командой: node server.js');
console.log('Затем тестируйте API с помощью Postman или curl\n');