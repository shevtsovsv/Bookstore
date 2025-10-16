/**
 * API модуль для взаимодействия с бэкендом
 * Содержит все функции для работы с API endpoints
 */

class BookstoreAPI {
  constructor() {
    this.baseURL = "/api";
    this.token = localStorage.getItem("bookstore_token");
  }

  /**
   * Универсальный метод для HTTP запросов
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    // Добавляем токен авторизации если есть
    if (this.token) {
      config.headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`
        );
      }

      return data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  }

  /**
   * Методы для аутентификации
   */
  auth = {
    // Регистрация пользователя
    register: async (userData) => {
      const response = await this.request("/auth/register", {
        method: "POST",
        body: JSON.stringify(userData),
      });

      if (response.success && response.data.token) {
        this.setToken(response.data.token);
      }

      return response;
    },

    // Вход в систему
    login: async (email, password) => {
      const response = await this.request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      if (response.success && response.data.token) {
        this.setToken(response.data.token);
      }

      return response;
    },

    // Получение профиля пользователя
    getProfile: async () => {
      return await this.request("/auth/me");
    },

    // Обновление профиля
    updateProfile: async (profileData) => {
      return await this.request("/auth/profile", {
        method: "PUT",
        body: JSON.stringify(profileData),
      });
    },

    // История заказов
    getOrderHistory: async (page = 1, limit = 20) => {
      return await this.request(`/auth/orders?page=${page}&limit=${limit}`);
    },

    // Выход из системы
    logout: () => {
      this.removeToken();
      window.location.href = "/";
    },
  };

  /**
   * Методы для работы с книгами
   */
  books = {
    // Получение списка книг с фильтрацией
    getBooks: async (params = {}) => {
      const queryParams = new URLSearchParams();

      Object.keys(params).forEach((key) => {
        if (
          params[key] !== undefined &&
          params[key] !== null &&
          params[key] !== ""
        ) {
          if (Array.isArray(params[key])) {
            params[key].forEach((item) => queryParams.append(key, item));
          } else {
            queryParams.append(key, params[key]);
          }
        }
      });

      const queryString = queryParams.toString();
      const endpoint = queryString ? `/books?${queryString}` : "/books";

      return await this.request(endpoint);
    },

    // Получение конкретной книги
    getBook: async (bookId) => {
      return await this.request(`/books/${bookId}`);
    },

    // Популярные книги
    getPopularBooks: async (limit = 10) => {
      return await this.request(`/books/popular?limit=${limit}`);
    },

    // Статистика книг
    getStats: async () => {
      return await this.request("/books/stats");
    },

    // Покупка книги
    purchaseBook: async (bookId, quantity = 1) => {
      return await this.request(`/books/${bookId}/purchase`, {
        method: "POST",
        body: JSON.stringify({ quantity }),
      });
    },
  };

  /**
   * Утилиты API
   */
  utils = {
    // Проверка здоровья API
    checkHealth: async () => {
      return await this.request("/health");
    },

    // Информация об API
    getInfo: async () => {
      return await this.request("/info");
    },
  };

  /**
   * Методы управления токеном
   */
  setToken(token) {
    this.token = token;
    localStorage.setItem("bookstore_token", token);
  }

  removeToken() {
    this.token = null;
    localStorage.removeItem("bookstore_token");
  }

  isAuthenticated() {
    return !!this.token;
  }

  /**
   * Получение информации о пользователе из токена (без запроса к серверу)
   */
  getUserFromToken() {
    if (!this.token) return null;

    try {
      // JWT токен состоит из 3 частей разделенных точкой
      const payload = JSON.parse(atob(this.token.split(".")[1]));
      return payload;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  }
}

// Создаем глобальный экземпляр API
window.bookstoreAPI = new BookstoreAPI();

/**
 * Утилиты для работы с DOM и UI
 */
class UIUtils {
  /**
   * Показать уведомление пользователю
   */
  static showNotification(message, type = "info") {
    // Создаем элемент уведомления
    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.innerHTML = `
      <div class="notification__content">
        <span class="notification__message">${message}</span>
        <button class="notification__close" aria-label="Закрыть">×</button>
      </div>
    `;

    // Добавляем стили если их нет
    if (!document.querySelector("#notification-styles")) {
      const styles = document.createElement("style");
      styles.id = "notification-styles";
      styles.textContent = `
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 20px;
          border-radius: 5px;
          color: white;
          z-index: 10000;
          max-width: 400px;
          animation: slideIn 0.3s ease-out;
        }
        .notification--info { background-color: #2196F3; }
        .notification--success { background-color: #4CAF50; }
        .notification--warning { background-color: #FF9800; }
        .notification--error { background-color: #F44336; }
        .notification__content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .notification__close {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
          margin-left: 10px;
        }
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `;
      document.head.appendChild(styles);
    }

    // Добавляем в DOM
    document.body.appendChild(notification);

    // Закрытие кнопкой (программно)
    const closeBtn = notification.querySelector(".notification__close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => notification.remove());
    }

    // Убираем через 5 секунд
    setTimeout(() => {
      if (notification.parentElement) notification.remove();
    }, 5000);
  }

