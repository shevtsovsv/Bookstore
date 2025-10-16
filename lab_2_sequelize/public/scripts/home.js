// Скрипт для главной страницы

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

document.addEventListener("DOMContentLoaded", async function () {
  console.log("Инициализация главной страницы...");

  // Проверяем доступность API
  if (!window.bookstoreAPI) {
    console.error("API модуль не загружен");
    return;
  }

  // Обновляем статус авторизации
  updateAuthStatus();
  // Настроим делегированные обработчики
  setupEventListeners();

  // Загружаем популярные книги
  await loadPopularBooks();

  // Загружаем статистику
  await loadStoreStats();
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
    authLink.href = "html/login.html";
    authLink.onclick = null;
  }
}

// Загрузка популярных книг
async function loadPopularBooks() {
  console.log("Загружаем популярные книги...");

  try {
    const response = await window.bookstoreAPI.books.getPopularBooks();
    console.log("Ответ популярных книг:", response);

    //     if (response.success && response.data && response.data.length > 0) {
    if (response.success && response.data) {
      // Проверяем, есть ли books в response.data или data уже является массивом
      const books = response.data.books || response.data;
      if (Array.isArray(books) && books.length > 0) {
        renderPopularBooks(books);
      } else {
        console.error("Популярные книги не найдены в ответе:", response);
        showPopularBooksError("Популярные книги не найдены");
      }
    } else {
      console.error("Не удалось загрузить популярные книги:", response);
      showPopularBooksError("Не удалось загрузить популярные книги");
    }
  } catch (error) {
    console.error("Ошибка загрузки популярных книг:", error);
    showPopularBooksError("Ошибка загрузки популярных книг: " + error.message);
  }
}

// Отображение популярных книг
function renderPopularBooks(books) {
  console.log("Отображаем популярные книги:", books);

  const container = document.getElementById("popular-books-container");
  if (!container) {
    console.error("Контейнер популярных книг не найден");
    return;
  }

  container.innerHTML = books
    .map((book) => createPopularBookCard(book))
    .join("");
}

// Создание карточки популярной книги
function createPopularBookCard(book) {
  const isAuthenticated = window.bookstoreAPI.isAuthenticated();

  return `
    <div class="book-card" data-book-id="${book.id}">
      <div class="book-image">
        <img src="img/book-placeholder.png" alt="${escapeHtml(book.title)}">
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
              : '<a href="html/login.html" class="btn btn-primary">Войти</a>'
          }
        </div>
      </div>
    </div>
  `;
}

// Загрузка статистики магазина
async function loadStoreStats() {
  console.log("Загружаем статистику магазина...");

  try {
    const response = await window.bookstoreAPI.books.getStats();
    console.log("Ответ статистики:", response);

    if (response.success && response.data) {
      renderStoreStats(response.data);
    } else {
      console.error("Не удалось загрузить статистику:", response);
      showStatsError("Не удалось загрузить статистику магазина");
    }
  } catch (error) {
    console.error("Ошибка загрузки статистики:", error);
    showStatsError("Ошибка загрузки статистики: " + error.message);
  }
}

// Отображение статистики магазина
function renderStoreStats(stats) {
  console.log("Отображаем статистику:", stats);

  const container = document.getElementById("store-stats");
  if (!container) {
    console.error("Контейнер статистики не найден");
    return;
  }

  // stats содержит: books (основная статистика), pricing, genres
  const booksStats = stats.books || {};
  const genres = stats.genres || [];

  container.innerHTML = `
    <div class="stat-item">
      <div class="stat-number">${booksStats.totalBooks || 0}</div>
      <div class="stat-label">Всего книг</div>
    </div>
    
    <div class="stat-item">
      <div class="stat-number">${booksStats.totalGenres || 0}</div>
      <div class="stat-label">Жанров</div>
    </div>
    
    <div class="stat-item">
      <div class="stat-number">${booksStats.totalSold || 0}</div>
      <div class="stat-label">Продано</div>
    </div>
    
    <div class="stat-item genres">
      <div class="stat-label">Популярные жанры</div>
      <div class="genres-list">
        ${genres
          .slice(0, 5)
          .map(
            (genre) =>
              `<span class="genre-tag">${escapeHtml(genre.name)} (${
                genre.count
              })</span>`
          )
          .join("")}
      </div>
    </div>
  `;
}

// Показать ошибку популярных книг
function showPopularBooksError(message) {
  const container = document.getElementById("popular-books-container");
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button data-action="retry-popular" class="btn btn-primary">Попробовать снова</button>
      </div>
    `;
  }
}

// Показать ошибку статистики
function showStatsError(message) {
  const container = document.getElementById("store-stats");
  if (container) {
    container.innerHTML = `
      <div class="error-message">
        <p>${message}</p>
        <button data-action="retry-stats" class="btn btn-primary">Попробовать снова</button>
      </div>
    `;
  }
}

// Просмотр деталей книги
function viewBookDetails(bookId) {
  window.location.href = `html/book-detail.html?id=${bookId}`;
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

      // Обновляем популярные книги и статистику
      await loadPopularBooks();
      await loadStoreStats();
    } else {
      showNotification(response.message || "Ошибка покупки", "error");
    }
  } catch (error) {
    console.error("Ошибка покупки:", error);
    showNotification("Произошла ошибка при покупке", "error");
  }
}

// Делегированные обработчики для кнопок на главной странице
function setupEventListeners() {
  // Клики в контейнере популярных книг
  const popularContainer = document.getElementById("popular-books-container");
  if (popularContainer) {
    popularContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("view-details-btn")) {
        const id = target.getAttribute("data-book-id");
        if (id) viewBookDetails(parseInt(id));
      }
      if (target.classList.contains("purchase-btn")) {
        const id = target.getAttribute("data-book-id");
        if (id) purchaseBook(parseInt(id));
      }
      // Retry button
      if (
        target.getAttribute &&
        target.getAttribute("data-action") === "retry-popular"
      ) {
        loadPopularBooks();
      }
    });
  }

  // Клик по retry для статистики
  const statsContainer = document.getElementById("store-stats");
  if (statsContainer) {
    statsContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (
        target.getAttribute &&
        target.getAttribute("data-action") === "retry-stats"
      ) {
        loadStoreStats();
      }
    });
  }
}
