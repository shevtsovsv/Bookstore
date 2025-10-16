// Скрипт для каталога книг

// Локальная функция для экранирования HTML
function escapeHtml(text) {
  if (!text) return "";
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Локальная функция для показа уведомлений
function showNotification(message, type = "info") {
  // Попробуем использовать UIUtils если доступен, иначе alert
  if (window.UIUtils && window.UIUtils.showNotification) {
    window.UIUtils.showNotification(message, type);
  } else {
    alert(message);
  }
}

// Глобальные переменные для каталога
let currentPage = 1;
let totalPages = 1;
let currentFilters = {
  search: "",
  genre: "",
  maxPrice: 3000,
  inStock: true,
  sortBy: "created_at",
  sortOrder: "desc",
};
let allBooks = [];
let isLoading = false;

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Инициализация каталога книг...");

  // Проверяем доступность API
  if (!window.bookstoreAPI) {
    console.error("API модуль не загружен");
    return;
  }

  // Обновляем статус авторизации и приветствие
  updateAuthStatus();
  updateUserGreeting();

  // Настраиваем обработчики событий
  setupEventListeners();

  // Загружаем жанры и книги
  await loadGenres();
  await loadBooks();
});

// Обновление статуса авторизации
function updateAuthStatus() {
  const authLink = document.getElementById("auth-link");

  if (window.bookstoreAPI.isAuthenticated()) {
    const user = window.bookstoreAPI.getCurrentUser();
    authLink.textContent = "Выйти";
    authLink.href = "#";
    authLink.onclick = function (e) {
      e.preventDefault();
      window.bookstoreAPI.auth.logout();
      location.reload();
    };
  } else {
    authLink.textContent = "Вход";
    authLink.href = "login.html";
    authLink.onclick = null;
  }
}

// Обновление приветствия пользователя
function updateUserGreeting() {
  const greeting = document.getElementById("user-greeting");
  const userName = document.getElementById("user-name");

  if (window.bookstoreAPI.isAuthenticated()) {
    const user = window.bookstoreAPI.getCurrentUser();
    if (userName && user) {
      userName.textContent = user.first_name || user.email;
      if (greeting) greeting.style.display = "block";
    }
  } else {
    if (greeting) greeting.style.display = "none";
  }
}

// Настройка обработчиков событий
function setupEventListeners() {
  // Поиск по Enter
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        performSearch();
      }
    });
  }

  // Кнопка поиска
  const searchBtn = document.getElementById("search-btn");
  if (searchBtn) {
    searchBtn.onclick = performSearch;
  }

  // Кнопка очистки поиска
  const clearSearchBtn = document.getElementById("clear-search");
  if (clearSearchBtn) {
    clearSearchBtn.onclick = clearSearch;
  }

  // Сортировка
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", applySorting);
  }

  // Фильтр по жанру
  const genreFilter = document.getElementById("genre-filter");
  if (genreFilter) {
    genreFilter.addEventListener("change", applyFilters);
  }

  // Фильтр по цене
  const priceRange = document.getElementById("price-range");
  if (priceRange) {
    priceRange.addEventListener("input", (e) => {
      const value = e.target.value;
      currentFilters.maxPrice = parseInt(value);
      const priceDisplay = document.getElementById("price-display");
      if (priceDisplay) {
        priceDisplay.textContent = `до ${value}₽`;
      }
    });
  }

  // Фильтр "в наличии"
  const inStockFilter = document.getElementById("in-stock-filter");
  if (inStockFilter) {
    inStockFilter.addEventListener("change", (e) => {
      currentFilters.inStock = e.target.checked;
    });
  }

  // Кнопки применения и сброса фильтров
  const applyBtn = document.getElementById("apply-filters");
  if (applyBtn) {
    applyBtn.onclick = applyFilters;
  }

  const resetBtn = document.getElementById("reset-filters");
  if (resetBtn) {
    resetBtn.onclick = resetFilters;
  }

  // Кнопка "Показать все книги"
  const showAllBtn = document.getElementById("show-all-books-btn");
  if (showAllBtn) {
    showAllBtn.onclick = resetFilters;
  }

  // Обработчики событий для кнопок в карточках книг (делегирование событий)
  const booksContainer = document.getElementById("books-container");
  if (booksContainer) {
    booksContainer.addEventListener("click", (e) => {
      // Кнопка "Подробнее"
      if (e.target.classList.contains("view-details-btn")) {
        const bookId = e.target.getAttribute("data-book-id");
        if (bookId) {
          viewBookDetails(parseInt(bookId));
        }
      }

      // Кнопка "Купить"
      if (e.target.classList.contains("purchase-btn")) {
        const bookId = e.target.getAttribute("data-book-id");
        if (bookId) {
          purchaseBook(parseInt(bookId));
        }
      }
    });
  }
}

