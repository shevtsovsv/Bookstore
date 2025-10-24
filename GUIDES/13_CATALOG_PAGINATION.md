# 📄 Система пагинации каталога

_[← Назад к Фильтрам](12_CATALOG_FILTERS.md) | [К списку руководств →](../GUIDES/)_

---

## 📋 Содержание

1. [Архитектура пагинации](#архитектура-пагинации)
2. [Управление страницами](#управление-страницами)
3. [Пользовательский интерфейс](#пользовательский-интерфейс)
4. [Интеграция с фильтрами](#интеграция-с-фильтрами)
5. [Настройка количества элементов](#настройка-количества-элементов)
6. [Производительность и UX](#производительность-и-ux)

---

## 🏗️ Архитектура пагинации

### Принципы работы

Система пагинации построена на следующих принципах:

1. **Серверная пагинация** - данные загружаются порциями с сервера
2. **Гибкость настроек** - пользователь может выбирать количество элементов
3. **Интеграция с фильтрами** - пагинация сбрасывается при изменении фильтров
4. **Плавные переходы** - анимации и прокрутка для лучшего UX

### Состояние пагинации

```javascript
/**
 * Pagination state in global state object
 */
const paginationState = {
  // Текущая страница (1-indexed)
  currentPage: 1,

  // Количество элементов на странице
  itemsPerPage: 16,

  // Общее количество страниц
  totalPages: 1,

  // Общее количество элементов
  totalItems: 0,

  // Доступные варианты количества на странице
  availablePageSizes: [8, 12, 16, 24, 32, 48],

  // Максимальное количество видимых кнопок страниц
  maxVisiblePages: 7,

  // Кастомное количество (если выбрано пользователем)
  customPageSize: null,
};
```

---

## 🎛️ Управление страницами

### Основные функции навигации

```javascript
/**
 * Navigate to specific page
 */
function goToPage(pageNumber) {
  // Валидация страницы
  if (!isValidPage(pageNumber)) {
    console.warn("Invalid page number:", pageNumber);
    return;
  }

  console.log(`Navigating to page ${pageNumber}`);

  // Обновляем состояние
  state.currentPage = pageNumber;

  // Загружаем данные
  loadBooks();

  // Обновляем URL
  updatePageURL(pageNumber);

  // Прокручиваем к началу каталога
  scrollToCatalogTop();

  // Аналитика
  trackPageNavigation(pageNumber);
}

/**
 * Go to next page
 */
function goToNextPage() {
  if (state.currentPage < state.totalPages) {
    goToPage(state.currentPage + 1);
  }
}

/**
 * Go to previous page
 */
function goToPreviousPage() {
  if (state.currentPage > 1) {
    goToPage(state.currentPage - 1);
  }
}

/**
 * Go to first page
 */
function goToFirstPage() {
  if (state.currentPage !== 1) {
    goToPage(1);
  }
}

/**
 * Go to last page
 */
function goToLastPage() {
  if (state.currentPage !== state.totalPages) {
    goToPage(state.totalPages);
  }
}

/**
 * Validate page number
 */
function isValidPage(pageNumber) {
  return (
    Number.isInteger(pageNumber) &&
    pageNumber >= 1 &&
    pageNumber <= state.totalPages
  );
}

/**
 * Reset to first page (used when filters change)
 */
function resetToFirstPage() {
  state.currentPage = 1;
}
```

### Обновление URL

```javascript
/**
 * Update URL with current page
 */
function updatePageURL(pageNumber) {
  const url = new URL(window.location);

  if (pageNumber === 1) {
    // Удаляем параметр page для первой страницы
    url.searchParams.delete("page");
  } else {
    url.searchParams.set("page", pageNumber);
  }

  // Обновляем URL без перезагрузки
  window.history.replaceState({}, "", url);
}

/**
 * Load page from URL
 */
function loadPageFromURL() {
  const params = new URLSearchParams(window.location.search);
  const pageParam = params.get("page");

  if (pageParam) {
    const pageNumber = parseInt(pageParam);

    if (isValidPage(pageNumber)) {
      state.currentPage = pageNumber;
      return true;
    } else {
      console.warn("Invalid page in URL, redirecting to page 1");
      updatePageURL(1);
    }
  }

  return false;
}
```

### Прокрутка страницы

```javascript
/**
 * Scroll to catalog top with smooth animation
 */
function scrollToCatalogTop() {
  const catalogElement = elements.booksContainer;
  if (!catalogElement) return;

  const offsetTop = catalogElement.offsetTop - 100; // Отступ от верха

  window.scrollTo({
    top: offsetTop,
    behavior: "smooth",
  });
}

/**
 * Scroll to pagination controls
 */
function scrollToPagination() {
  const paginationElement = elements.paginationContainer;
  if (!paginationElement) return;

  paginationElement.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });
}
```

---

## 🎨 Пользовательский интерфейс

### Рендеринг пагинации

```javascript
/**
 * Render pagination controls
 */
function renderPagination() {
  if (!elements.paginationContainer) return;

  // Если только одна страница, скрываем пагинацию
  if (state.totalPages <= 1) {
    elements.paginationContainer.innerHTML = "";
    return;
  }

  const pagination = createPaginationHTML();
  elements.paginationContainer.innerHTML = pagination;

  // Добавляем обработчики событий
  addPaginationEventListeners();

  console.log(`Rendered pagination for ${state.totalPages} pages`);
}

/**
 * Create pagination HTML
 */
function createPaginationHTML() {
  const pages = generatePageNumbers();

  return `
        <div class="pagination-wrapper">
            <div class="pagination-info">
                ${createPaginationInfo()}
            </div>
            <div class="pagination-controls">
                ${createNavigationButtons()}
                ${createPageButtons(pages)}
                ${createNavigationButtons(false)}
            </div>
            <div class="pagination-jump">
                ${createPageJumpInput()}
            </div>
        </div>
    `;
}

/**
 * Create pagination info text
 */
function createPaginationInfo() {
  const startItem = (state.currentPage - 1) * state.itemsPerPage + 1;
  const endItem = Math.min(
    state.currentPage * state.itemsPerPage,
    state.totalItems
  );

  return `
        <span class="pagination-text">
            Показано ${startItem}-${endItem} из ${state.totalItems} книг
        </span>
    `;
}

/**
 * Create navigation buttons (prev/next, first/last)
 */
function createNavigationButtons(isLeft = true) {
  if (isLeft) {
    return `
            <button 
                class="pagination-btn pagination-btn-nav" 
                data-action="first"
                ${state.currentPage === 1 ? "disabled" : ""}
                title="Первая страница"
            >
                ⏮️
            </button>
            <button 
                class="pagination-btn pagination-btn-nav" 
                data-action="prev"
                ${state.currentPage === 1 ? "disabled" : ""}
                title="Предыдущая страница"
            >
                ◀️
            </button>
        `;
  } else {
    return `
            <button 
                class="pagination-btn pagination-btn-nav" 
                data-action="next"
                ${state.currentPage === state.totalPages ? "disabled" : ""}
                title="Следующая страница"
            >
                ▶️
            </button>
            <button 
                class="pagination-btn pagination-btn-nav" 
                data-action="last"
                ${state.currentPage === state.totalPages ? "disabled" : ""}
                title="Последняя страница"
            >
                ⏭️
            </button>
        `;
  }
}

/**
 * Create page number buttons
 */
function createPageButtons(pages) {
  return pages
    .map((page) => {
      if (page === "...") {
        return `<span class="pagination-ellipsis">...</span>`;
      }

      const isActive = page === state.currentPage;

      return `
            <button 
                class="pagination-btn pagination-btn-page ${
                  isActive ? "active" : ""
                }"
                data-page="${page}"
                ${isActive ? "disabled" : ""}
            >
                ${page}
            </button>
        `;
    })
    .join("");
}

/**
 * Create page jump input
 */
function createPageJumpInput() {
  return `
        <div class="page-jump">
            <label for="page-jump-input">Перейти к странице:</label>
            <input 
                type="number" 
                id="page-jump-input" 
                class="page-jump-input"
                min="1" 
                max="${state.totalPages}"
                value="${state.currentPage}"
                placeholder="№"
            >
            <button class="btn btn-small" onclick="jumpToPage()">
                Перейти
            </button>
        </div>
    `;
}
```

### Генерация номеров страниц

```javascript
/**
 * Generate page numbers for pagination display
 */
function generatePageNumbers() {
  const maxVisible = state.maxVisiblePages;
  const current = state.currentPage;
  const total = state.totalPages;

  // Если страниц меньше максимума, показываем все
  if (total <= maxVisible) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const pages = [];
  const sidePages = Math.floor((maxVisible - 3) / 2); // -3 для первой, последней и текущей

  // Всегда показываем первую страницу
  pages.push(1);

  // Определяем диапазон вокруг текущей страницы
  let startPage = Math.max(2, current - sidePages);
  let endPage = Math.min(total - 1, current + sidePages);

  // Корректируем диапазон если он слишком мал
  if (endPage - startPage < maxVisible - 3) {
    if (current < total / 2) {
      endPage = Math.min(total - 1, startPage + maxVisible - 3);
    } else {
      startPage = Math.max(2, endPage - maxVisible + 3);
    }
  }

  // Добавляем многоточие если нужно
  if (startPage > 2) {
    pages.push("...");
  }

  // Добавляем страницы в диапазоне
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  // Добавляем многоточие если нужно
  if (endPage < total - 1) {
    pages.push("...");
  }

  // Всегда показываем последнюю страницу (если она не первая)
  if (total > 1) {
    pages.push(total);
  }

  return pages;
}
```

### Обработчики событий

```javascript
/**
 * Add event listeners to pagination elements
 */
function addPaginationEventListeners() {
  const paginationContainer = elements.paginationContainer;
  if (!paginationContainer) return;

  // Делегирование событий для кнопок
  paginationContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".pagination-btn");
    if (!button || button.disabled) return;

    const action = button.dataset.action;
    const page = button.dataset.page;

    if (action) {
      handleNavigationAction(action);
    } else if (page) {
      goToPage(parseInt(page));
    }
  });

  // Обработчик для поля ввода номера страницы
  const jumpInput = paginationContainer.querySelector("#page-jump-input");
  if (jumpInput) {
    jumpInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        jumpToPage();
      }
    });

    // Валидация ввода
    jumpInput.addEventListener("input", validatePageJumpInput);
  }
}

/**
 * Handle navigation action (first, prev, next, last)
 */
function handleNavigationAction(action) {
  switch (action) {
    case "first":
      goToFirstPage();
      break;
    case "prev":
      goToPreviousPage();
      break;
    case "next":
      goToNextPage();
      break;
    case "last":
      goToLastPage();
      break;
  }
}

/**
 * Jump to specific page from input
 */
window.jumpToPage = function () {
  const input = document.getElementById("page-jump-input");
  if (!input) return;

  const pageNumber = parseInt(input.value);

  if (isValidPage(pageNumber)) {
    goToPage(pageNumber);
  } else {
    showNotification("Пожалуйста, введите корректный номер страницы", "error");
    input.focus();
    input.select();
  }
};

/**
 * Validate page jump input
 */
function validatePageJumpInput(e) {
  const value = parseInt(e.target.value);
  const isValid = isValidPage(value);

  e.target.style.borderColor = isValid ? "" : "#e74c3c";
}
```

---

## 🔗 Интеграция с фильтрами

### Сброс пагинации при изменении фильтров

```javascript
/**
 * Reset pagination when filters change
 */
function onFiltersChanged() {
  console.log("Filters changed, resetting pagination...");

  // Сбрасываем на первую страницу
  resetToFirstPage();

  // Обновляем URL
  updatePageURL(1);

  // Перезагружаем данные
  if (state.infiniteScrollMode) {
    resetInfiniteScrollState();
    loadBooksInfiniteScroll();
  } else {
    loadBooks();
  }
}

/**
 * Update pagination info when data changes
 */
function updatePaginationInfo(apiResponse) {
  if (apiResponse.data && apiResponse.data.pagination) {
    const pagination = apiResponse.data.pagination;

    state.totalPages = pagination.totalPages;
    state.totalItems = pagination.totalItems;
    state.currentPage = pagination.currentPage;

    console.log("Pagination info updated:", {
      currentPage: state.currentPage,
      totalPages: state.totalPages,
      totalItems: state.totalItems,
    });
  }
}
```

### Сохранение состояния пагинации

```javascript
/**
 * Save pagination state to sessionStorage
 */
function savePaginationState() {
  const paginationData = {
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    customPageSize: state.customPageSize,
    timestamp: Date.now(),
  };

  try {
    sessionStorage.setItem("catalogPagination", JSON.stringify(paginationData));
  } catch (error) {
    console.warn("Could not save pagination state:", error);
  }
}

/**
 * Load pagination state from sessionStorage
 */
function loadPaginationState() {
  try {
    const saved = sessionStorage.getItem("catalogPagination");
    if (!saved) return false;

    const paginationData = JSON.parse(saved);
    const age = Date.now() - paginationData.timestamp;

    // Используем сохраненное состояние только если оно не старше 30 минут
    if (age < 30 * 60 * 1000) {
      state.currentPage = paginationData.currentPage;
      state.itemsPerPage = paginationData.itemsPerPage;
      state.customPageSize = paginationData.customPageSize;
      return true;
    }
  } catch (error) {
    console.warn("Could not load pagination state:", error);
  }

  return false;
}
```

---

## ⚙️ Настройка количества элементов

### Выбор количества на странице

```javascript
/**
 * Handle items per page change
 */
function handleItemsPerPageChange(newValue) {
  console.log("Items per page changed to:", newValue);

  if (newValue === "all") {
    // Переключаемся в режим infinite scroll
    enableInfiniteScrollMode();
    return;
  }

  if (newValue === "custom") {
    // Показываем поле для пользовательского ввода
    showCustomItemsInput();
    return;
  }

  // Обычное изменение количества
  const itemsCount = parseInt(newValue);

  if (itemsCount && itemsCount > 0) {
    changeItemsPerPage(itemsCount);
  }
}

/**
 * Change items per page count
 */
function changeItemsPerPage(newCount) {
  const oldItemsPerPage = state.itemsPerPage;

  // Вычисляем новую страницу чтобы показать примерно те же книги
  const firstItemIndex = (state.currentPage - 1) * oldItemsPerPage;
  const newPage = Math.floor(firstItemIndex / newCount) + 1;

  // Обновляем состояние
  state.itemsPerPage = newCount;
  state.currentPage = newPage;

  // Отключаем infinite scroll если был включен
  if (state.infiniteScrollMode) {
    disableInfiniteScrollMode();
  }

  // Сохраняем состояние
  savePaginationState();

  // Перезагружаем данные
  loadBooks();

  // Аналитика
  trackEvent("items_per_page_changed", {
    old_count: oldItemsPerPage,
    new_count: newCount,
    new_page: newPage,
  });
}

/**
 * Show custom items input
 */
function showCustomItemsInput() {
  toggleCustomInput(true);

  const input = elements.customItemsInput;
  if (input) {
    input.focus();
    input.value = state.itemsPerPage.toString();
    input.select();
  }
}

/**
 * Apply custom items count
 */
function applyCustomItemsCount() {
  const input = elements.customItemsInput;
  if (!input) return;

  const customValue = parseInt(input.value);

  if (isValidCustomItemsCount(customValue)) {
    changeItemsPerPage(customValue);

    // Добавляем в селектор как пользовательскую опцию
    addCustomOptionToSelector(customValue);

    // Скрываем поле ввода
    toggleCustomInput(false);

    showNotification(`Показ по ${customValue} книг на странице`, "success");
  } else {
    showNotification("Пожалуйста, введите число от 1 до 1000", "error");
    input.focus();
    input.select();
  }
}

/**
 * Validate custom items count
 */
function isValidCustomItemsCount(value) {
  return Number.isInteger(value) && value >= 1 && value <= 1000;
}

/**
 * Add custom option to items per page selector
 */
function addCustomOptionToSelector(value) {
  const select = elements.itemsPerPageSelect;
  if (!select) return;

  // Удаляем старую пользовательскую опцию
  const oldCustom = select.querySelector('option[data-custom="true"]');
  if (oldCustom) {
    oldCustom.remove();
  }

  // Создаем новую опцию
  const option = document.createElement("option");
  option.value = value;
  option.textContent = value;
  option.selected = true;
  option.setAttribute("data-custom", "true");

  // Находим правильное место для вставки
  const allOption = select.querySelector('option[value="all"]');
  if (allOption) {
    select.insertBefore(option, allOption);
  } else {
    select.appendChild(option);
  }
}
```

### Умные предложения

```javascript
/**
 * Suggest optimal page size based on screen and content
 */
function suggestOptimalPageSize() {
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;

  // Базовые размеры карточки
  const cardWidth = 280;
  const cardHeight = 400;

  // Вычисляем количество колонок
  const columns = Math.floor(screenWidth / cardWidth);

  // Вычисляем количество строк на экране
  const availableHeight = screenHeight - 300; // Учитываем header, filters, pagination
  const rows = Math.floor(availableHeight / cardHeight);

  // Предлагаем количество равное 2-3 экранам
  const suggested = Math.max(8, columns * rows * 2);

  // Округляем до ближайшего стандартного значения
  const standardSizes = [8, 12, 16, 24, 32, 48];
  const closest = standardSizes.reduce((prev, curr) =>
    Math.abs(curr - suggested) < Math.abs(prev - suggested) ? curr : prev
  );

  console.log("Suggested page size:", {
    screenSize: { width: screenWidth, height: screenHeight },
    calculated: suggested,
    suggested: closest,
  });

  return closest;
}

/**
 * Auto-adjust page size for mobile
 */
function autoAdjustForMobile() {
  if (window.innerWidth <= 768 && state.itemsPerPage > 16) {
    console.log("Auto-adjusting page size for mobile");
    changeItemsPerPage(12);
    showNotification(
      "Размер страницы адаптирован для мобильного устройства",
      "info"
    );
  }
}

// Настраиваем автоматическую адаптацию
const debouncedAutoAdjust = debounce(autoAdjustForMobile, 500);
window.addEventListener("resize", debouncedAutoAdjust);
```

---

## ⚡ Производительность и UX

### Кэширование страниц

```javascript
/**
 * Page cache for better performance
 */
const pageCache = {
  cache: new Map(),
  maxSize: 10,

  /**
   * Generate cache key
   */
  generateKey(page, itemsPerPage, filters) {
    return JSON.stringify({
      page,
      itemsPerPage,
      filters: filterState.getActiveFilters(),
    });
  },

  /**
   * Get cached data
   */
  get(page, itemsPerPage, filters) {
    const key = this.generateKey(page, itemsPerPage, filters);
    const cached = this.cache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;

      // Кэш валиден 5 минут
      if (age < 5 * 60 * 1000) {
        console.log("Using cached page data");
        return cached.data;
      } else {
        this.cache.delete(key);
      }
    }

    return null;
  },

  /**
   * Cache page data
   */
  set(page, itemsPerPage, filters, data) {
    const key = this.generateKey(page, itemsPerPage, filters);

    this.cache.set(key, {
      data: data,
      timestamp: Date.now(),
    });

    // Ограничиваем размер кэша
    if (this.cache.size > this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
  },

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  },
};
```

### Предзагрузка соседних страниц

```javascript
/**
 * Preload adjacent pages for faster navigation
 */
function preloadAdjacentPages() {
  if (state.infiniteScrollMode) return;

  const toPreload = [];

  // Предзагружаем следующую страницу
  if (state.currentPage < state.totalPages) {
    toPreload.push(state.currentPage + 1);
  }

  // Предзагружаем предыдущую страницу
  if (state.currentPage > 1) {
    toPreload.push(state.currentPage - 1);
  }

  toPreload.forEach((page) => {
    setTimeout(() => preloadPage(page), 1000);
  });
}

/**
 * Preload specific page
 */
async function preloadPage(page) {
  try {
    // Проверяем кэш
    const cached = pageCache.get(page, state.itemsPerPage, state.filters);
    if (cached) return;

    console.log("Preloading page:", page);

    const params = new URLSearchParams({
      page: page,
      limit: state.itemsPerPage,
      sortBy: "popularity",
      sortOrder: "DESC",
    });

    // Добавляем фильтры
    const apiFilters = filterState.getAPIFilters();
    Object.entries(apiFilters).forEach(([key, value]) => {
      params.append(key, value);
    });

    const response = await fetch(`/api/books?${params}`);

    if (response.ok) {
      const data = await response.json();

      if (data.success) {
        // Кэшируем данные
        pageCache.set(page, state.itemsPerPage, state.filters, data);
        console.log("Page preloaded successfully:", page);
      }
    }
  } catch (error) {
    console.warn("Failed to preload page:", page, error);
  }
}
```

### Оптимизация рендеринга

```javascript
/**
 * Optimized pagination rendering with virtual scrolling for large page counts
 */
function renderPaginationOptimized() {
  if (!elements.paginationContainer) return;

  // Для большого количества страниц используем упрощенную пагинацию
  if (state.totalPages > 100) {
    renderSimplifiedPagination();
  } else {
    renderStandardPagination();
  }
}

/**
 * Render simplified pagination for large page counts
 */
function renderSimplifiedPagination() {
  const html = `
        <div class="pagination-wrapper simplified">
            <div class="pagination-info">
                ${createPaginationInfo()}
            </div>
            <div class="pagination-controls simplified">
                <button class="pagination-btn" onclick="goToFirstPage()" ${
                  state.currentPage === 1 ? "disabled" : ""
                }>
                    Первая
                </button>
                <button class="pagination-btn" onclick="goToPreviousPage()" ${
                  state.currentPage === 1 ? "disabled" : ""
                }>
                    ← Назад
                </button>
                
                <div class="page-input-group">
                    <span>Страница</span>
                    <input type="number" id="current-page-input" value="${
                      state.currentPage
                    }" min="1" max="${state.totalPages}">
                    <span>из ${state.totalPages}</span>
                    <button class="btn btn-small" onclick="jumpToPageFromInput()">Перейти</button>
                </div>
                
                <button class="pagination-btn" onclick="goToNextPage()" ${
                  state.currentPage === state.totalPages ? "disabled" : ""
                }>
                    Вперед →
                </button>
                <button class="pagination-btn" onclick="goToLastPage()" ${
                  state.currentPage === state.totalPages ? "disabled" : ""
                }>
                    Последняя
                </button>
            </div>
        </div>
    `;

  elements.paginationContainer.innerHTML = html;

  // Добавляем обработчик для поля ввода
  const pageInput = document.getElementById("current-page-input");
  if (pageInput) {
    pageInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        jumpToPageFromInput();
      }
    });
  }
}

/**
 * Jump to page from current page input
 */
window.jumpToPageFromInput = function () {
  const input = document.getElementById("current-page-input");
  if (!input) return;

  const pageNumber = parseInt(input.value);

  if (isValidPage(pageNumber)) {
    goToPage(pageNumber);
  } else {
    showNotification("Некорректный номер страницы", "error");
    input.value = state.currentPage;
  }
};
```

### Аналитика пагинации

```javascript
/**
 * Track pagination usage analytics
 */
function trackPageNavigation(pageNumber) {
  trackEvent("page_navigation", {
    from_page: state.currentPage,
    to_page: pageNumber,
    total_pages: state.totalPages,
    items_per_page: state.itemsPerPage,
    has_filters: filterState.hasActiveFilters(),
  });
}

/**
 * Track pagination patterns
 */
function trackPaginationPatterns() {
  // Отслеживаем использование разных способов навигации
  const paginationContainer = elements.paginationContainer;
  if (!paginationContainer) return;

  paginationContainer.addEventListener("click", (e) => {
    const button = e.target.closest(".pagination-btn");
    if (!button) return;

    const action = button.dataset.action;
    const page = button.dataset.page;

    let navigationType;
    if (action === "first" || action === "last") {
      navigationType = "edge_navigation";
    } else if (action === "prev" || action === "next") {
      navigationType = "sequential_navigation";
    } else if (page) {
      navigationType = "direct_navigation";
    }

    if (navigationType) {
      trackEvent("pagination_interaction", {
        type: navigationType,
        current_page: state.currentPage,
        target_page: page ? parseInt(page) : null,
        total_pages: state.totalPages,
      });
    }
  });
}
```

---

_[← Назад к Фильтрам](12_CATALOG_FILTERS.md) | [К списку руководств →](../GUIDES/)_
