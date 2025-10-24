# ⚡ JavaScript функциональность каталога

_[← Назад к HTML/CSS](09_CATALOG_HTML_CSS.md) | [Далее: Infinite Scroll →](11_CATALOG_INFINITE_SCROLL.md)_

---

## 📋 Содержание

1. [Архитектура JavaScript](#архитектура-javascript)
2. [Управление состоянием](#управление-состоянием)
3. [Инициализация приложения](#инициализация-приложения)
4. [Загрузка и отображение данных](#загрузка-и-отображение-данных)
5. [Обработка событий](#обработка-событий)
6. [Утилиты и хелперы](#утилиты-и-хелперы)

---

## 🏗️ Архитектура JavaScript

### Модульная структура

```javascript
/**
 * Catalog page with filtering and pagination
 * Connects to the backend API for books, categories, and authors
 */
(function () {
  "use strict";

  // Состояние приложения
  const state = {
    /* ... */
  };

  // DOM элементы
  const elements = {
    /* ... */
  };

  // Основные функции
  // API функции
  // Утилиты
  // Обработчики событий

  // Инициализация
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
```

#### 🔧 Принципы архитектуры:

- **IIFE (Immediately Invoked Function Expression)** - изоляция области видимости
- **Strict mode** - строгий режим JavaScript
- **Single Responsibility** - каждая функция отвечает за одну задачу
- **Separation of Concerns** - разделение логики по назначению

---

## 🗂️ Управление состоянием

### Основное состояние приложения

```javascript
const state = {
  // Данные
  books: [], // Массив загруженных книг
  categories: [], // Список категорий для фильтра
  totalItems: 0, // Общее количество книг

  // Пагинация
  currentPage: 1, // Текущая страница
  itemsPerPage: 16, // Количество книг на странице
  totalPages: 1, // Общее количество страниц

  // Infinite Scroll
  infiniteScrollMode: false, // Режим бесконечного скролла
  isLoadingMore: false, // Идет ли загрузка дополнительных книг
  hasMoreBooks: true, // Есть ли еще книги для загрузки
  scrollObserver: null, // Intersection Observer для скролла

  // Фильтры
  filters: {
    category: null, // ID выбранной категории
    minPrice: null, // Минимальная цена
    maxPrice: null, // Максимальная цена
    authorType: null, // Тип автора (russian/foreign)
  },
};
```

### Кэширование DOM элементов

```javascript
const elements = {
  // Основные контейнеры
  booksContainer: null, // Контейнер с книгами
  paginationContainer: null, // Контейнер пагинации
  loading: null, // Индикатор загрузки

  // Элементы управления
  itemsPerPageSelect: null, // Селектор количества книг
  customItemsInput: null, // Поле для ввода произвольного количества
  applyCustomButton: null, // Кнопка применения произвольного количества
  pageInfo: null, // Информация о текущей странице

  // Infinite Scroll элементы
  infiniteScrollInfo: null, // Информационная панель
  loadingMore: null, // Индикатор загрузки дополнительных книг
  endOfCatalog: null, // Сообщение о завершении каталога
  scrollSentinel: null, // Элемент-наблюдатель для скролла
  switchBackBtn: null, // Кнопка возврата к пагинации
};
```

### Состояние фильтров

```javascript
// Методы для работы с фильтрами
const filterState = {
  // Получить активные фильтры
  getActiveFilters() {
    return Object.entries(state.filters)
      .filter(([key, value]) => value !== null)
      .reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
      }, {});
  },

  // Сбросить все фильтры
  resetFilters() {
    state.filters = {
      category: null,
      minPrice: null,
      maxPrice: null,
      authorType: null,
    };
  },

  // Проверить, есть ли активные фильтры
  hasActiveFilters() {
    return Object.values(state.filters).some((value) => value !== null);
  },
};
```

---

## 🚀 Инициализация приложения

### Основная функция инициализации

```javascript
/**
 * Initialize the catalog page
 */
async function init() {
  console.log("Initializing book catalog...");

  try {
    // Получаем DOM элементы
    getDOMElements();

    // Загружаем начальные данные
    await loadInitialData();

    // Настраиваем обработчики событий
    setupEventListeners();

    // Загружаем первую страницу книг
    await loadBooks();

    console.log("Catalog initialization completed");
  } catch (error) {
    console.error("Error during catalog initialization:", error);
    showError("Ошибка при инициализации каталога");
  }
}

/**
 * Get and cache DOM elements
 */
function getDOMElements() {
  elements.booksContainer = document.getElementById("books-container");
  elements.paginationContainer = document.getElementById("pagination-controls");
  elements.itemsPerPageSelect = document.getElementById("items-per-page");
  elements.customItemsInput = document.getElementById("custom-items");
  elements.applyCustomButton = document.getElementById("apply-custom");
  elements.infiniteScrollInfo = document.getElementById("infinite-scroll-info");
  elements.loadingMore = document.getElementById("loading-more");
  elements.endOfCatalog = document.getElementById("end-of-catalog");
  elements.scrollSentinel = document.getElementById("scroll-sentinel");
  elements.switchBackBtn = document.getElementById("switch-back-btn");
  elements.pageInfo = document.getElementById("page-info");
  elements.loading = document.getElementById("loading");

  // Проверяем наличие критических элементов
  if (!elements.booksContainer) {
    throw new Error("Books container not found");
  }
  if (!elements.itemsPerPageSelect) {
    throw new Error("Items per page selector not found");
  }
}

/**
 * Load initial data
 */
async function loadInitialData() {
  await loadCategories();
}
```

### Обработка ошибок инициализации

```javascript
/**
 * Handle initialization errors
 */
function handleInitError(error) {
  console.error("Catalog initialization failed:", error);

  // Показываем пользователю сообщение об ошибке
  const container = document.querySelector(".container");
  if (container) {
    container.innerHTML = `
            <div class="error-message">
                <h1>Ошибка загрузки каталога</h1>
                <p>Не удалось инициализировать страницу каталога.</p>
                <button onclick="location.reload()" class="btn">
                    Попробовать снова
                </button>
            </div>
        `;
  }
}
```

---

## 📡 Загрузка и отображение данных

### Загрузка категорий

```javascript
/**
 * Load categories from API
 */
async function loadCategories() {
  try {
    console.log("Loading categories...");

    const response = await fetch("/api/categories?limit=100");

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data.categories) {
      state.categories = data.data.categories;
      renderCategoryFilters();
      console.log(`Loaded ${state.categories.length} categories`);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading categories:", error);
    // Показываем фильтр без категорий, но с базовой функциональностью
    renderCategoryFiltersError();
  }
}

/**
 * Render category filter options
 */
function renderCategoryFilters() {
  const select = document.getElementById("category-select");
  if (!select) return;

  // Создаем опции для категорий
  const categoryOptions = state.categories
    .map((cat) => `<option value="${cat.id}">${escapeHtml(cat.name)}</option>`)
    .join("");

  select.innerHTML = `
        <option value="">Все жанры</option>
        ${categoryOptions}
    `;

  // Добавляем обработчик событий
  select.addEventListener("change", handleCategoryChange);
}

/**
 * Render category filters in case of error
 */
function renderCategoryFiltersError() {
  const select = document.getElementById("category-select");
  if (!select) return;

  select.innerHTML = `
        <option value="">Все жанры (ошибка загрузки)</option>
    `;

  select.disabled = true;
}
```

### Загрузка книг

```javascript
/**
 * Load books from API
 */
async function loadBooks() {
  // Если в режиме infinite scroll, не используем эту функцию
  if (state.infiniteScrollMode) {
    return;
  }

  try {
    showLoading();
    console.log("Loading books...", {
      page: state.currentPage,
      itemsPerPage: state.itemsPerPage,
      filters: state.filters,
    });

    // Строим параметры запроса
    const params = buildAPIParams();

    const response = await fetch(`/api/books?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      // Обновляем состояние
      state.books = data.data.books;
      state.totalPages = data.data.pagination.totalPages;
      state.totalItems = data.data.pagination.totalItems;
      state.currentPage = data.data.pagination.currentPage;

      // Отображаем данные
      renderBooks();
      renderPagination();
      updatePageInfo();

      console.log(`Loaded ${state.books.length} books`);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (error) {
    console.error("Error loading books:", error);
    showError("Не удалось загрузить книги");
  } finally {
    hideLoading();
  }
}

/**
 * Build API parameters from current state
 */
function buildAPIParams() {
  const params = new URLSearchParams({
    page: state.currentPage,
    limit: state.itemsPerPage,
    sortBy: "popularity",
    sortOrder: "DESC",
  });

  // Добавляем фильтры
  if (state.filters.category) {
    params.append("category", state.filters.category);
  }
  if (state.filters.minPrice !== null) {
    params.append("minPrice", state.filters.minPrice);
  }
  if (state.filters.maxPrice !== null) {
    params.append("maxPrice", state.filters.maxPrice);
  }
  if (state.filters.authorType) {
    params.append("authorType", state.filters.authorType);
  }

  return params;
}
```

### Отображение книг

```javascript
/**
 * Render books in the catalog
 */
function renderBooks() {
  if (!elements.booksContainer) return;

  if (state.books.length === 0) {
    renderEmptyState();
    return;
  }

  const html = state.books.map((book) => createBookCardHTML(book)).join("");

  elements.booksContainer.innerHTML = html;

  // Добавляем анимацию появления
  addFadeInAnimation();
}

/**
 * Create HTML for a single book card
 */
function createBookCardHTML(book) {
  const authors =
    book.authors && book.authors.length > 0
      ? book.authors.map((a) => escapeHtml(a.name)).join(", ")
      : "Автор не указан";

  const category = book.category?.name
    ? escapeHtml(book.category.name)
    : "Не указан";

  const description = book.shortDescription
    ? escapeHtml(book.shortDescription)
    : "";

  return `
        <div class="book-card" data-book-id="${book.id}">
            <img
                src="/img/${escapeHtml(book.image || "placeholder.jpg")}"
                alt="${escapeHtml(book.title)}"
                class="book-cover"
                loading="lazy"
                onerror="this.src='/img/placeholder.jpg'"
            />
            <div class="book-info">
                <h3>${escapeHtml(book.title)}</h3>
                <p><strong>Жанр:</strong> ${category}</p>
                <p><strong>Автор:</strong> ${authors}</p>
                <p><strong>Цена:</strong> ${book.price} руб.</p>
                <p class="book-description">${description}</p>
                <div class="book-actions">
                    <a href="/html/book-detail.html?id=${
                      book.id
                    }" class="btn btn-details">
                        Подробнее
                    </a>
                    <button class="btn btn-order" onclick="orderBook(${
                      book.id
                    }, '${escapeHtml(book.title)}')">
                        Заказать
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render empty state when no books found
 */
function renderEmptyState() {
  const hasFilters = filterState.hasActiveFilters();

  elements.booksContainer.innerHTML = `
        <div class="no-results">
            <h3>📚 ${
              hasFilters
                ? "По заданным фильтрам книги не найдены"
                : "Книги не найдены"
            }</h3>
            <p>${
              hasFilters
                ? "Попробуйте изменить параметры фильтрации"
                : "В данный момент каталог пуст"
            }</p>
            ${
              hasFilters
                ? `
                <button onclick="resetAllFilters()" class="btn">
                    Сбросить фильтры
                </button>
            `
                : ""
            }
        </div>
    `;
}

/**
 * Add fade-in animation to book cards
 */
function addFadeInAnimation() {
  const cards = elements.booksContainer.querySelectorAll(".book-card");
  cards.forEach((card, index) => {
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add("fade-in");
  });
}
```

---

## 🎛️ Обработка событий

### Настройка обработчиков событий

```javascript
/**
 * Setup event listeners
 */
function setupEventListeners() {
  // Селектор количества книг на странице
  if (elements.itemsPerPageSelect) {
    elements.itemsPerPageSelect.addEventListener(
      "change",
      handleItemsPerPageChange
    );
  }

  // Пользовательский ввод количества
  if (elements.customItemsInput) {
    elements.customItemsInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        applyCustomItemsCount();
      }
    });

    // Валидация ввода
    elements.customItemsInput.addEventListener("input", validateCustomInput);
  }

  // Кнопка применения пользовательского количества
  if (elements.applyCustomButton) {
    elements.applyCustomButton.addEventListener("click", applyCustomItemsCount);
  }

  // Кнопка возврата к пагинации
  if (elements.switchBackBtn) {
    elements.switchBackBtn.addEventListener("click", switchBackToPagination);
  }

  // Фильтры
  setupFilterListeners();

  // Глобальные события
  setupGlobalListeners();
}

/**
 * Setup filter event listeners
 */
function setupFilterListeners() {
  const priceSelect = document.getElementById("price-select");
  if (priceSelect) {
    priceSelect.addEventListener("change", handlePriceChange);
  }

  const authorTypeSelect = document.getElementById("author-type-select");
  if (authorTypeSelect) {
    authorTypeSelect.addEventListener("change", handleAuthorTypeChange);
  }
}

/**
 * Setup global event listeners
 */
function setupGlobalListeners() {
  // Обработка ошибок изображений
  document.addEventListener(
    "error",
    (e) => {
      if (e.target.tagName === "IMG") {
        handleImageError(e.target);
      }
    },
    true
  );

  // Обработка изменения размера окна
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      handleWindowResize();
    }, 250);
  });
}
```

### Обработчики изменения количества книг

```javascript
/**
 * Handle items per page change
 */
function handleItemsPerPageChange(e) {
  const value = e.target.value;

  console.log("Items per page changed:", value);

  // Скрываем/показываем поле для пользовательского ввода
  toggleCustomInput(value === "custom");

  if (value === "all") {
    // Переключаемся в режим infinite scroll
    enableInfiniteScrollMode();
  } else if (value === "custom") {
    // Ждем пользовательского ввода
    return;
  } else {
    // Обычный режим пагинации
    disableInfiniteScrollMode();
    state.itemsPerPage = parseInt(value);
    state.currentPage = 1;
    loadBooks();
  }
}

/**
 * Toggle custom input visibility
 */
function toggleCustomInput(show) {
  if (elements.customItemsInput && elements.applyCustomButton) {
    elements.customItemsInput.style.display = show ? "block" : "none";
    elements.applyCustomButton.style.display = show ? "block" : "none";

    if (show) {
      elements.customItemsInput.focus();
      elements.customItemsInput.value = "";
    }
  }
}

/**
 * Validate custom input
 */
function validateCustomInput(e) {
  const value = parseInt(e.target.value);
  const isValid = value > 0 && value <= 1000;

  e.target.style.borderColor = isValid ? "" : "#e74c3c";

  if (elements.applyCustomButton) {
    elements.applyCustomButton.disabled = !isValid;
  }
}

/**
 * Apply custom items count
 */
function applyCustomItemsCount() {
  const customValue = parseInt(elements.customItemsInput.value);

  if (customValue && customValue > 0 && customValue <= 1000) {
    disableInfiniteScrollMode();
    state.itemsPerPage = customValue;
    state.currentPage = 1;
    toggleCustomInput(false);

    // Обновляем селектор
    updateSelectWithCustomValue(customValue);

    loadBooks();
  } else {
    showNotification("Пожалуйста, введите число от 1 до 1000", "error");
    elements.customItemsInput.focus();
  }
}

/**
 * Update select with custom value
 */
function updateSelectWithCustomValue(value) {
  // Удаляем старое пользовательское значение
  const oldCustom = elements.itemsPerPageSelect.querySelector(
    'option[data-custom="true"]'
  );
  if (oldCustom) {
    oldCustom.remove();
  }

  // Добавляем новое
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  option.selected = true;
  option.setAttribute("data-custom", "true");

  // Вставляем перед последними двумя опциями (Все, Другое)
  const beforeElement =
    elements.itemsPerPageSelect.children[
      elements.itemsPerPageSelect.children.length - 2
    ];
  elements.itemsPerPageSelect.insertBefore(option, beforeElement);
}
```

### Обработчики фильтров

```javascript
/**
 * Handle category filter change
 */
function handleCategoryChange(e) {
  const newCategory = e.target.value || null;

  if (newCategory !== state.filters.category) {
    state.filters.category = newCategory;
    resetToFirstPage();

    console.log("Category filter changed:", newCategory);

    if (state.infiniteScrollMode) {
      resetInfiniteScrollState();
      loadBooksInfiniteScroll();
    } else {
      loadBooks();
    }
  }
}

/**
 * Handle price filter change
 */
function handlePriceChange(e) {
  const value = e.target.value;
  let minPrice = null;
  let maxPrice = null;

  switch (value) {
    case "low":
      minPrice = 0;
      maxPrice = 1000;
      break;
    case "medium":
      minPrice = 1000;
      maxPrice = 2000;
      break;
    case "high":
      minPrice = 2000;
      maxPrice = null;
      break;
    // case 'all' - оставляем null значения
  }

  if (
    minPrice !== state.filters.minPrice ||
    maxPrice !== state.filters.maxPrice
  ) {
    state.filters.minPrice = minPrice;
    state.filters.maxPrice = maxPrice;
    resetToFirstPage();

    console.log("Price filter changed:", { minPrice, maxPrice });

    if (state.infiniteScrollMode) {
      resetInfiniteScrollState();
      loadBooksInfiniteScroll();
    } else {
      loadBooks();
    }
  }
}

/**
 * Handle author type filter change
 */
function handleAuthorTypeChange(e) {
  const value = e.target.value;
  const newAuthorType = value === "all" ? null : value;

  if (newAuthorType !== state.filters.authorType) {
    state.filters.authorType = newAuthorType;
    resetToFirstPage();

    console.log("Author type filter changed:", newAuthorType);

    if (state.infiniteScrollMode) {
      resetInfiniteScrollState();
      loadBooksInfiniteScroll();
    } else {
      loadBooks();
    }
  }
}

/**
 * Reset to first page
 */
function resetToFirstPage() {
  state.currentPage = 1;
}

/**
 * Reset all filters
 */
window.resetAllFilters = function () {
  // Сбрасываем фильтры в состоянии
  filterState.resetFilters();

  // Сбрасываем UI элементы
  const categorySelect = document.getElementById("category-select");
  const priceSelect = document.getElementById("price-select");
  const authorTypeSelect = document.getElementById("author-type-select");

  if (categorySelect) categorySelect.value = "";
  if (priceSelect) priceSelect.value = "all";
  if (authorTypeSelect) authorTypeSelect.value = "all";

  // Перезагружаем книги
  resetToFirstPage();

  if (state.infiniteScrollMode) {
    resetInfiniteScrollState();
    loadBooksInfiniteScroll();
  } else {
    loadBooks();
  }
};
```

---

## 🛠️ Утилиты и хелперы

### Утилиты для UI

```javascript
/**
 * Show loading indicator
 */
function showLoading() {
  if (elements.loading) {
    elements.loading.style.display = "block";
  }
  if (elements.booksContainer) {
    elements.booksContainer.style.opacity = "0.5";
  }
}

/**
 * Hide loading indicator
 */
function hideLoading() {
  if (elements.loading) {
    elements.loading.style.display = "none";
  }
  if (elements.booksContainer) {
    elements.booksContainer.style.opacity = "1";
  }
}

/**
 * Show error message
 */
function showError(message) {
  console.error("Showing error:", message);

  if (elements.booksContainer) {
    elements.booksContainer.innerHTML = `
            <div class="error-message">
                <p>${escapeHtml(message)}</p>
                <button class="btn" onclick="location.reload()">
                    Попробовать снова
                </button>
            </div>
        `;
  }
}

/**
 * Show notification
 */
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;

  document.body.appendChild(notification);

  // Показываем уведомление
  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  // Удаляем через 3 секунды
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

/**
 * Helper functions for showing/hiding elements
 */
function showElement(element) {
  if (element) element.style.display = "";
}

function hideElement(element) {
  if (element) element.style.display = "none";
}
```

### Утилиты безопасности

```javascript
/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
  if (typeof text !== "string") return text;

  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

/**
 * Sanitize URL parameters
 */
function sanitizeURLParam(param) {
  return encodeURIComponent(String(param));
}
```

### Утилиты производительности

```javascript
/**
 * Debounce function
 */
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}
```

### Обработчики ошибок

```javascript
/**
 * Handle image loading errors
 */
function handleImageError(img) {
  if (!img.dataset.errorHandled) {
    img.dataset.errorHandled = "true";
    img.src = "/img/placeholder.jpg";
    img.alt = "Изображение не найдено";
  }
}

/**
 * Handle window resize
 */
const handleWindowResize = debounce(() => {
  // Пересчитываем размеры если нужно
  console.log("Window resized");
}, 250);

/**
 * Global error handler
 */
window.addEventListener("error", (e) => {
  console.error("Global error:", e.error);
  // Отправляем ошибку в аналитику или логирование
});

window.addEventListener("unhandledrejection", (e) => {
  console.error("Unhandled promise rejection:", e.reason);
  // Предотвращаем показ ошибки в консоли
  e.preventDefault();
});
```

### Глобальные функции

```javascript
/**
 * Go to specific page (called from pagination buttons)
 */
window.goToPage = function (page) {
  if (page < 1 || page > state.totalPages || page === state.currentPage) {
    return;
  }

  state.currentPage = page;
  loadBooks();

  // Плавная прокрутка к началу каталога
  const catalogTop = elements.booksContainer.offsetTop - 100;
  window.scrollTo({
    top: catalogTop,
    behavior: "smooth",
  });
};

/**
 * Order book handler (called from book cards)
 */
window.orderBook = function (id, title) {
  console.log("Order book:", { id, title });

  // Здесь будет логика добавления в корзину
  showNotification(`Книга "${title}" добавлена в корзину!`, "success");

  // Аналитика
  trackEvent("book_order", { book_id: id, book_title: title });
};

/**
 * Track analytics events
 */
function trackEvent(eventName, properties = {}) {
  console.log("Analytics event:", eventName, properties);

  // Здесь интеграция с аналитикой (Google Analytics, Yandex Metrica и т.д.)
  if (typeof gtag !== "undefined") {
    gtag("event", eventName, properties);
  }
}
```

---

_[← Назад к HTML/CSS](09_CATALOG_HTML_CSS.md) | [Далее: Infinite Scroll →](11_CATALOG_INFINITE_SCROLL.md)_