// Загрузка жанров для фильтра
async function loadGenres() {
  try {
    const response = await window.bookstoreAPI.books.getBooks({ limit: 100 });
    if (response.success && response.data && response.data.books) {
      const genres = [
        ...new Set(
          response.data.books.map((book) => book.genre).filter(Boolean)
        ),
      ];
      const genreSelect = document.getElementById("genre-filter");

      if (genreSelect) {
        genres.forEach((genre) => {
          const option = document.createElement("option");
          option.value = genre;
          option.textContent = genre;
          genreSelect.appendChild(option);
        });
      }
    }
  } catch (error) {
    console.error("Ошибка загрузки жанров:", error);
  }
}

// Основная функция загрузки книг
async function loadBooks(page = 1, append = false) {
  if (isLoading) return;

  currentPage = page;
  isLoading = true;

  try {
    if (!append) {
      showLoading(true);
    }

    const params = {
      page: currentPage,
      limit: 12,
      search: currentFilters.search || undefined,
      genre: currentFilters.genre || undefined,
      priceMax: currentFilters.maxPrice,
      onlyAvailable: currentFilters.inStock,
      sortBy: currentFilters.sortBy || "created_at",
      sortOrder: currentFilters.sortOrder || "desc",
    };

    // Убираем пустые параметры
    Object.keys(params).forEach((key) => {
      if (
        params[key] === "" ||
        params[key] === null ||
        params[key] === undefined
      ) {
        delete params[key];
      }
    });

    console.log("Загружаем книги с параметрами:", params);
    const response = await window.bookstoreAPI.books.getBooks(params);
    console.log("Ответ API книг:", response);

    if (response.success && response.data) {
      if (append) {
        allBooks = allBooks.concat(response.data.books);
      } else {
        allBooks = response.data.books;
      }

      totalPages = response.data.pagination?.totalPages || 1;

      renderBooks(allBooks, append);
      updateResultsInfo(response.data.pagination?.total || allBooks.length);
      updatePagination();

      const noResults = document.getElementById("no-results-message");
      if (noResults) {
        noResults.style.display = allBooks.length === 0 ? "block" : "none";
      }
    } else {
      throw new Error(response.message || "Ошибка загрузки книг");
    }
  } catch (error) {
    console.error("Ошибка загрузки книг:", error);
    showError("Ошибка загрузки каталога: " + error.message);
  } finally {
    isLoading = false;
    showLoading(false);
  }
}

// Отображение книг
function renderBooks(books, append = false) {
  const container = document.getElementById("books-container");
  if (!container) {
    console.error("Контейнер книг не найден");
    return;
  }

  if (books.length === 0 && !append) {
    container.innerHTML =
      '<div class="no-results"><p>Книги не найдены</p></div>';
    return;
  }

  const booksHTML = books.map((book) => createBookCard(book)).join("");

  if (append) {
    const existingGrid = container.querySelector(".books-grid");
    if (existingGrid) {
      existingGrid.insertAdjacentHTML("beforeend", booksHTML);
    } else {
      container.innerHTML = `<div class="books-grid">${booksHTML}</div>`;
    }
  } else {
    container.innerHTML = `<div class="books-grid">${booksHTML}</div>`;
  }

  // Установим обработчики onerror для изображений внутри контейнера
  container.querySelectorAll("img").forEach((img) => {
    img.onerror = function () {
      this.src = "../img/book-placeholder.png";
    };
  });
}

// Создание карточки книги
function createBookCard(book) {
  const isAuthenticated = window.bookstoreAPI.isAuthenticated();

  return `
    <div class="book-card" data-book-id="${book.id}">
      <div class="book-image">
  <img src="../img/book-placeholder.png" alt="${escapeHtml(book.title)}">
        ${
          book.stock <= 0
            ? '<span class="out-of-stock">Нет в наличии</span>'
            : ""
        }
      </div>
      
      <div class="book-info">
        <h3 class="book-title">${escapeHtml(book.title)}</h3>
        <p class="book-author">${escapeHtml(book.author)}</p>
        <p class="book-genre">${escapeHtml(book.genre)}</p>
        <p class="book-price">${book.price}₽</p>
        
        <div class="book-stats">
          <span>В наличии: ${book.stock}</span>
          <span>Продано: ${book.sold || 0}</span>
        </div>
        
        <div class="book-actions">
          <button data-book-id="${
            book.id
          }" class="btn btn-info view-details-btn">
            Подробнее
          </button>
          ${
            isAuthenticated && book.stock > 0
              ? `<button data-book-id="${book.id}" class="btn btn-primary purchase-btn">
               Купить
             </button>`
              : isAuthenticated
              ? '<button class="btn btn-disabled">Нет в наличии</button>'
              : '<a href="login.html" class="btn btn-primary">Войти</a>'
          }
        </div>
      </div>
    </div>
  `;
}

// Выполнить поиск
function performSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    currentFilters.search = searchInput.value.trim();
    currentPage = 1;
    loadBooks(1);

    const clearBtn = document.getElementById("clear-search");
    if (clearBtn) {
      clearBtn.style.display = currentFilters.search ? "inline-block" : "none";
    }
  }
}

