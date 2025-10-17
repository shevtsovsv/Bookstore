// book-details.js - Скрипт для отображения детальной информации о книге
(function () {
  // Получаем ID книги из URL параметров
  function getBookIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get("id");
  }

  // Загружаем данные о книгах из JSON
  async function loadBooksData() {
    try {
      const response = await fetch("../data/books.json");
      if (!response.ok) {
        throw new Error("Не удалось загрузить данные о книгах");
      }
      const data = await response.json();
      console.log("Данные успешно загружены из JSON файла для детальной страницы");
      return data.books;
    } catch (error) {
      console.error("Ошибка загрузки данных:", error);
      
      // Проверяем, есть ли глобальные данные из book-data.js
      if (window.BOOKS_DATA && window.BOOKS_DATA.books) {
        console.log("Используем глобальные данные из BOOKS_DATA");
        return window.BOOKS_DATA.books;
      }
      
      console.warn("⚠️ Данные о книгах недоступны. Попробуйте использовать HTTP сервер.");
      return null;
    }
  }

  // Находим книгу по ID
  function findBookById(books, bookId) {
    return books.find((book) => book.id === bookId);
  }

  // Рендерим детали книги
  function renderBookDetails(book) {
    const container = document.getElementById("book-details");

    if (!book) {
      container.innerHTML = `
        <div class="error">
          <h1>Книга не найдена</h1>
          <p>К сожалению, запрашиваемая книга не найдена.</p>
          <a href="book.html" class="buy-btn">Вернуться к каталогу</a>
        </div>
      `;
      document.getElementById("page-title").textContent = "Книга не найдена";
      return;
    }

    // Обновляем заголовок страницы
    document.getElementById(
      "page-title"
    ).textContent = `${book.title} — подробности`;

    // Рендерим содержимое
    container.innerHTML = `
      <h1>${book.title}</h1>
      <img src="../img/${book.image}" alt="${book.title} — обложка" loading="lazy" width="400" height="560">
      <p><strong>Автор:</strong> ${book.author}</p>
      <p><strong>Жанр:</strong> ${book.genre}</p>
      <p><strong>Цена:</strong> ${book.price} руб.</p>
      <p><strong>Описание:</strong> ${book.fullDescription}</p>
      <div class="book-actions">
        <button class="buy-btn" onclick="orderBook('${book.id}')" aria-label="Заказать ${book.title}">Заказать</button>
        <a href="book.html" class="buy-btn" style="background: #34495e; text-decoration: none;">Вернуться к каталогу</a>
      </div>
    `;
  }

  // Функция для заказа книги (заглушка)
  window.orderBook = function (bookId) {
    alert(`Книга "${bookId}" добавлена в корзину! (Это демо-функция)`);
  };

  // Показываем ошибку, если что-то пошло не так
  function showError(message) {
    const container = document.getElementById("book-details");
    container.innerHTML = `
      <div class="error">
        <h1>Ошибка</h1>
        <p>${message}</p>
        <a href="book.html" class="buy-btn">Вернуться к каталогу</a>
      </div>
    `;
  }

  // Основная функция инициализации
  async function init() {
    const bookId = getBookIdFromURL();

    if (!bookId) {
      showError("Не указан ID книги в URL");
      return;
    }

    const books = await loadBooksData();

    if (!books) {
      showError("Не удалось загрузить данные о книгах");
      return;
    }

    const book = findBookById(books, bookId);
    renderBookDetails(book);
  }

  // Запускаем инициализацию когда DOM готов
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
