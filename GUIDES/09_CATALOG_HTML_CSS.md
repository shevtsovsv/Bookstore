# 🏗️ HTML структура и CSS стилизация каталога

_[← Назад к обзору](08_CATALOG_OVERVIEW.md) | [Далее: JavaScript →](10_CATALOG_JAVASCRIPT.md)_

---

## 📋 Содержание

1. [HTML структура](#html-структура)
2. [CSS архитектура](#css-архитектура)
3. [Компоненты и их стили](#компоненты-и-их-стили)
4. [Адаптивный дизайн](#адаптивный-дизайн)
5. [Анимации и переходы](#анимации-и-переходы)

---

## 🏗️ HTML структура

### Основная разметка

```html
<!DOCTYPE html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Каталог книг - Книжный магазин</title>
    <link rel="stylesheet" href="../style/style.css" />
  </head>
  <body>
    <!-- Содержимое каталога -->
  </body>
</html>
```

### Шапка сайта

```html
<header>
  <img
    src="../img/logo.png"
    alt="Логотип магазина"
    class="logo"
    width="140"
    height="70"
  />
  <nav>
    <ul class="menu">
      <li><a href="../index.html">Главная</a></li>
      <li><a href="book.html" class="active">Каталог</a></li>
      <li><a href="contacts.html">Контакты</a></li>
      <li><a href="register.html">Регистрация</a></li>
      <li><a href="login.html">Вход</a></li>
    </ul>
  </nav>
</header>
```

#### 🔧 Особенности шапки:

- **Relative путь** к главной странице (`../index.html`)
- **Активная ссылка** на текущую страницу
- **Фиксированные размеры** логотипа для оптимизации

### Контейнер страницы

```html
<main class="container">
  <h1>Каталог книг</h1>

  <!-- Секция фильтров -->
  <!-- Панель управления -->
  <!-- Контейнер книг -->
  <!-- Элементы infinite scroll -->
</main>
```

### Секция фильтров

```html
<div class="filters-section">
  <h2>Фильтры</h2>
  <div class="filters-row">
    <!-- Фильтр по жанру -->
    <div class="filter-item">
      <label for="category-select">Жанр:</label>
      <select id="category-select" name="category">
        <option value="">Все жанры</option>
        <!-- Опции заполняются JavaScript -->
      </select>
    </div>

    <!-- Фильтр по цене -->
    <div class="filter-item">
      <label for="price-select">Цена:</label>
      <select id="price-select" name="price">
        <option value="all">Все цены</option>
        <option value="low">До 1000 руб.</option>
        <option value="medium">1000-2000 руб.</option>
        <option value="high">От 2000 руб.</option>
      </select>
    </div>

    <!-- Фильтр по автору -->
    <div class="filter-item">
      <label for="author-type-select">Автор:</label>
      <select id="author-type-select" name="authorType">
        <option value="all">Все авторы</option>
        <option value="russian">Русские</option>
        <option value="foreign">Зарубежные</option>
      </select>
    </div>
  </div>
</div>
```

#### ✨ Особенности фильтров:

- **Flexbox компоновка** для горизонтального размещения
- **Семантические label** связанные с элементами
- **Предустановленные опции** для цены и типа автора
- **Динамическая загрузка** категорий

### Панель управления

```html
<div class="catalog-controls">
  <div class="left-controls">
    <!-- Выбор количества книг -->
    <div class="items-per-page">
      <label for="items-per-page">Показывать на странице:</label>
      <div class="items-control-group">
        <select id="items-per-page">
          <option value="4">4</option>
          <option value="8">8</option>
          <option value="12">12</option>
          <option value="16" selected>16</option>
          <option value="20">20</option>
          <option value="24">24</option>
          <option value="28">28</option>
          <option value="all">📜 Показать все (лента)</option>
          <option value="custom">Другое</option>
        </select>
        <input
          type="number"
          id="custom-items"
          placeholder="Введите число"
          min="1"
          max="1000"
          style="display: none;"
        />
        <button id="apply-custom" style="display: none;">Применить</button>
      </div>
    </div>

    <!-- Информация о странице -->
    <div id="page-info" class="page-info">Загрузка...</div>
  </div>

  <div class="right-controls">
    <!-- Пагинация -->
    <div id="pagination-controls" class="pagination"></div>
  </div>
</div>
```

#### 🎛️ Особенности панели:

- **Две зоны** - управление слева, навигация справа
- **Кратные 4** значения для идеального заполнения сетки
- **Скрытые элементы** для пользовательского ввода
- **Эмодзи** для режима "Показать все"

### Контейнер книг

```html
<div id="loading" class="loading" style="display: none">
  <p>Загрузка книг...</p>
</div>

<div id="books-container" class="books-grid">
  <div class="loading">
    <p>Загрузка каталога...</p>
  </div>
</div>
```

### Элементы бесконечного скроллинга

```html
<!-- Информационная панель -->
<div
  id="infinite-scroll-info"
  class="infinite-scroll-info"
  style="display: none;"
>
  <p>📜 Режим "Показать все" - книги загружаются автоматически при прокрутке</p>
  <div class="progress-container">
    <div class="progress-text">
      Загружено: <span id="loaded-count">0</span> из
      <span id="total-count">0</span> книг
    </div>
    <div class="progress-bar">
      <div id="progress-fill" class="progress-fill" style="width: 0%"></div>
    </div>
  </div>
  <button id="switch-back-btn" class="switch-back-btn">
    Вернуться к страницам
  </button>
</div>

<!-- Индикатор загрузки -->
<div id="loading-more" class="loading-more-books" style="display: none;">
  <p>⏳ Загружаем ещё книги...</p>
</div>

<!-- Сообщение о завершении -->
<div id="end-of-catalog" class="end-of-catalog" style="display: none;">
  <p>🎉 Все книги загружены!</p>
  <p>Найдено <span id="final-count">0</span> книг по вашему запросу</p>
</div>

<!-- Невидимый элемент для отслеживания скролла -->
<div id="scroll-sentinel" class="scroll-sentinel" style="display: none;"></div>
```

---

## 🎨 CSS архитектура

### Структура стилей

```css
/* ========== Base Styles ========== */
/* Базовые стили для body, контейнеров */

/* ========== Header ========== */
/* Стили шапки и навигации */

/* ========== Filters Section ========== */
/* Стили секции фильтров */

/* ========== Catalog Controls ========== */
/* Стили панели управления */

/* ========== Books Grid ========== */
/* Стили сетки книг */

/* ========== Pagination ========== */
/* Стили пагинации */

/* ========== Infinite Scroll ========== */
/* Стили бесконечного скроллинга */

/* ========== Responsive Design ========== */
/* Адаптивные стили */

/* ========== Animations ========== */
/* Анимации и переходы */
```

### CSS Custom Properties

```css
:root {
  /* Цвета */
  --primary-color: #27ae60;
  --primary-hover: #219150;
  --secondary-color: #3498db;
  --secondary-hover: #2980b9;
  --background: #f5f5f5;
  --card-background: #ffffff;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-muted: #999999;
  --border-color: #dddddd;
  --border-light: #e9ecef;
  --shadow-light: 0 2px 8px rgba(0, 0, 0, 0.1);
  --shadow-medium: 0 4px 16px rgba(0, 0, 0, 0.15);

  /* Размеры */
  --container-max-width: 1000px;
  --border-radius: 8px;
  --border-radius-small: 4px;
  --spacing-xs: 5px;
  --spacing-sm: 10px;
  --spacing-md: 15px;
  --spacing-lg: 20px;
  --spacing-xl: 30px;

  /* Переходы */
  --transition-fast: 0.2s ease;
  --transition-medium: 0.3s ease;
  --transition-slow: 0.5s ease;
}
```

---

## 🧩 Компоненты и их стили

### Секция фильтров

```css
.filters-section {
  background: var(--card-background);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  margin-bottom: var(--spacing-xl);
}

.filters-section h2 {
  margin-top: 0;
  margin-bottom: var(--spacing-lg);
  color: var(--text-primary);
  font-size: 24px;
}

.filters-row {
  display: flex;
  gap: var(--spacing-lg);
  align-items: flex-end;
  flex-wrap: wrap;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
  min-width: 150px;
  flex: 1;
}

.filter-item label {
  font-weight: 600;
  color: var(--text-secondary);
  font-size: 14px;
}

.filter-item select {
  padding: var(--spacing-sm) 12px;
  border: 1px solid var(--border-color);
  border-radius: var(--spacing-xs);
  font-size: 14px;
  background: var(--card-background);
  cursor: pointer;
  transition: border-color var(--transition-medium), box-shadow var(--transition-medium);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filter-item select:hover {
  border-color: var(--primary-color);
}

.filter-item select:focus {
  border-color: var(--primary-color);
  outline: none;
  box-shadow: 0 0 0 3px rgba(39, 174, 96, 0.1);
}
```

### Панель управления

```css
.catalog-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
  background: var(--card-background);
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
}

.left-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.right-controls {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.items-per-page {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.items-control-group {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.page-info {
  color: var(--text-secondary);
  font-size: 14px;
  white-space: nowrap;
}
```

### Сетка книг

```css
.books-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-xl);
}

.books-grid .book-card {
  background: var(--card-background);
  border-radius: var(--border-radius);
  box-shadow: var(--shadow-light);
  padding: var(--spacing-md);
  display: flex;
  flex-direction: column;
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.books-grid .book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

.books-grid .book-cover {
  width: 100%;
  height: 280px;
  object-fit: cover;
  border-radius: var(--spacing-xs);
  margin-bottom: 12px;
}

.books-grid .book-info {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.books-grid .book-info h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text-primary);
  line-height: 1.3;
}

.books-grid .book-info p {
  margin: 4px 0;
  font-size: 13px;
  color: var(--text-secondary);
}

.books-grid .book-description {
  flex: 1;
  margin: 8px 0;
  line-height: 1.4;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.books-grid .book-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
  padding-top: 12px;
}

.books-grid .btn {
  flex: 1;
  padding: 8px 12px;
  border: none;
  border-radius: var(--spacing-xs);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  text-align: center;
  text-decoration: none;
  transition: background-color var(--transition-fast), transform 0.1s;
}

.books-grid .btn:active {
  transform: scale(0.98);
}

.books-grid .btn-details {
  background: var(--secondary-color);
  color: white;
}

.books-grid .btn-details:hover {
  background: var(--secondary-hover);
}

.books-grid .btn-order {
  background: var(--primary-color);
  color: white;
}

.books-grid .btn-order:hover {
  background: var(--primary-hover);
}
```

### Пагинация

```css
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-btn {
  padding: 6px 10px;
  border: 1px solid var(--border-color);
  background: var(--card-background);
  border-radius: var(--border-radius-small);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition-fast);
  min-width: 35px;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: var(--primary-color);
}

.page-btn.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
  font-weight: 600;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  padding: 6px 4px;
  color: var(--text-muted);
  font-size: 13px;
}
```

---

## 📱 Адаптивный дизайн

### Breakpoints

```css
/* Desktop First подход */
@media (max-width: 1200px) {
  .books-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
  }
}

@media (max-width: 768px) {
  .books-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .catalog-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
    padding: 15px;
  }

  .left-controls {
    flex-direction: column;
    align-items: stretch;
    gap: 15px;
  }

  .right-controls {
    justify-content: center;
  }

  .filters-row {
    flex-direction: column;
    gap: 15px;
  }

  .filter-item {
    min-width: 100%;
  }

  .books-grid .book-cover {
    height: 240px;
  }
}

@media (max-width: 480px) {
  .books-grid {
    grid-template-columns: 1fr;
  }

  .catalog-controls {
    padding: 12px;
  }

  .items-per-page {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }

  .items-control-group {
    flex-direction: column;
    gap: 8px;
  }

  .books-grid .book-cover {
    height: 280px;
  }

  .books-grid .book-actions {
    flex-direction: column;
  }

  .books-grid .btn {
    width: 100%;
  }
}
```

### Адаптивная типографика

```css
/* Масштабирование шрифтов */
@media (max-width: 768px) {
  .filters-section h2 {
    font-size: 20px;
    margin-bottom: 15px;
  }

  .books-grid .book-info h3 {
    font-size: 15px;
  }

  .books-grid .book-info p {
    font-size: 12px;
  }
}

@media (max-width: 480px) {
  .books-grid .book-info h3 {
    font-size: 16px;
  }

  .books-grid .book-info p {
    font-size: 13px;
  }
}
```

### Адаптивные отступы

```css
@media (max-width: 768px) {
  .container {
    padding: 15px;
  }

  .filters-section {
    padding: 15px;
  }
}

@media (max-width: 480px) {
  .container {
    padding: 10px;
  }

  .filters-section {
    padding: 12px;
  }
}
```

---

## ✨ Анимации и переходы

### Hover эффекты

```css
/* Карточки книг */
.book-card {
  transition: transform var(--transition-fast), box-shadow var(--transition-fast);
}

.book-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-medium);
}

/* Кнопки */
.btn {
  transition: background-color var(--transition-fast), transform 0.1s;
}

.btn:active {
  transform: scale(0.98);
}

/* Фильтры */
.filter-item select {
  transition: border-color var(--transition-medium), box-shadow var(--transition-medium);
}
```

### Анимации загрузки

```css
/* Спиннер загрузки */
.loading::after {
  content: "";
  display: inline-block;
  width: 20px;
  height: 20px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-left: 10px;
  vertical-align: middle;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

/* Появление новых книг */
.book-card.fade-in {
  animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

### Прогресс-бар анимации

```css
.progress-fill {
  transition: width var(--transition-medium);
  position: relative;
}

.progress-fill::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.3) 50%,
    transparent 100%
  );
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
```

### Плавные переходы состояний

```css
/* Переключение видимости элементов */
.infinite-scroll-info,
.loading-more-books,
.end-of-catalog {
  transition: opacity var(--transition-medium), transform var(--transition-medium);
}

.infinite-scroll-info.show {
  opacity: 1;
  transform: translateY(0);
}

.infinite-scroll-info.hide {
  opacity: 0;
  transform: translateY(-10px);
}
```

---

## 🎯 Оптимизация производительности

### CSS оптимизации

```css
/* Оптимизация перерисовок */
.book-card {
  will-change: transform;
}

.book-card:hover {
  will-change: auto;
}

/* Аппаратное ускорение */
.progress-fill::after {
  transform: translateZ(0);
}

/* Уменьшение анимаций для пользователей с ограниченными возможностями */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Ленивая загрузка стилей

```css
/* Критические стили */
.critical-css {
  /* Только стили above-the-fold */
}

/* Некритические стили загружаются асинхронно */
.non-critical-css {
  /* Стили для элементов ниже fold */
}
```

---

_[← Назад к обзору](08_CATALOG_OVERVIEW.md) | [Далее: JavaScript →](10_CATALOG_JAVASCRIPT.md)_