// Очистить поиск
function clearSearch() {
  const searchInput = document.getElementById("search-input");
  if (searchInput) {
    searchInput.value = "";
  }

  const clearBtn = document.getElementById("clear-search");
  if (clearBtn) {
    clearBtn.style.display = "none";
  }

  currentFilters.search = "";
  currentPage = 1;
  loadBooks(1);
}

// Применить фильтры
function applyFilters() {
  const genreFilter = document.getElementById("genre-filter");
  const priceRange = document.getElementById("price-range");
  const inStockFilter = document.getElementById("in-stock-filter");

  if (genreFilter) currentFilters.genre = genreFilter.value;
  if (priceRange) currentFilters.maxPrice = parseInt(priceRange.value);
  if (inStockFilter) currentFilters.inStock = inStockFilter.checked;

  currentPage = 1;
  loadBooks(1);
}

// Применить сортировку
function applySorting() {
  const sortSelect = document.getElementById("sort-select");
  if (sortSelect) {
    currentFilters.sortBy = sortSelect.value;
    currentPage = 1;
    loadBooks(1);
  }
}

// Сбросить фильтры
function resetFilters() {
  // Сброс полей
  const searchInput = document.getElementById("search-input");
  const genreFilter = document.getElementById("genre-filter");
  const priceRange = document.getElementById("price-range");
  const priceDisplay = document.getElementById("price-display");
  const inStockFilter = document.getElementById("in-stock-filter");
  const sortSelect = document.getElementById("sort-select");
  const clearBtn = document.getElementById("clear-search");

  if (searchInput) searchInput.value = "";
  if (genreFilter) genreFilter.value = "";
  if (priceRange) priceRange.value = "3000";
  if (priceDisplay) priceDisplay.textContent = "до 3000₽";
  if (inStockFilter) inStockFilter.checked = true;
  if (sortSelect) sortSelect.value = "created_at_desc";
  if (clearBtn) clearBtn.style.display = "none";

  // Сброс фильтров
  currentFilters = {
    search: "",
    genre: "",
    maxPrice: 3000,
    inStock: true,
    sortBy: "created_at",
    sortOrder: "desc",
  };

  currentPage = 1;
  loadBooks(1);
}

// Обновление информации о результатах
function updateResultsInfo(total) {
  const resultsCount = document.getElementById("results-count");
  if (resultsCount) {
    resultsCount.textContent = `Найдено книг: ${total}`;
  }

  // Отображение активных фильтров
  const activeFilters = [];
  if (currentFilters.search)
    activeFilters.push(`поиск: "${currentFilters.search}"`);
  if (currentFilters.genre) activeFilters.push(`жанр: ${currentFilters.genre}`);
  if (currentFilters.maxPrice < 3000)
    activeFilters.push(`цена до ${currentFilters.maxPrice}₽`);
  if (!currentFilters.inStock) activeFilters.push("включая отсутствующие");

  const activeFiltersEl = document.getElementById("current-filters");
  if (activeFiltersEl) {
    activeFiltersEl.textContent =
      activeFilters.length > 0 ? `(${activeFilters.join(", ")})` : "";
  }
}

// Обновление пагинации
function updatePagination() {
  const paginationContainer = document.getElementById("pagination-container");
  const pageInfo = document.getElementById("page-info");
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");
  const loadMoreBtn = document.getElementById("load-more");

  if (totalPages > 1) {
    if (paginationContainer) paginationContainer.style.display = "flex";
    if (pageInfo)
      pageInfo.textContent = `Страница ${currentPage} из ${totalPages}`;

    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages;

    if (loadMoreBtn) {
      if (currentPage === totalPages) {
        loadMoreBtn.style.display = "none";
      } else {
        loadMoreBtn.style.display = "inline-block";
      }
    }
  } else {
    if (paginationContainer) paginationContainer.style.display = "none";
  }
}

// Показать загрузку
function showLoading(show) {
  const container = document.getElementById("books-container");
  if (container && show) {
    container.innerHTML =
      '<div class="loading-placeholder"><p>Загружаем книги...</p></div>';
  }
}

// Показать ошибку
function showError(message) {
  const container = document.getElementById("books-container");
  if (container) {
    container.innerHTML = `<div class="error-message"><p>${message}</p></div>`;
  }
}

// Просмотр деталей книги
function viewBookDetails(bookId) {
  window.location.href = `book-detail.html?id=${bookId}`;
}

// Покупка книги
async function purchaseBook(bookId) {
  if (!window.bookstoreAPI.isAuthenticated()) {
    showNotification("Необходимо войти в систему для покупки", "error");
    return;
  }

  try {
    const response = await window.bookstoreAPI.books.purchaseBook(bookId);
    if (response.success) {
      showNotification("Книга успешно куплена!", "success");
      // Обновляем каталог для отображения актуального количества
      loadBooks();
    } else {
      showNotification(response.message || "Ошибка покупки", "error");
    }
  } catch (error) {
    console.error("Ошибка покупки:", error);
    showNotification("Произошла ошибка при покупке", "error");
  }
}
