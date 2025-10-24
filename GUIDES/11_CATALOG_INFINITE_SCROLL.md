# ⚡ Infinite Scroll реализация

_[← Назад к JavaScript](10_CATALOG_JAVASCRIPT.md) | [Далее: Фильтры →](12_CATALOG_FILTERS.md)_

---

## 📋 Содержание

1. [Архитектура Infinite Scroll](#архитектура-infinite-scroll)
2. [Intersection Observer](#intersection-observer)
3. [Состояние и управление](#состояние-и-управление)
4. [Переключение режимов](#переключение-режимов)
5. [Загрузка данных](#загрузка-данных)
6. [UI компоненты](#ui-компоненты)

---

## 🏗️ Архитектура Infinite Scroll

### Принципы работы

Infinite Scroll в нашем каталоге работает по следующим принципам:

1. **Intersection Observer API** - отслеживание видимости элемента-наблюдателя
2. **Прогрессивная загрузка** - добавление новых книг к существующим
3. **Управление состоянием** - отслеживание загрузки и доступности данных
4. **Гибридный подход** - возможность переключения между пагинацией и infinite scroll

### Компоненты системы

```javascript
/**
 * Infinite Scroll состояние в глобальном state
 */
const infiniteScrollState = {
  // Режим infinite scroll активен
  infiniteScrollMode: false,

  // Процесс загрузки дополнительных книг
  isLoadingMore: false,

  // Есть ли еще книги для загрузки
  hasMoreBooks: true,

  // Intersection Observer instance
  scrollObserver: null,

  // Текущая страница для загрузки
  currentLoadPage: 1,

  // Все загруженные книги в режиме infinite scroll
  allBooksLoaded: [],
};
```

---

## 👁️ Intersection Observer

### Настройка Observer

```javascript
/**
 * Create and configure Intersection Observer
 */
function createIntersectionObserver() {
  const options = {
    // Корневой элемент для определения пересечения
    root: null, // viewport

    // Отступ от края viewport
    rootMargin: "100px 0px", // Загружаем за 100px до видимости

    // Процент видимости элемента для срабатывания
    threshold: 0.1, // 10% элемента должно быть видно
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        console.log("Scroll sentinel intersecting, loading more books...");
        loadMoreBooks();
      }
    });
  }, options);

  return observer;
}

/**
 * Start observing the scroll sentinel
 */
function startObserving() {
  if (!state.scrollObserver) {
    state.scrollObserver = createIntersectionObserver();
  }

  if (elements.scrollSentinel) {
    state.scrollObserver.observe(elements.scrollSentinel);
    console.log("Started observing scroll sentinel");
  }
}

/**
 * Stop observing the scroll sentinel
 */
function stopObserving() {
  if (state.scrollObserver && elements.scrollSentinel) {
    state.scrollObserver.unobserve(elements.scrollSentinel);
    console.log("Stopped observing scroll sentinel");
  }
}

/**
 * Cleanup observer
 */
function cleanupObserver() {
  if (state.scrollObserver) {
    state.scrollObserver.disconnect();
    state.scrollObserver = null;
    console.log("Intersection observer cleaned up");
  }
}
```

### Элемент-наблюдатель (Sentinel)

```html
<!-- Элемент для отслеживания прокрутки -->
<div id="scroll-sentinel" class="scroll-sentinel" style="display: none;">
  <div class="sentinel-inner">
    <!-- Визуально пустой элемент, который активирует загрузку -->
  </div>
</div>
```

```css
.scroll-sentinel {
  height: 1px;
  width: 100%;
  position: relative;
  margin: 20px 0;
}

.sentinel-inner {
  position: absolute;
  top: -100px; /* Элемент находится выше видимой области */
  height: 200px;
  width: 100%;
}
```

---

## 🗂️ Состояние и управление

### Включение режима Infinite Scroll

```javascript
/**
 * Enable infinite scroll mode
 */
function enableInfiniteScrollMode() {
  console.log("Enabling infinite scroll mode...");

  // Обновляем состояние
  state.infiniteScrollMode = true;
  state.currentPage = 1;
  state.hasMoreBooks = true;
  state.isLoadingMore = false;

  // Очищаем массив книг
  state.books = [];

  // Показываем UI элементы infinite scroll
  showInfiniteScrollUI();

  // Скрываем пагинацию
  hidePagination();

  // Начинаем загрузку
  loadBooksInfiniteScroll();

  // Обновляем селектор
  updateItemsPerPageSelector("all");
}

/**
 * Show infinite scroll UI elements
 */
function showInfiniteScrollUI() {
  showElement(elements.infiniteScrollInfo);
  showElement(elements.scrollSentinel);
  hideElement(elements.endOfCatalog);
  hideElement(elements.loadingMore);
}

/**
 * Hide pagination controls
 */
function hidePagination() {
  if (elements.paginationContainer) {
    elements.paginationContainer.style.display = "none";
  }

  // Скрываем информацию о странице
  if (elements.pageInfo) {
    elements.pageInfo.style.display = "none";
  }
}
```

### Отключение режима Infinite Scroll

```javascript
/**
 * Disable infinite scroll mode
 */
function disableInfiniteScrollMode() {
  console.log("Disabling infinite scroll mode...");

  // Останавливаем наблюдение
  stopObserving();

  // Обновляем состояние
  state.infiniteScrollMode = false;
  state.isLoadingMore = false;

  // Скрываем UI элементы infinite scroll
  hideInfiniteScrollUI();

  // Показываем пагинацию
  showPagination();

  // Сбрасываем на первую страницу
  state.currentPage = 1;
}

/**
 * Hide infinite scroll UI elements
 */
function hideInfiniteScrollUI() {
  hideElement(elements.infiniteScrollInfo);
  hideElement(elements.scrollSentinel);
  hideElement(elements.endOfCatalog);
  hideElement(elements.loadingMore);
}

/**
 * Show pagination controls
 */
function showPagination() {
  if (elements.paginationContainer) {
    elements.paginationContainer.style.display = "";
  }

  if (elements.pageInfo) {
    elements.pageInfo.style.display = "";
  }
}

/**
 * Switch back to pagination mode (called from button)
 */
function switchBackToPagination() {
  console.log("Switching back to pagination...");

  // Отключаем infinite scroll
  disableInfiniteScrollMode();

  // Возвращаем стандартное количество книг
  state.itemsPerPage = 16;
  updateItemsPerPageSelector("16");

  // Загружаем первую страницу
  loadBooks();

  showNotification("Переключено на обычную пагинацию", "info");
}
```

### Сброс состояния

```javascript
/**
 * Reset infinite scroll state
 */
function resetInfiniteScrollState() {
  console.log("Resetting infinite scroll state...");

  // Останавливаем текущую загрузку
  state.isLoadingMore = false;

  // Сбрасываем страницу
  state.currentPage = 1;

  // Показываем, что есть еще книги
  state.hasMoreBooks = true;

  // Очищаем контейнер
  if (elements.booksContainer) {
    elements.booksContainer.innerHTML = "";
  }

  // Скрываем индикаторы
  hideElement(elements.loadingMore);
  hideElement(elements.endOfCatalog);

  // Показываем sentinel
  showElement(elements.scrollSentinel);
}
```

---

## 📡 Загрузка данных

### Первоначальная загрузка

```javascript
/**
 * Load books in infinite scroll mode
 */
async function loadBooksInfiniteScroll() {
  if (!state.infiniteScrollMode) return;

  console.log("Loading books for infinite scroll...");

  try {
    // Начинаем наблюдение
    startObserving();

    // Загружаем первую порцию книг
    await loadMoreBooks();

    // Обновляем счетчик
    updateInfiniteScrollInfo();
  } catch (error) {
    console.error("Error in infinite scroll loading:", error);
    showError("Ошибка при загрузке книг");
  }
}
```

### Загрузка дополнительных книг

```javascript
/**
 * Load more books for infinite scroll
 */
async function loadMoreBooks() {
  // Предотвращаем множественные запросы
  if (state.isLoadingMore || !state.hasMoreBooks || !state.infiniteScrollMode) {
    return;
  }

  console.log("Loading more books...", {
    currentPage: state.currentPage,
    totalBooks: state.books.length,
  });

  try {
    // Устанавливаем флаг загрузки
    state.isLoadingMore = true;
    showLoadingMore();

    // Строим параметры запроса
    const params = buildInfiniteScrollParams();

    const response = await fetch(`/api/books?${params}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data.success && data.data) {
      const newBooks = data.data.books;
      const pagination = data.data.pagination;

      console.log(`Loaded ${newBooks.length} additional books`);

      if (newBooks.length > 0) {
        // Добавляем новые книги к существующим
        appendNewBooks(newBooks);

        // Обновляем состояние
        state.currentPage = pagination.currentPage + 1;
        state.totalItems = pagination.totalItems;

        // Проверяем, есть ли еще книги
        if (pagination.currentPage >= pagination.totalPages) {
          state.hasMoreBooks = false;
          showEndOfCatalog();
          stopObserving();
        }

        // Обновляем информацию
        updateInfiniteScrollInfo();
      } else {
        // Нет новых книг
        state.hasMoreBooks = false;
        showEndOfCatalog();
        stopObserving();
      }
    }
  } catch (error) {
    console.error("Error loading more books:", error);
    showNotification("Ошибка при загрузке дополнительных книг", "error");

    // Разрешаем повторную попытку
    state.isLoadingMore = false;
  } finally {
    hideLoadingMore();
    state.isLoadingMore = false;
  }
}

/**
 * Build API parameters for infinite scroll
 */
function buildInfiniteScrollParams() {
  const params = new URLSearchParams({
    page: state.currentPage,
    limit: 16, // Фиксированное количество для infinite scroll
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

### Добавление новых книг

```javascript
/**
 * Append new books to the existing catalog
 */
function appendNewBooks(newBooks) {
  // Добавляем к массиву состояния
  state.books = state.books.concat(newBooks);

  // Создаем HTML для новых книг
  const newBooksHTML = newBooks
    .map((book) => createBookCardHTML(book))
    .join("");

  // Добавляем к существующему контенту
  if (elements.booksContainer) {
    elements.booksContainer.insertAdjacentHTML("beforeend", newBooksHTML);
  }

  // Добавляем анимацию для новых карточек
  animateNewBooks(newBooks.length);

  console.log(
    `Added ${newBooks.length} new books. Total: ${state.books.length}`
  );
}

/**
 * Animate new book cards
 */
function animateNewBooks(count) {
  const allCards = elements.booksContainer.querySelectorAll(".book-card");
  const newCards = Array.from(allCards).slice(-count);

  newCards.forEach((card, index) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px)";

    setTimeout(() => {
      card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 100);
  });
}
```

---

## 🎨 UI компоненты

### Информационная панель

```javascript
/**
 * Update infinite scroll info display
 */
function updateInfiniteScrollInfo() {
  if (!elements.infiniteScrollInfo || !state.infiniteScrollMode) return;

  const infoElement = elements.infiniteScrollInfo.querySelector(".scroll-info");
  if (infoElement) {
    infoElement.textContent = `Показано: ${state.books.length} из ${state.totalItems} книг`;
  }

  // Обновляем прогресс-бар
  updateProgressBar();
}

/**
 * Update progress bar
 */
function updateProgressBar() {
  const progressBar =
    elements.infiniteScrollInfo.querySelector(".progress-fill");
  if (progressBar && state.totalItems > 0) {
    const progress = (state.books.length / state.totalItems) * 100;
    progressBar.style.width = `${Math.min(progress, 100)}%`;
  }
}
```

### Индикаторы загрузки

```javascript
/**
 * Show loading more indicator
 */
function showLoadingMore() {
  if (elements.loadingMore) {
    elements.loadingMore.style.display = "flex";
  }

  // Скрываем sentinel во время загрузки
  hideElement(elements.scrollSentinel);
}

/**
 * Hide loading more indicator
 */
function hideLoadingMore() {
  if (elements.loadingMore) {
    elements.loadingMore.style.display = "none";
  }

  // Показываем sentinel если есть еще книги
  if (state.hasMoreBooks) {
    showElement(elements.scrollSentinel);
  }
}

/**
 * Show end of catalog message
 */
function showEndOfCatalog() {
  if (elements.endOfCatalog) {
    elements.endOfCatalog.style.display = "block";
  }

  hideElement(elements.scrollSentinel);
  hideElement(elements.loadingMore);

  // Обновляем информацию
  const infoElement =
    elements.infiniteScrollInfo?.querySelector(".scroll-info");
  if (infoElement) {
    infoElement.textContent = `Показаны все ${state.books.length} книг`;
  }
}
```

### Обновление селектора

```javascript
/**
 * Update items per page selector value
 */
function updateItemsPerPageSelector(value) {
  if (elements.itemsPerPageSelect) {
    elements.itemsPerPageSelect.value = value;

    // Показываем/скрываем пользовательский ввод
    toggleCustomInput(value === "custom");
  }
}
```

---

## 🚨 Обработка ошибок

### Ошибки загрузки

```javascript
/**
 * Handle infinite scroll loading errors
 */
function handleInfiniteScrollError(error) {
  console.error("Infinite scroll error:", error);

  // Сбрасываем состояние загрузки
  state.isLoadingMore = false;
  hideLoadingMore();

  // Показываем сообщение об ошибке
  const errorMessage = document.createElement("div");
  errorMessage.className = "infinite-scroll-error";
  errorMessage.innerHTML = `
        <p>Ошибка при загрузке дополнительных книг</p>
        <button onclick="retryLoadMore()" class="btn btn-retry">
            Попробовать снова
        </button>
    `;

  // Вставляем перед sentinel
  if (elements.scrollSentinel && elements.scrollSentinel.parentNode) {
    elements.scrollSentinel.parentNode.insertBefore(
      errorMessage,
      elements.scrollSentinel
    );
  }

  // Удаляем сообщение через время
  setTimeout(() => {
    errorMessage.remove();
    if (state.infiniteScrollMode && state.hasMoreBooks) {
      showElement(elements.scrollSentinel);
    }
  }, 5000);
}

/**
 * Retry loading more books
 */
window.retryLoadMore = function () {
  const errorElements = document.querySelectorAll(".infinite-scroll-error");
  errorElements.forEach((el) => el.remove());

  if (state.infiniteScrollMode && state.hasMoreBooks) {
    loadMoreBooks();
  }
};
```

### Fallback для старых браузеров

```javascript
/**
 * Check if Intersection Observer is supported
 */
function isIntersectionObserverSupported() {
  return "IntersectionObserver" in window;
}

/**
 * Fallback for browsers without Intersection Observer
 */
function setupScrollFallback() {
  if (isIntersectionObserverSupported()) {
    return;
  }

  console.log("Using scroll fallback for infinite scroll");

  const scrollHandler = throttle(() => {
    if (
      !state.infiniteScrollMode ||
      state.isLoadingMore ||
      !state.hasMoreBooks
    ) {
      return;
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    // Загружаем когда до конца остается меньше 500px
    if (scrollTop + windowHeight >= documentHeight - 500) {
      loadMoreBooks();
    }
  }, 250);

  window.addEventListener("scroll", scrollHandler);

  // Сохраняем ссылку для очистки
  state.scrollFallbackHandler = scrollHandler;
}

/**
 * Cleanup scroll fallback
 */
function cleanupScrollFallback() {
  if (state.scrollFallbackHandler) {
    window.removeEventListener("scroll", state.scrollFallbackHandler);
    state.scrollFallbackHandler = null;
  }
}
```

---

## 📊 Аналитика и мониторинг

### Отслеживание событий

```javascript
/**
 * Track infinite scroll events
 */
function trackInfiniteScrollEvents() {
  // Включение режима
  trackEvent("infinite_scroll_enabled", {
    total_books: state.totalItems,
    active_filters: Object.keys(filterState.getActiveFilters()).length,
  });
}

/**
 * Track loading events
 */
function trackLoadingEvents(booksLoaded, totalBooks) {
  trackEvent("infinite_scroll_load", {
    books_loaded: booksLoaded,
    total_books_displayed: totalBooks,
    page: state.currentPage - 1,
    has_filters: filterState.hasActiveFilters(),
  });
}

/**
 * Track completion events
 */
function trackCompletionEvents() {
  trackEvent("infinite_scroll_completed", {
    total_books_viewed: state.books.length,
    total_books_available: state.totalItems,
    completion_rate: (state.books.length / state.totalItems) * 100,
  });
}
```

### Производительность

```javascript
/**
 * Monitor infinite scroll performance
 */
function monitorPerformance() {
  // Измеряем время загрузки
  const loadStartTime = performance.now();

  return {
    end: () => {
      const loadTime = performance.now() - loadStartTime;
      console.log(`Infinite scroll load time: ${loadTime.toFixed(2)}ms`);

      // Отправляем метрики
      trackEvent("infinite_scroll_performance", {
        load_time: Math.round(loadTime),
        books_count: state.books.length,
      });
    },
  };
}
```

---

_[← Назад к JavaScript](10_CATALOG_JAVASCRIPT.md) | [Далее: Фильтры →](12_CATALOG_FILTERS.md)_