  /**
   * Показать индикатор загрузки
   */
  static showLoading(container = document.body) {
    const loader = document.createElement("div");
    loader.className = "loading-overlay";
    loader.innerHTML = `
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Загрузка...</p>
      </div>
    `;

    // Добавляем стили загрузчика если их нет
    if (!document.querySelector("#loading-styles")) {
      const styles = document.createElement("style");
      styles.id = "loading-styles";
      styles.textContent = `
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
        }
        .loading-spinner {
          background: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3498db;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 10px;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(styles);
    }

    container.appendChild(loader);
    return loader;
  }

  /**
   * Скрыть индикатор загрузки
   */
  static hideLoading() {
    const loader = document.querySelector(".loading-overlay");
    if (loader) {
      loader.remove();
    }
  }

  /**
   * Форматирование цены
   */
  static formatPrice(price) {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: "RUB",
    }).format(price);
  }

  /**
   * Форматирование даты
   */
  static formatDate(dateString) {
    return new Date(dateString).toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  /**
   * Обновление навигации в зависимости от статуса авторизации
   */
  static updateNavigation() {
    const isAuthenticated = window.bookstoreAPI.isAuthenticated();
    const userInfo = window.bookstoreAPI.getUserFromToken();

    const nav = document.querySelector("nav ul.menu");
    if (!nav) return;

    // Находим элементы регистрации и входа
    const registerLink = nav.querySelector('a[href*="register"]');
    const loginLink = nav.querySelector('a[href*="login"]');

    if (isAuthenticated && userInfo) {
      // Пользователь авторизован - показываем профиль и выход
      if (registerLink) registerLink.parentElement.style.display = "none";
      if (loginLink) {
        loginLink.textContent = userInfo.email || "Профиль";
        loginLink.href = "html/profile.html";
      }

      // Добавляем кнопку выхода если её нет
      if (!nav.querySelector(".logout-link")) {
        const logoutItem = document.createElement("li");
        logoutItem.innerHTML = '<a href="#" class="logout-link">Выход</a>';
        logoutItem.querySelector("a").addEventListener("click", (e) => {
          e.preventDefault();
          window.bookstoreAPI.auth.logout();
        });
        nav.appendChild(logoutItem);
      }
    } else {
      // Пользователь не авторизован - показываем регистрацию и вход
      if (registerLink) registerLink.parentElement.style.display = "";
      if (loginLink) {
        loginLink.textContent = "Вход";
        loginLink.href = "html/login.html";
      }

      // Убираем кнопку выхода
      const logoutLink = nav.querySelector(".logout-link");
      if (logoutLink) logoutLink.parentElement.remove();
    }
  }

  /**
   * Создание карточки книги для каталога
   */
  static createBookCard(book) {
    return `
      <div class="book-card" data-book-id="${book.id}">
        <div class="book-image">
          <img src="img/${book.image || "default-book.jpg"}" alt="${
      book.title
    }" loading="lazy">
          ${
            !book.available
              ? '<div class="out-of-stock">Нет в наличии</div>'
              : ""
          }
        </div>
        <div class="book-info">
          <h3 class="book-title">${book.title}</h3>
          <p class="book-author">${book.author}</p>
          <p class="book-genre">${book.genre}</p>
          <p class="book-price">${this.formatPrice(book.price)}</p>
          <div class="book-stats">
            <span class="popularity">👥 ${book.popularity}</span>
            <span class="stock">📦 ${book.stock}</span>
          </div>
          <div class="book-actions">
            <button data-book-id="${
              book.id
            }" class="btn btn-info view-details-btn">Подробнее</button>
            ${
              book.available && window.bookstoreAPI.isAuthenticated()
                ? `<button data-book-id="${book.id}" class="btn btn-primary purchase-btn">Купить</button>`
                : book.available
                ? '<button class="btn btn-secondary redirect-login-btn">Войти для покупки</button>'
                : '<button class="btn btn-disabled" disabled>Нет в наличии</button>'
            }
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Показать детали книги
   */
  static async showBookDetails(bookId) {
    try {
      const response = await window.bookstoreAPI.books.getBook(bookId);
      if (response.success) {
        // Здесь можно открыть модальное окно или перейти на страницу книги
        console.log("Book details:", response.data.book);
        // TODO: Реализовать отображение деталей
      }
    } catch (error) {
      this.showNotification(`Ошибка загрузки книги: ${error.message}`, "error");
    }
  }

  /**
   * Купить книгу
   */
  static async purchaseBook(bookId, quantity = 1) {
    try {
      const response = await window.bookstoreAPI.books.purchaseBook(
        bookId,
        quantity
      );
      if (response.success) {
        this.showNotification(
          `Книга "${response.data.order.title}" успешно куплена!`,
          "success"
        );
        // Обновляем отображение книги
        location.reload(); // Простое обновление, можно сделать более элегантно
      }
    } catch (error) {
      this.showNotification(`Ошибка покупки: ${error.message}`, "error");
    }
  }

  /**
   * Перенаправление на страницу входа
   */
  static redirectToLogin() {
    window.location.href = "/html/login.html";
  }
}

// Делаем UIUtils доступным глобально
window.UIUtils = UIUtils;

// Инициализация при загрузке DOM
document.addEventListener("DOMContentLoaded", function () {
  // Обновляем навигацию в зависимости от статуса авторизации
  UIUtils.updateNavigation();

  // Проверяем здоровье API при загрузке
  window.bookstoreAPI.utils
    .checkHealth()
    .then((response) => {
      console.log("API Health:", response.message);
    })
    .catch((error) => {
      console.error("API недоступен:", error);
      UIUtils.showNotification("Сервер временно недоступен", "warning");
    });
});

console.log("📚 Bookstore API модуль загружен успешно!");
