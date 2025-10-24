// book-catalog.js - Скрипт для генерации каталога книг из JSON
(function () {
  let booksData = [];

  // Статические данные как fallback
  const fallbackBooks = [
    {
      id: "book1",
      title: "Унесённые ветром",
      author: "Маргарет Митчелл",
      genre: "Романтика",
      price: 900,
      priceCategory: "low",
      authorType: "foreign",
      image: "book1.jpg",
      shortDescription: "«Унесённые ветром» — масштабная история...",
      fullDescription:
        "«Унесённые ветром» — роман американской писательницы Маргарет Митчелл, опубликованный в 1936 году.",
      classes: ["romance", "foreign", "price-low"],
    },
    {
      id: "book2",
      title: "Гроза",
      author: "Александр Островский",
      genre: "Драма",
      price: 550,
      priceCategory: "low",
      authorType: "russian",
      image: "book2.jpg",
      shortDescription: "«Гроза» — драма о столкновении...",
      fullDescription:
        "«Гроза» — пьеса А. Н. Островского в пяти действиях, написанная в 1859 году.",
      classes: ["drama", "russian", "price-low"],
    },
    {
      id: "book3",
      title: "Море и звезды",
      author: "Алексей Бирюлин",
      genre: "Биография",
      price: 1670,
      priceCategory: "high",
      authorType: "russian",
      image: "book3.jpg",
      shortDescription: "«Море и звезды» — исторический роман-биография...",
      fullDescription:
        "«Море и звезды» — художественно-документальное произведение о великих мореплавателях.",
      classes: ["bio", "russian", "price-high"],
    },
    {
      id: "book4",
      title: "Человек-амфибия",
      author: "Александр Беляев",
      genre: "Фантастика",
      price: 1750,
      priceCategory: "high",
      authorType: "russian",
      image: "book4.jpg",
      shortDescription: "«Человек-амфибия» — научно-фантастическая драма...",
      fullDescription:
        "«Человек-амфибия» — научно-фантастический роман Александра Беляева, опубликованный в 1928 году.",
      classes: ["fantasy", "russian", "price-high"],
    },
    {
      id: "book5",
      title: "Маленький принц",
      author: "Антуан де Сент-Экзюпери",
      genre: "Фантастика",
      price: 890,
      priceCategory: "low",
      authorType: "foreign",
      image: "book5.jpg",
      shortDescription: "«Маленький принц» — философская сказка-притча...",
      fullDescription:
        "«Маленький принц» — наиболее известное произведение Антуана де Сент-Экзюпери.",
      classes: ["fantasy", "foreign", "price-low"],
    },
    {
      id: "book6",
      title: "Великий Гэтсби",
      author: "Фрэнсис Скотт Фицджеральд",
      genre: "Драма",
      price: 1200,
      priceCategory: "high",
      authorType: "foreign",
      image: "book6.jpg",
      shortDescription: "«Великий Гэтсби» — трагическая история...",
      fullDescription:
        "«Великий Гэтсби» — роман американского писателя Фрэнсиса Скотта Фицджеральда.",
      classes: ["drama", "foreign", "price-high"],
    },
  ];

  // Загружаем данные о книгах из JSON
  async function loadBooksData() {
    try {
      console.log("Начинаем загрузку данных из JSON...");
      const response = await fetch("../data/books.json");
      console.log("Response status:", response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Данные успешно загружены из JSON файла:", data);
      return data.books;
    } catch (error) {
      console.error("Ошибка загрузки данных из JSON:", error);
      
      // Проверяем, является ли ошибка CORS
      if (error.message.includes('Failed to fetch') || error.message.includes('TypeError')) {
        console.warn("⚠️ CORS блокировка: Браузер блокирует загрузку локальных файлов.");
        console.info("💡 Для полной функциональности используйте HTTP сервер (например, Live Server в VS Code)");
        console.info("📁 Пока используем встроенные данные...");
      }
      
      // Проверяем, есть ли глобальные данные из book-data.js
      if (window.BOOKS_DATA && window.BOOKS_DATA.books) {
        console.log("✅ Используем данные из book-data.js");
        return window.BOOKS_DATA.books;
      }
      
      console.log("📋 Используем статические fallback данные");
      return fallbackBooks;
    }
  }

  // Функция для заказа книги (заглушка)
  function orderBook(bookId) {
    const book = booksData.find((b) => b.id === bookId);
    const bookTitle = book ? book.title : "книга";
    alert(`"${bookTitle}" добавлена в корзину! (Это демо-функция)`);
  }

  // Делаем функцию глобальной
  window.orderBook = orderBook;

  // Генерируем навигацию по книгам
  function generateNavigation(books) {
    const navigation = document.getElementById("book-navigation");
    const links = books
      .map((book, index) => `<a href="#${book.id}">${book.title}</a>`)
      .join(" | ");
    navigation.innerHTML = links;
  }

  // Генерируем карточку книги
  function generateBookCard(book) {
    const classNames = book.classes.join(" ");

    return `
      <div id="${book.id}" class="book-card ${classNames}">
        <img
          src="../img/${book.image}"
          alt="${book.title} — обложка"
          class="book-cover"
          loading="lazy"
          width="250"
          height="350"
        />
        <div class="book-info">
          <p><strong>Автор:</strong> ${book.author}</p>
          <p><strong>Жанр:</strong> ${book.genre}</p>
          <p><strong>Описание:</strong> ${book.shortDescription}</p>
          <p><strong>Цена:</strong> ${book.price} руб.</p>
          <div>
            <a
              href="book-detail.html?id=${book.id}"
              class="buy-btn"
              aria-label="Подробнее о книге ${book.title}"
            >Подробнее</a>
            <button 
              class="buy-btn" 
              onclick="orderBook('${book.id}')"
              aria-label="Заказать ${book.title}"
            >Заказать</button>
          </div>
        </div>
      </div>
    `;
  }

  // Рендерим каталог книг
  function renderBooksCatalog(books) {
    console.log("🎨 Начинаем рендеринг каталога...");
    const container = document.getElementById("books-container");
    console.log("📦 Контейнер найден:", !!container);

    if (!books || books.length === 0) {
      console.error("❌ Нет книг для рендеринга");
      container.innerHTML = `
        <div class="error">
          <p>Не удалось загрузить каталог книг. Попробуйте перезагрузить страницу.</p>
        </div>
      `;
      return;
    }

    console.log("📚 Рендерим", books.length, "книг");
    const cardsHTML = books.map(generateBookCard).join("");
    console.log("🏗️ HTML сгенерирован, длина:", cardsHTML.length);
    console.log("📝 Первые 200 символов HTML:", cardsHTML.substring(0, 200));
    
    container.innerHTML = cardsHTML;
    console.log("✅ HTML вставлен в контейнер");
    
    // Проверяем, что карточки действительно появились
    const addedCards = container.querySelectorAll('.book-card');
    console.log("🎯 Найдено карточек в DOM:", addedCards.length);
    
    // Принудительно устанавливаем display: flex для всех карточек
    addedCards.forEach(function(card) {
      card.style.setProperty('display', 'flex', 'important');
    });
    console.log("🎨 Стили применены принудительно");
  }

  // Показываем ошибку загрузки
  function showError(message) {
    const container = document.getElementById("books-container");
    if (container) {
      container.innerHTML = `
        <div class="error">
          <h2>Ошибка загрузки</h2>
          <p>${message}</p>
          <button onclick="location.reload()" class="buy-btn">Перезагрузить страницу</button>
        </div>
      `;
    }
  }

  // Основная функция инициализации
  async function init() {
    console.log("🚀 Инициализация каталога книг...");
    console.log("📍 Контейнер:", document.getElementById("books-container"));

    try {
      booksData = await loadBooksData();
      console.log("📚 Загружено книг:", booksData ? booksData.length : 0);
      console.log("📋 Данные книг:", booksData);

      if (booksData && booksData.length > 0) {
        console.log(`✅ Загружено ${booksData.length} книг`);
        generateNavigation(booksData);
        renderBooksCatalog(booksData);
        console.log("🎨 Каталог отрендерен");
      } else {
        console.error("❌ Данные о книгах не загружены или пусты");
        const container = document.getElementById("books-container");
        if (container) {
          container.innerHTML = `
            <div class="error">
              <h2>Ошибка</h2>
              <p>Каталог книг пуст или не удалось загрузить данные</p>
              <button onclick="location.reload()" class="buy-btn">Перезагрузить страницу</button>
            </div>
          `;
        }
      }
    } catch (error) {
      console.error("💥 Ошибка инициализации:", error);
      const container = document.getElementById("books-container");
      if (container) {
        container.innerHTML = `
          <div class="error">
            <h2>Ошибка инициализации</h2>
            <p>${error.message}</p>
            <button onclick="location.reload()" class="buy-btn">Перезагрузить страницу</button>
          </div>
        `;
      }
    }
  }

  // Запускаем инициализацию когда DOM готов
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
