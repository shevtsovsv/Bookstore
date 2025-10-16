// Скрипт для страницы деталей книги

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

let currentBookId = null;

// Инициализация при загрузке страницы
document.addEventListener("DOMContentLoaded", async function () {
  console.log("Инициализация страницы деталей книги...");

  // Получаем ID книги из URL
  const urlParams = new URLSearchParams(window.location.search);
  currentBookId = urlParams.get("id");

  if (!currentBookId) {
    showError("ID книги не найден в URL");
    return;
  }

  // Проверяем авторизацию
  updateAuthStatus();

  // Настроим делегированные обработчики событий
  setupEventListeners();

  // Загружаем детали книги
  await loadBookDetails();

  // Загружаем рекомендации
  await loadRecommendations();
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

// Загрузка деталей книги
async function loadBookDetails() {
  try {
    const response = await window.bookstoreAPI.books.getBookById(currentBookId);

    if (response.success && response.data) {
      renderBookDetails(response.data);
    } else {
      throw new Error(response.message || "Книга не найдена");
    }
  } catch (error) {
    console.error("Ошибка загрузки деталей книги:", error);
    showError("Ошибка загрузки информации о книге: " + error.message);
  }
}

// Отображение деталей книги
function renderBookDetails(book) {
  const container = document.getElementById("book-details-container");
  const breadcrumbTitle = document.getElementById("current-book-title");

  // Обновляем заголовок страницы и хлебные крошки
  document.title = `${book.title} - Книжный магазин`;
  if (breadcrumbTitle) {
    breadcrumbTitle.textContent = book.title;
  }

  // Создаем детальную информацию
  if (container) {
    container.innerHTML = `
      <div class="book-detail-card">
        <div class="book-detail-image">
          <img src="../img/book-placeholder.png" alt="${book.title}">
          ${
            book.stock <= 0
              ? '<div class="stock-status out-of-stock">Нет в наличии</div>'
              : `<div class="stock-status in-stock">В наличии: ${book.stock} шт.</div>`
          }
        </div>
        
        <div class="book-detail-info">
          <h1 class="book-detail-title">${escapeHtml(book.title)}</h1>
          <p class="book-detail-author">Автор: <strong>${escapeHtml(
            book.author
          )}</strong></p>
          <p class="book-detail-genre">Жанр: <span class="genre-tag">${escapeHtml(
            book.genre
          )}</span></p>
          
          <div class="book-detail-price">
            <span class="price-current">${book.price}₽</span>
          </div>
          
          <div class="book-detail-stats">
            <div class="stat-item">
              <span class="stat-number">${book.stock}</span>
              <span class="stat-label">В наличии</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${book.sold || 0}</span>
              <span class="stat-label">Продано</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">${book.rating || "N/A"}</span>
              <span class="stat-label">Рейтинг</span>
            </div>
          </div>

          ${
            book.description
              ? `
            <div class="book-description">
              <h3>Описание</h3>
              <p>${escapeHtml(book.description)}</p>
            </div>
          `
              : ""
          }

          <div class="book-detail-actions">
            ${
              window.bookstoreAPI.isAuthenticated() && book.stock > 0
                ? `<button data-book-id="${book.id}" class="btn btn-primary btn-large purchase-btn">
                 Купить за ${book.price}₽
               </button>`
                : window.bookstoreAPI.isAuthenticated()
                ? '<button class="btn btn-disabled btn-large">Нет в наличии</button>'
                : '<a href="login.html" class="btn btn-primary btn-large">Войти для покупки</a>'
            }
            <button class="btn btn-secondary go-back-btn">← Вернуться к каталогу</button>
          </div>

          <div class="book-metadata">
            <p><strong>Дата добавления:</strong> ${formatDate(
              book.created_at
            )}</p>
            <p><strong>Последнее обновление:</strong> ${formatDate(
              book.updated_at
            )}</p>
          </div>
        </div>
      </div>
    `;

    // Установим обработчики для изображений и кнопок, чтобы избежать inline handlers
    // Установим fallback для картинок
    container.querySelectorAll("img").forEach((img) => {
      img.onerror = function () {
        this.src = "../img/book-placeholder.png";
      };
    });

    // Кнопка покупки (внутри деталей)
    const purchaseBtn = container.querySelector(".purchase-btn");
    if (purchaseBtn) {
      purchaseBtn.addEventListener("click", async (e) => {
        const id = purchaseBtn.getAttribute("data-book-id");
        if (id) await purchaseBook(parseInt(id));
      });
    }

    // Кнопка "вернуться"
    const goBackBtn = container.querySelector(".go-back-btn");
    if (goBackBtn) {
      goBackBtn.addEventListener("click", (e) => {
        goBack();
      });
    }
  }
}

// Загрузка рекомендаций
async function loadRecommendations() {
  try {
    const response = await window.bookstoreAPI.books.getBooks({
      limit: 4,
      exclude: currentBookId,
    });

    if (response.success && response.data && response.data.books.length > 0) {
      renderRecommendations(response.data.books);
    }
  } catch (error) {
    console.error("Ошибка загрузки рекомендаций:", error);
    // Не показываем ошибку рекомендаций пользователю
  }
}

// Отображение рекомендаций
function renderRecommendations(books) {
  const section = document.getElementById("recommendations-section");
  const container = document.getElementById("recommendations-container");

  if (container) {
    container.innerHTML = "";

    books.forEach((book) => {
      const bookCard = createRecommendationCard(book);
      container.appendChild(bookCard);
    });
    // Установим обработчики картинок для рекомендаций
    container.querySelectorAll("img").forEach((img) => {
      img.onerror = function () {
        this.src = "../img/book-placeholder.png";
      };
    });

    if (section) {
      section.style.display = "block";
    }
  }
}

// Создание карточки рекомендации
function createRecommendationCard(book) {
  const card = document.createElement("div");
  card.className = "book-card recommendation-card";
  card.innerHTML = `
    <div class="book-image">
      <img src="../img/book-placeholder.png" alt="${book.title}">
      ${
        book.stock <= 0 ? '<span class="out-of-stock">Нет в наличии</span>' : ""
      }
    </div>
    <div class="book-info">
      <h4 class="book-title">${escapeHtml(book.title)}</h4>
      <p class="book-author">${escapeHtml(book.author)}</p>
      <p class="book-price">${book.price}₽</p>
      <div class="book-actions">
        <button data-book-id="${
          book.id
        }" class="btn btn-info btn-small view-details-btn">Подробнее</button>
        ${
          window.bookstoreAPI.isAuthenticated() && book.stock > 0
            ? `<button data-book-id="${book.id}" class="btn btn-primary btn-small purchase-btn">Купить</button>`
            : ""
        }
      </div>
    </div>
  `;
  return card;
}

// Устанавливаем делегированные обработчики для рекомендаций и общие действия
function setupEventListeners() {
  const recommendationsContainer = document.getElementById(
    "recommendations-container"
  );
  if (recommendationsContainer) {
    recommendationsContainer.addEventListener("click", (e) => {
      const target = e.target;
      if (target.classList.contains("view-details-btn")) {
        const id = target.getAttribute("data-book-id");
        if (id) viewBookDetails(parseInt(id));
      }

      if (target.classList.contains("purchase-btn")) {
        const id = target.getAttribute("data-book-id");
        if (id) purchaseBook(parseInt(id));
      }
    });
  }

  // Обработчик для кнопки "вернуться" в случае, если она присутствует вне деталей (например, сообщение об ошибке)
  document.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList && target.classList.contains("go-back-btn")) {
      goBack();
    }
    if (target.classList && target.classList.contains("error-back-btn")) {
      goBack();
    }
  });
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

      // Обновляем информацию о текущей книге если это она
      if (parseInt(bookId) === parseInt(currentBookId)) {
        await loadBookDetails();
      }

      // Обновляем рекомендации
      await loadRecommendations();
    } else {
      showNotification(response.message || "Ошибка покупки", "error");
    }
  } catch (error) {
    console.error("Ошибка покупки:", error);
    showNotification("Произошла ошибка при покупке", "error");
  }
}

// Просмотр деталей другой книги
function viewBookDetails(bookId) {
  window.location.href = `book-detail.html?id=${bookId}`;
}

// Вернуться к каталогу
function goBack() {
  // Если есть история, возвращаемся назад, иначе идем в каталог
  if (window.history.length > 1) {
    window.history.back();
  } else {
    window.location.href = "book.html";
  }
}

// Форматирование даты
function formatDate(dateString) {
  if (!dateString) return "Не указано";

  const date = new Date(dateString);
  return date.toLocaleDateString("ru-RU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// Показать ошибку
function showError(message) {
  const container = document.getElementById("book-details-container");
  if (container) {
    container.innerHTML = `<div class="error-message">
         <h2>Ошибка</h2>
         <p>${message}</p>
         <button class="btn btn-primary error-back-btn">Вернуться к каталогу</button>
       </div>`;
    const backBtn = container.querySelector(".error-back-btn");
    if (backBtn) backBtn.addEventListener("click", goBack);
  }
}
