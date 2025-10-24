# 📄 Руководство по созданию главной страницы

## 📋 Содержание

1. [Обзор главной страницы](#обзор-главной-страницы)
2. [HTML структура](#html-структура)
3. [CSS стилизация](#css-стилизация)
4. [JavaScript функциональность](#javascript-функциональность)
5. [Адаптивный дизайн](#адаптивный-дизайн)
6. [Интеграция с API](#интеграция-с-api)
7. [Оптимизация производительности](#оптимизация-производительности)

---

## 🎯 Обзор главной страницы

Главная страница книжного магазина содержит:

- **Шапку сайта** с навигацией
- **Приветственный блок** с описанием
- **Галерею популярных книг** с интерактивными карточками
- **Статистику магазина** с динамической загрузкой данных

### 📁 Файловая структура

```
public/
├── index.html              # Основная HTML страница
├── style/
│   └── style.css          # Основные стили
├── scripts/
│   └── main-page.js       # JavaScript для главной страницы
└── img/
    ├── logo.png           # Логотип
    ├── book1.jpg-book6.jpg # Изображения книг
    └── book-placeholder.jpg # Заглушка для книг
```

---

## 🏗️ HTML структура

### Основная разметка

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Интернет-магазин книг</title>
    <link rel="stylesheet" href="style/style.css" />
  </head>
  <body>
    <!-- Содержимое страницы -->
  </body>
</html>
```

### Шапка сайта

```html
<header>
  <img src="img/logo.png" alt="Логотип магазина" class="logo" />
  <nav>
    <ul class="menu">
      <li><a href="index.html" class="active">Главная</a></li>
      <li><a href="html/book.html">Каталог</a></li>
      <li><a href="html/contacts.html">Контакты</a></li>
      <li><a href="html/register.html">Регистрация</a></li>
      <li><a href="html/login.html">Вход</a></li>
    </ul>
  </nav>
</header>
```

#### 🔧 Особенности шапки:

- **Flexbox разметка** для выравнивания элементов
- **Активная ссылка** с классом `active`
- **Адаптивное меню** с переносом на новую строку
- **Логотип** с фиксированными размерами

### Приветственный блок

```html
<div class="intro">
  <h1>Добро пожаловать в книжный магазин!</h1>
  <p>Здесь Вы найдете книги на любой вкус</p>
</div>
```

#### 🎨 Стилизация:

- Центрированный текст
- Крупный заголовок (28px)
- Подзаголовок меньшего размера (18px)

### Галерея книг

```html
<div id="gallery" class="gallery">
  <img
    src="img/book1.jpg"
    alt="Книга 1"
    class="abs-img img1"
    loading="lazy"
    width="160"
    height="240"
  />
  <img
    src="img/book2.jpg"
    alt="Книга 2"
    class="abs-img img2"
    loading="lazy"
    width="160"
    height="240"
  />
  <!-- ... остальные изображения ... -->
</div>
```

#### ✨ Особенности галереи:

- **Абсолютное позиционирование** каждой книги
- **Различные углы поворота** для создания динамичности
- **Hover эффекты** с масштабированием и выпрямлением
- **Lazy loading** для оптимизации загрузки
- **Фиксированные размеры** изображений

### Блок статистики

```html
<section class="store-stats">
  <h2>📊 О нашем магазине</h2>
  <div id="store-stats" class="stats-grid">
    <div class="loading-placeholder">Загружаем статистику...</div>
  </div>
</section>
```

#### 📊 Содержимое статистики:

- Общее количество книг
- Количество категорий
- Количество авторов
- Список популярных жанров

---

## 🎨 CSS стилизация

### Основные стили

```css
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  background: #f5f5f5;
}

.container {
  max-width: 1000px;
  margin: 20px auto;
  padding: 20px;
}
```

### Стили шапки

```css
header {
  background: #000000;
  color: white;
  padding: 15px 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
}

.logo {
  height: 70px;
  width: auto;
  object-fit: contain;
}

.menu {
  list-style: none;
  display: flex;
  gap: 20px;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.menu a {
  color: white;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.menu a:hover {
  color: #f39c12;
}

.menu a.active {
  color: #f39c12;
  outline: 2px solid rgba(243, 156, 18, 0.15);
  padding: 4px 8px;
  border-radius: 6px;
}
```

### Стили галереи

```css
.gallery {
  position: relative;
  max-width: 90%;
  height: 300px;
  margin: 20px auto;
  border: 2px dashed #ccc;
  background: #fafafa;
  overflow: hidden;
}

.abs-img {
  position: absolute;
  width: 15%;
  min-width: 80px;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s;
}

/* Позиционирование каждой книги */
.img1 {
  top: 50px;
  left: 10%;
  transform: rotate(-15deg);
}
.img2 {
  top: 40px;
  left: 25%;
  transform: rotate(-7deg);
}
.img3 {
  top: 30px;
  left: 40%;
  transform: rotate(0deg);
}
.img4 {
  top: 40px;
  left: 55%;
  transform: rotate(7deg);
}
.img5 {
  top: 50px;
  left: 70%;
  transform: rotate(15deg);
}
.img6 {
  top: 60px;
  left: 80%;
  transform: rotate(20deg);
}

.abs-img:hover {
  transform: scale(1.1) rotate(0deg);
  z-index: 10;
}
```

### Стили статистики

```css
.store-stats {
  margin: 20px 0;
  padding: 15px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  text-align: center;
}

.stat-item {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 2px solid #e9ecef;
}

.stat-number {
  font-size: 32px;
  font-weight: bold;
  color: #27ae60;
  margin-bottom: 5px;
}

.stat-label {
  color: #666;
  font-weight: 500;
}
```

---

## ⚡ JavaScript функциональность

### Основная структура

```javascript
(function () {
  "use strict";

  // Состояние приложения
  const state = {
    popularBooks: [],
    storeStats: null,
    isLoading: false,
  };

  // DOM элементы
  const elements = {
    gallery: null,
    statsContainer: null,
  };

  // Инициализация
  async function init() {
    console.log("Initializing main page...");

    // Получаем DOM элементы
    elements.gallery = document.getElementById("gallery");
    elements.statsContainer = document.getElementById("store-stats");

    // Загружаем данные
    await loadPopularBooks();
    await loadStoreStats();
  }

  // Запуск после загрузки DOM
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

### Загрузка популярных книг

```javascript
async function loadPopularBooks() {
  try {
    showLoadingState();

    const response = await fetch(
      "/api/books?limit=6&sortBy=popularity&sortOrder=DESC"
    );
    const data = await response.json();

    if (data.success && data.data.books) {
      state.popularBooks = data.data.books;
      renderPopularBooks();
    } else {
      showErrorState("Не удалось загрузить популярные книги");
    }
  } catch (error) {
    console.error("Error loading popular books:", error);
    showErrorState("Ошибка при загрузке популярных книг");
  }
}

function renderPopularBooks() {
  if (!elements.gallery || !state.popularBooks.length) return;

  // Обновляем изображения в галерее
  state.popularBooks.forEach((book, index) => {
    const imgElement = elements.gallery.querySelector(`.img${index + 1}`);
    if (imgElement && book.image) {
      imgElement.src = `/img/${book.image}`;
      imgElement.alt = book.title;

      // Добавляем интерактивность
      addBookInteractivity(imgElement, book);
    }
  });
}
```

### Загрузка статистики

```javascript
async function loadStoreStats() {
  try {
    const response = await fetch("/api/stats");
    const data = await response.json();

    if (data.success) {
      state.storeStats = data.data;
      renderStoreStats();
    } else {
      showStatsError();
    }
  } catch (error) {
    console.error("Error loading store stats:", error);
    showStatsError();
  }
}

function renderStoreStats() {
  if (!elements.statsContainer || !state.storeStats) return;

  const { totalBooks, totalCategories, totalAuthors, popularGenres } =
    state.storeStats;

  const html = `
        <div class="stat-item">
            <div class="stat-number">${totalBooks}</div>
            <div class="stat-label">Книг в наличии</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${totalCategories}</div>
            <div class="stat-label">Категорий</div>
        </div>
        <div class="stat-item">
            <div class="stat-number">${totalAuthors}</div>
            <div class="stat-label">Авторов</div>
        </div>
        <div class="stat-item genres">
            <div class="stat-label">Популярные жанры</div>
            <div class="genres-list">
                ${popularGenres
                  .map((genre) => `<span class="genre-tag">${genre}</span>`)
                  .join("")}
            </div>
        </div>
    `;

  elements.statsContainer.innerHTML = html;
}
```

### Интерактивность книг

```javascript
function addBookInteractivity(imgElement, book) {
  // Создаем информационную карточку
  const infoCard = createBookInfoCard(book);
  imgElement.parentElement.appendChild(infoCard);

  // Добавляем обработчики событий
  imgElement.addEventListener("mouseenter", () => {
    showBookInfo(infoCard);
  });

  imgElement.addEventListener("mouseleave", () => {
    hideBookInfo(infoCard);
  });

  imgElement.addEventListener("click", () => {
    window.location.href = `/html/book-detail.html?id=${book.id}`;
  });
}

function createBookInfoCard(book) {
  const card = document.createElement("div");
  card.className = "book-info";
  card.innerHTML = `
        <h3 class="book-title">${book.title}</h3>
        <p class="book-author">${
          book.authors?.map((a) => a.name).join(", ") || "Автор не указан"
        }</p>
        <p class="book-price">${book.price} руб.</p>
        <p class="book-popularity">Популярность: ${book.popularity || 0}</p>
        ${
          book.stockQuantity === 0
            ? '<p class="out-of-stock">Нет в наличии</p>'
            : book.stockQuantity < 5
            ? '<p class="low-stock">Осталось мало</p>'
            : ""
        }
    `;
  return card;
}
```

---

## 📱 Адаптивный дизайн

### Мобильные устройства

```css
@media (max-width: 768px) {
  .gallery {
    height: 250px;
  }

  .abs-img {
    width: 18%;
  }

  .intro h1 {
    font-size: 24px;
  }

  .intro p {
    font-size: 16px;
  }

  .stats-grid {
    grid-template-columns: 1fr 1fr;
    gap: 15px;
  }
}

@media (max-width: 480px) {
  header {
    flex-direction: column;
    text-align: center;
  }

  .menu {
    justify-content: center;
    margin-top: 10px;
  }

  .container {
    padding: 10px;
  }

  .gallery {
    height: 200px;
    margin: 10px auto;
  }
}
```

### Планшеты

```css
@media (max-width: 1024px) and (min-width: 769px) {
  .gallery {
    height: 280px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
```

---

## 🔌 Интеграция с API

### Конечные точки API

#### 1. Получение популярных книг

```
GET /api/books?limit=6&sortBy=popularity&sortOrder=DESC
```

**Ответ:**

```json
{
  "success": true,
  "data": {
    "books": [
      {
        "id": 1,
        "title": "Название книги",
        "authors": [{ "name": "Автор" }],
        "price": 1000,
        "image": "book1.jpg",
        "popularity": 150,
        "stockQuantity": 10
      }
    ]
  }
}
```

#### 2. Получение статистики

```
GET /api/stats
```

**Ответ:**

```json
{
  "success": true,
  "data": {
    "totalBooks": 156,
    "totalCategories": 12,
    "totalAuthors": 45,
    "popularGenres": ["Фантастика", "Драма", "Биография"]
  }
}
```

### Обработка ошибок

```javascript
function handleApiError(error, context) {
  console.error(`Error in ${context}:`, error);

  // Показываем пользователю дружелюбное сообщение
  const errorMessage =
    {
      books: "Не удалось загрузить книги",
      stats: "Не удалось загрузить статистику",
    }[context] || "Произошла ошибка";

  showErrorNotification(errorMessage);
}

function showErrorNotification(message) {
  // Создаем временное уведомление
  const notification = document.createElement("div");
  notification.className = "error-notification";
  notification.textContent = message;

  document.body.appendChild(notification);

  // Удаляем через 5 секунд
  setTimeout(() => {
    notification.remove();
  }, 5000);
}
```

---

## ⚡ Оптимизация производительности

### 1. Загрузка изображений

```html
<!-- Lazy loading для изображений -->
<img
  src="img/book1.jpg"
  alt="Книга 1"
  class="abs-img img1"
  loading="lazy"
  width="160"
  height="240"
/>
```

### 2. Кэширование данных

```javascript
// Простое кэширование в localStorage
const CACHE_KEY = "mainPageData";
const CACHE_DURATION = 5 * 60 * 1000; // 5 минут

function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    if (cached) {
      const { data, timestamp } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return data;
      }
    }
  } catch (error) {
    console.error("Error reading cache:", error);
  }
  return null;
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      })
    );
  } catch (error) {
    console.error("Error writing cache:", error);
  }
}
```

### 3. Оптимизация анимаций

```css
/* Используем transform вместо изменения position */
.abs-img {
  transition: transform 0.3s ease;
  will-change: transform;
}

.abs-img:hover {
  transform: scale(1.1) rotate(0deg);
}

/* Оптимизация для мобильных устройств */
@media (prefers-reduced-motion: reduce) {
  .abs-img {
    transition: none;
  }
}
```

### 4. Предзагрузка критических ресурсов

```html
<head>
  <!-- Предзагрузка критических шрифтов -->
  <link
    rel="preload"
    href="fonts/arial.woff2"
    as="font"
    type="font/woff2"
    crossorigin
  />

  <!-- Предзагрузка критических изображений -->
  <link rel="preload" href="img/logo.png" as="image" />
</head>
```

---

## 🧪 Тестирование

### Проверка функциональности

1. **Загрузка страницы:**

   - ✅ Страница загружается без ошибок
   - ✅ Все изображения отображаются корректно
   - ✅ Навигация работает

2. **Интерактивность:**

   - ✅ Hover эффекты на книгах
   - ✅ Клик по книге ведет на страницу деталей
   - ✅ Статистика загружается и отображается

3. **Адаптивность:**
   - ✅ Корректное отображение на мобильных
   - ✅ Корректное отображение на планшетах
   - ✅ Корректное отображение на десктопе

### Тестирование производительности

```javascript
// Мониторинг времени загрузки
window.addEventListener("load", () => {
  const loadTime = performance.now();
  console.log(`Page loaded in ${loadTime.toFixed(2)}ms`);
});

// Мониторинг API запросов
async function monitoredFetch(url, options = {}) {
  const start = performance.now();
  try {
    const response = await fetch(url, options);
    const end = performance.now();
    console.log(`API ${url} took ${(end - start).toFixed(2)}ms`);
    return response;
  } catch (error) {
    const end = performance.now();
    console.error(
      `API ${url} failed after ${(end - start).toFixed(2)}ms`,
      error
    );
    throw error;
  }
}
```

---

## 🔧 Возможные улучшения

### 1. Динамическая галерея

- Загрузка актуальных популярных книг из API
- Автоматическое обновление галереи

### 2. Персонализация

- Рекомендации на основе истории просмотров
- Персональные предложения

### 3. Анимации

- Более сложные CSS анимации
- Параллакс эффекты при скролле

### 4. PWA функциональность

- Service Worker для кэширования
- Возможность работы офлайн
- Установка как приложение

---

## 📚 Дополнительные ресурсы

- [MDN Web Docs - CSS Grid](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)
- [MDN Web Docs - Flexbox](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Flexible_Box_Layout)
- [MDN Web Docs - Intersection Observer](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API)
- [Web.dev - Performance](https://web.dev/performance/)

---

_Документация создана: {{ current_date }}_
_Версия: 1.0_
