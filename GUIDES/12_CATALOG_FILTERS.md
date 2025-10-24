# 🔍 Система фильтров каталога

_[← Назад к Infinite Scroll](11_CATALOG_INFINITE_SCROLL.md) | [Далее: Пагинация →](13_CATALOG_PAGINATION.md)_

---

## 📋 Содержание

1. [Архитектура фильтров](#архитектура-фильтров)
2. [Типы фильтров](#типы-фильтров)
3. [Управление состоянием](#управление-состоянием)
4. [Интеграция с API](#интеграция-с-api)
5. [Пользовательский интерфейс](#пользовательский-интерфейс)
6. [Производительность](#производительность)

---

## 🏗️ Архитектура фильтров

### Принципы работы

Система фильтров построена на следующих принципах:

1. **Реактивность** - изменение любого фильтра мгновенно обновляет результаты
2. **Композитность** - фильтры можно комбинировать любым способом
3. **Персистентность** - состояние фильтров сохраняется в URL
4. **Производительность** - дебаунсинг и оптимизация запросов

### Структура фильтров

```javascript
/**
 * Конфигурация доступных фильтров
 */
const filterConfig = {
  category: {
    type: "select",
    apiParam: "category",
    defaultValue: null,
    label: "Жанр",
    options: [], // Загружается динамически
  },

  price: {
    type: "select",
    apiParam: ["minPrice", "maxPrice"],
    defaultValue: "all",
    label: "Цена",
    options: [
      { value: "all", label: "Любая цена", min: null, max: null },
      { value: "low", label: "До 1000 руб.", min: 0, max: 1000 },
      { value: "medium", label: "1000-2000 руб.", min: 1000, max: 2000 },
      { value: "high", label: "От 2000 руб.", min: 2000, max: null },
    ],
  },

  authorType: {
    type: "select",
    apiParam: "authorType",
    defaultValue: "all",
    label: "Тип автора",
    options: [
      { value: "all", label: "Все авторы" },
      { value: "russian", label: "Русские авторы" },
      { value: "foreign", label: "Зарубежные авторы" },
    ],
  },
};
```

---

## 🎛️ Типы фильтров

### Фильтр по категориям

#### HTML структура

```html
<div class="filter-group">
  <label for="category-select">Жанр:</label>
  <select id="category-select" class="filter-select">
    <option value="">Все жанры</option>
    <!-- Опции загружаются динамически -->
  </select>
</div>
```

#### JavaScript логика

```javascript
/**
 * Load and render category filter
 */
async function initCategoryFilter() {
  try {
    console.log("Initializing category filter...");

    // Загружаем категории с сервера
    const categories = await fetchCategories();

    // Сохраняем в состояние
    state.categories = categories;

    // Отображаем в селекторе
    renderCategoryOptions(categories);

    // Настраиваем обработчики
    setupCategoryEventListeners();

    console.log(
      `Category filter initialized with ${categories.length} options`
    );
  } catch (error) {
    console.error("Error initializing category filter:", error);
    renderCategoryError();
  }
}

/**
 * Fetch categories from API
 */
async function fetchCategories() {
  const response = await fetch("/api/categories?limit=100");

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data = await response.json();

  if (!data.success || !data.data.categories) {
    throw new Error("Invalid categories response format");
  }

  return data.data.categories;
}

/**
 * Render category options in select
 */
function renderCategoryOptions(categories) {
  const select = document.getElementById("category-select");
  if (!select) return;

  // Очищаем существующие опции (кроме первой)
  while (select.children.length > 1) {
    select.removeChild(select.lastChild);
  }

  // Добавляем категории
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = escapeHtml(category.name);
    option.dataset.categoryId = category.id;
    select.appendChild(option);
  });
}

/**
 * Setup category filter event listeners
 */
function setupCategoryEventListeners() {
  const select = document.getElementById("category-select");
  if (!select) return;

  select.addEventListener("change", (e) => {
    const categoryId = e.target.value || null;
    updateCategoryFilter(categoryId);
  });
}

/**
 * Update category filter
 */
function updateCategoryFilter(categoryId) {
  if (state.filters.category !== categoryId) {
    console.log("Category filter changed:", categoryId);

    state.filters.category = categoryId;
    resetToFirstPage();
    applyFilters();

    // Аналитика
    trackEvent("filter_category_changed", {
      category_id: categoryId,
      category_name: getCategoryName(categoryId),
    });
  }
}

/**
 * Get category name by ID
 */
function getCategoryName(categoryId) {
  if (!categoryId) return "Все жанры";

  const category = state.categories.find((cat) => cat.id == categoryId);
  return category ? category.name : "Неизвестный жанр";
}
```

### Фильтр по цене

#### HTML структура

```html
<div class="filter-group">
  <label for="price-select">Цена:</label>
  <select id="price-select" class="filter-select">
    <option value="all">Любая цена</option>
    <option value="low">До 1000 руб.</option>
    <option value="medium">1000-2000 руб.</option>
    <option value="high">От 2000 руб.</option>
  </select>
</div>
```

#### JavaScript логика

```javascript
/**
 * Initialize price filter
 */
function initPriceFilter() {
  const select = document.getElementById("price-select");
  if (!select) return;

  select.addEventListener("change", (e) => {
    const priceRange = e.target.value;
    updatePriceFilter(priceRange);
  });

  console.log("Price filter initialized");
}

/**
 * Update price filter
 */
function updatePriceFilter(priceRange) {
  const priceConfig = filterConfig.price.options.find(
    (opt) => opt.value === priceRange
  );

  if (priceConfig) {
    const newMinPrice = priceConfig.min;
    const newMaxPrice = priceConfig.max;

    if (
      state.filters.minPrice !== newMinPrice ||
      state.filters.maxPrice !== newMaxPrice
    ) {
      console.log("Price filter changed:", {
        priceRange,
        min: newMinPrice,
        max: newMaxPrice,
      });

      state.filters.minPrice = newMinPrice;
      state.filters.maxPrice = newMaxPrice;
      resetToFirstPage();
      applyFilters();

      // Аналитика
      trackEvent("filter_price_changed", {
        price_range: priceRange,
        min_price: newMinPrice,
        max_price: newMaxPrice,
      });
    }
  }
}

/**
 * Get current price range label
 */
function getCurrentPriceRangeLabel() {
  const { minPrice, maxPrice } = state.filters;

  if (minPrice === null && maxPrice === null) {
    return "Любая цена";
  }

  const option = filterConfig.price.options.find(
    (opt) => opt.min === minPrice && opt.max === maxPrice
  );

  return option ? option.label : "Пользовательский диапазон";
}
```

### Фильтр по типу автора

#### HTML структура

```html
<div class="filter-group">
  <label for="author-type-select">Тип автора:</label>
  <select id="author-type-select" class="filter-select">
    <option value="all">Все авторы</option>
    <option value="russian">Русские авторы</option>
    <option value="foreign">Зарубежные авторы</option>
  </select>
</div>
```

#### JavaScript логика

```javascript
/**
 * Initialize author type filter
 */
function initAuthorTypeFilter() {
  const select = document.getElementById("author-type-select");
  if (!select) return;

  select.addEventListener("change", (e) => {
    const authorType = e.target.value === "all" ? null : e.target.value;
    updateAuthorTypeFilter(authorType);
  });

  console.log("Author type filter initialized");
}

/**
 * Update author type filter
 */
function updateAuthorTypeFilter(authorType) {
  if (state.filters.authorType !== authorType) {
    console.log("Author type filter changed:", authorType);

    state.filters.authorType = authorType;
    resetToFirstPage();
    applyFilters();

    // Аналитика
    trackEvent("filter_author_type_changed", {
      author_type: authorType || "all",
    });
  }
}
```

---

## 🗂️ Управление состоянием

### Основное состояние фильтров

```javascript
/**
 * Filter state management
 */
const filterState = {
  /**
   * Get active filters (non-null values)
   */
  getActiveFilters() {
    const active = {};

    Object.entries(state.filters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        active[key] = value;
      }
    });

    return active;
  },

  /**
   * Get filters for API request
   */
  getAPIFilters() {
    const apiFilters = {};

    // Категория
    if (state.filters.category) {
      apiFilters.category = state.filters.category;
    }

    // Цена
    if (state.filters.minPrice !== null) {
      apiFilters.minPrice = state.filters.minPrice;
    }
    if (state.filters.maxPrice !== null) {
      apiFilters.maxPrice = state.filters.maxPrice;
    }

    // Тип автора
    if (state.filters.authorType) {
      apiFilters.authorType = state.filters.authorType;
    }

    return apiFilters;
  },

  /**
   * Check if any filters are active
   */
  hasActiveFilters() {
    return Object.keys(this.getActiveFilters()).length > 0;
  },

  /**
   * Reset all filters to default values
   */
  resetAll() {
    state.filters = {
      category: null,
      minPrice: null,
      maxPrice: null,
      authorType: null,
    };

    this.updateUI();
  },

  /**
   * Update UI to reflect current filter state
   */
  updateUI() {
    // Категория
    const categorySelect = document.getElementById("category-select");
    if (categorySelect) {
      categorySelect.value = state.filters.category || "";
    }

    // Цена
    const priceSelect = document.getElementById("price-select");
    if (priceSelect) {
      priceSelect.value = this.getPriceSelectValue();
    }

    // Тип автора
    const authorTypeSelect = document.getElementById("author-type-select");
    if (authorTypeSelect) {
      authorTypeSelect.value = state.filters.authorType || "all";
    }
  },

  /**
   * Get price select value based on current min/max
   */
  getPriceSelectValue() {
    const { minPrice, maxPrice } = state.filters;

    const option = filterConfig.price.options.find(
      (opt) => opt.min === minPrice && opt.max === maxPrice
    );

    return option ? option.value : "all";
  },

  /**
   * Validate filter values
   */
  validate() {
    const errors = [];

    // Проверяем категорию
    if (
      state.filters.category &&
      !state.categories.find((cat) => cat.id == state.filters.category)
    ) {
      errors.push("Invalid category ID");
    }

    // Проверяем цену
    if (
      state.filters.minPrice !== null &&
      (state.filters.minPrice < 0 || state.filters.minPrice > 100000)
    ) {
      errors.push("Invalid min price range");
    }

    if (
      state.filters.maxPrice !== null &&
      (state.filters.maxPrice < 0 || state.filters.maxPrice > 100000)
    ) {
      errors.push("Invalid max price range");
    }

    if (
      state.filters.minPrice !== null &&
      state.filters.maxPrice !== null &&
      state.filters.minPrice > state.filters.maxPrice
    ) {
      errors.push("Min price cannot be greater than max price");
    }

    // Проверяем тип автора
    if (
      state.filters.authorType &&
      !["russian", "foreign"].includes(state.filters.authorType)
    ) {
      errors.push("Invalid author type");
    }

    return errors;
  },
};
```

### URL персистентность

```javascript
/**
 * URL state management for filters
 */
const urlState = {
  /**
   * Save current filters to URL
   */
  saveToURL() {
    const url = new URL(window.location);
    const params = url.searchParams;

    // Очищаем старые параметры фильтров
    this.clearFilterParams(params);

    // Добавляем активные фильтры
    const activeFilters = filterState.getActiveFilters();

    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        params.set(key, value);
      }
    });

    // Обновляем URL без перезагрузки страницы
    window.history.replaceState({}, "", url);
  },

  /**
   * Load filters from URL
   */
  loadFromURL() {
    const params = new URLSearchParams(window.location.search);

    // Загружаем параметры
    const urlFilters = {
      category: params.get("category") || null,
      minPrice: params.get("minPrice")
        ? parseInt(params.get("minPrice"))
        : null,
      maxPrice: params.get("maxPrice")
        ? parseInt(params.get("maxPrice"))
        : null,
      authorType: params.get("authorType") || null,
    };

    // Валидируем и применяем
    if (this.validateURLFilters(urlFilters)) {
      state.filters = urlFilters;
      filterState.updateUI();
      return true;
    }

    return false;
  },

  /**
   * Clear filter parameters from URLSearchParams
   */
  clearFilterParams(params) {
    ["category", "minPrice", "maxPrice", "authorType"].forEach((key) => {
      params.delete(key);
    });
  },

  /**
   * Validate filters loaded from URL
   */
  validateURLFilters(filters) {
    // Сохраняем текущее состояние
    const originalFilters = { ...state.filters };

    // Временно устанавливаем новые фильтры для валидации
    state.filters = filters;

    // Валидируем
    const errors = filterState.validate();

    // Восстанавливаем исходное состояние
    state.filters = originalFilters;

    if (errors.length > 0) {
      console.warn("Invalid URL filters:", errors);
      return false;
    }

    return true;
  },
};
```

---

## 📡 Интеграция с API

### Построение параметров запроса

```javascript
/**
 * Build API request parameters including filters
 */
function buildAPIParams() {
  const params = new URLSearchParams();

  // Основные параметры
  params.append("page", state.currentPage);
  params.append("limit", state.itemsPerPage);
  params.append("sortBy", "popularity");
  params.append("sortOrder", "DESC");

  // Фильтры
  const apiFilters = filterState.getAPIFilters();

  Object.entries(apiFilters).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      params.append(key, value);
    }
  });

  return params;
}

/**
 * Apply filters by reloading data
 */
async function applyFilters() {
  console.log("Applying filters...", filterState.getActiveFilters());

  try {
    // Сохраняем в URL
    urlState.saveToURL();

    // Обновляем счетчик активных фильтров
    updateActiveFiltersCounter();

    // Перезагружаем данные
    if (state.infiniteScrollMode) {
      // В режиме infinite scroll сбрасываем состояние
      resetInfiniteScrollState();
      await loadBooksInfiniteScroll();
    } else {
      // В режиме пагинации загружаем заново
      await loadBooks();
    }

    // Аналитика
    trackFilterUsage();
  } catch (error) {
    console.error("Error applying filters:", error);
    showNotification("Ошибка при применении фильтров", "error");
  }
}

/**
 * Track filter usage analytics
 */
function trackFilterUsage() {
  const activeFilters = filterState.getActiveFilters();

  trackEvent("filters_applied", {
    filters_count: Object.keys(activeFilters).length,
    has_category: !!activeFilters.category,
    has_price: !!(
      activeFilters.minPrice !== undefined ||
      activeFilters.maxPrice !== undefined
    ),
    has_author_type: !!activeFilters.authorType,
    filter_combination: Object.keys(activeFilters).sort().join(","),
  });
}
```

### Дебаунсинг запросов

```javascript
/**
 * Debounced filter application
 */
const debouncedApplyFilters = debounce(applyFilters, 300);

/**
 * Apply filters with debouncing
 */
function applyFiltersDebounced() {
  // Показываем индикатор загрузки
  showFilterLoading();

  // Применяем фильтры с задержкой
  debouncedApplyFilters();
}

/**
 * Show filter loading state
 */
function showFilterLoading() {
  const filtersRow = document.querySelector(".filters-row");
  if (filtersRow) {
    filtersRow.classList.add("loading");
  }
}

/**
 * Hide filter loading state
 */
function hideFilterLoading() {
  const filtersRow = document.querySelector(".filters-row");
  if (filtersRow) {
    filtersRow.classList.remove("loading");
  }
}
```

---

## 🎨 Пользовательский интерфейс

### Счетчик активных фильтров

```javascript
/**
 * Update active filters counter
 */
function updateActiveFiltersCounter() {
  const counter = document.getElementById("active-filters-counter");
  if (!counter) return;

  const activeCount = Object.keys(filterState.getActiveFilters()).length;

  if (activeCount > 0) {
    counter.textContent = activeCount;
    counter.style.display = "inline-block";
    counter.classList.add("has-filters");
  } else {
    counter.style.display = "none";
    counter.classList.remove("has-filters");
  }
}
```

#### HTML для счетчика

```html
<div class="filters-header">
  <h3>
    Фильтры
    <span
      id="active-filters-counter"
      class="filters-counter"
      style="display: none;"
      >0</span
    >
  </h3>
  <button id="reset-filters-btn" class="btn-reset" onclick="resetAllFilters()">
    Сбросить все
  </button>
</div>
```

#### CSS для счетчика

```css
.filters-counter {
  background: #e74c3c;
  color: white;
  border-radius: 50%;
  padding: 2px 6px;
  font-size: 0.75em;
  font-weight: bold;
  margin-left: 5px;
}

.filters-counter.has-filters {
  animation: pulse 0.3s ease-in-out;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
  }
}
```

### Кнопка сброса фильтров

```javascript
/**
 * Reset all filters
 */
window.resetAllFilters = function () {
  console.log("Resetting all filters...");

  // Сбрасываем состояние
  filterState.resetAll();

  // Сбрасываем на первую страницу
  resetToFirstPage();

  // Применяем изменения
  applyFilters();

  // Показываем уведомление
  showNotification("Фильтры сброшены", "info");

  // Аналитика
  trackEvent("filters_reset", {
    previous_filters_count: Object.keys(filterState.getActiveFilters()).length,
  });
};

/**
 * Update reset button visibility
 */
function updateResetButtonVisibility() {
  const resetBtn = document.getElementById("reset-filters-btn");
  if (!resetBtn) return;

  const hasActiveFilters = filterState.hasActiveFilters();
  resetBtn.style.display = hasActiveFilters ? "inline-block" : "none";
}
```

### Визуальная обратная связь

```javascript
/**
 * Add visual feedback for filter changes
 */
function addFilterChangeAnimation(selectElement) {
  if (!selectElement) return;

  selectElement.classList.add("filter-changed");

  setTimeout(() => {
    selectElement.classList.remove("filter-changed");
  }, 300);
}

/**
 * Show filter results summary
 */
function showFilterResultsSummary() {
  const summary = document.getElementById("filter-results-summary");
  if (!summary) return;

  const activeFilters = filterState.getActiveFilters();
  const filtersCount = Object.keys(activeFilters).length;

  if (filtersCount > 0) {
    const filtersText = generateFiltersText(activeFilters);
    summary.innerHTML = `
            <div class="filters-summary">
                <strong>Применены фильтры:</strong> ${filtersText}
                <button onclick="resetAllFilters()" class="btn-link">Сбросить</button>
            </div>
        `;
    summary.style.display = "block";
  } else {
    summary.style.display = "none";
  }
}

/**
 * Generate human-readable filters text
 */
function generateFiltersText(activeFilters) {
  const parts = [];

  if (activeFilters.category) {
    const categoryName = getCategoryName(activeFilters.category);
    parts.push(`жанр "${categoryName}"`);
  }

  if (
    activeFilters.minPrice !== undefined ||
    activeFilters.maxPrice !== undefined
  ) {
    const priceText = getCurrentPriceRangeLabel();
    parts.push(`цена "${priceText}"`);
  }

  if (activeFilters.authorType) {
    const authorTypeText =
      activeFilters.authorType === "russian"
        ? "русские авторы"
        : "зарубежные авторы";
    parts.push(authorTypeText);
  }

  return parts.join(", ");
}
```

---

## ⚡ Производительность

### Оптимизация запросов

```javascript
/**
 * Cache for filter-related data
 */
const filterCache = {
  categories: null,
  categoriesFetchTime: null,

  /**
   * Get categories with caching
   */
  async getCategories() {
    const now = Date.now();
    const cacheTimeout = 5 * 60 * 1000; // 5 минут

    if (
      this.categories &&
      this.categoriesFetchTime &&
      now - this.categoriesFetchTime < cacheTimeout
    ) {
      return this.categories;
    }

    try {
      this.categories = await fetchCategories();
      this.categoriesFetchTime = now;
      return this.categories;
    } catch (error) {
      // Возвращаем закешированные данные если есть
      if (this.categories) {
        console.warn("Using cached categories due to fetch error");
        return this.categories;
      }
      throw error;
    }
  },

  /**
   * Clear cache
   */
  clear() {
    this.categories = null;
    this.categoriesFetchTime = null;
  },
};
```

### Предзагрузка данных

```javascript
/**
 * Preload filter data
 */
async function preloadFilterData() {
  try {
    console.log("Preloading filter data...");

    // Предзагружаем категории
    await filterCache.getCategories();

    console.log("Filter data preloaded successfully");
  } catch (error) {
    console.warn("Failed to preload filter data:", error);
  }
}

/**
 * Initialize filters with preloaded data
 */
async function initFiltersWithPreload() {
  // Запускаем предзагрузку
  const preloadPromise = preloadFilterData();

  // Инициализируем базовую структуру
  setupBasicFilterStructure();

  // Ждем завершения предзагрузки
  await preloadPromise;

  // Завершаем инициализацию
  finishFilterInitialization();
}
```

### Мемоизация

```javascript
/**
 * Memoized filter functions
 */
const memoizedFilters = {
  cache: new Map(),

  /**
   * Memoized filter application
   */
  applyFilters: (() => {
    const cache = new Map();

    return (filters) => {
      const key = JSON.stringify(filters);

      if (cache.has(key)) {
        console.log("Using memoized filter result");
        return cache.get(key);
      }

      const result = this.actualApplyFilters(filters);
      cache.set(key, result);

      // Ограничиваем размер кеша
      if (cache.size > 10) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }

      return result;
    };
  })(),

  /**
   * Clear memoization cache
   */
  clearCache() {
    this.cache.clear();
  },
};
```

---

_[← Назад к Infinite Scroll](11_CATALOG_INFINITE_SCROLL.md) | [Далее: Пагинация →](13_CATALOG_PAGINATION.md)_
