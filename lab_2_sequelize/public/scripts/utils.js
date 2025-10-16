// Утилиты для веб-приложения интернет-магазина

/**
 * Утилиты для работы с UI
 */
window.UIUtils = {
  /**
   * Экранирование HTML для безопасного отображения
   */
  escapeHtml: function (text) {
    if (!text) return "";

    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  },

  /**
   * Показать уведомление пользователю
   */
  showNotification: function (message, type = "info") {
    // Удаляем предыдущие уведомления
    const existingNotifications = document.querySelectorAll(".notification");
    existingNotifications.forEach((n) => n.remove());

    // Создаем новое уведомление
    const notification = document.createElement("div");
    notification.className = `notification notification-${type}`;
    notification.textContent = message;

    // Добавляем стили
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 12px 24px;
      border-radius: 4px;
      color: white;
      font-weight: 500;
      z-index: 10000;
      max-width: 300px;
      word-wrap: break-word;
      animation: slideIn 0.3s ease-out;
    `;

    // Цвета в зависимости от типа
    const colors = {
      success: "#28a745",
      error: "#dc3545",
      warning: "#ffc107",
      info: "#17a2b8",
    };

    notification.style.backgroundColor = colors[type] || colors.info;

    // Добавляем CSS анимацию если её нет
    if (!document.querySelector("#notification-styles")) {
      const style = document.createElement("style");
      style.id = "notification-styles";
      style.textContent = `
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `;
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // Автоматически убираем через 5 секунд
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 5000);

    // Клик для ручного закрытия
    notification.addEventListener("click", () => {
      notification.remove();
    });
  },

  /**
   * Форматирование цены
   */
  formatPrice: function (price) {
    return parseFloat(price).toLocaleString("ru-RU") + "₽";
  },

  /**
   * Форматирование даты
   */
  formatDate: function (dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString("ru-RU", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  },

  /**
   * Получение параметра из URL
   */
  getUrlParameter: function (name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  },

  /**
   * Загрузка изображения с обработкой ошибок
   */
  loadImageWithFallback: function (
    img,
    src,
    fallbackSrc = "img/book-placeholder.png"
  ) {
    img.onerror = function () {
      if (this.src !== fallbackSrc) {
        this.src = fallbackSrc;
      }
    };
    img.src = src;
  },

  /**
   * Простая валидация email
   */
  isValidEmail: function (email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Простая валидация пароля
   */
  isValidPassword: function (password) {
    // Минимум 6 символов, хотя бы одна буква и одна цифра
    return (
      password.length >= 6 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password)
    );
  },

  /**
   * Показать спиннер загрузки
   */
  showLoading: function (element) {
    const spinner = document.createElement("div");
    spinner.className = "loading-spinner";
    spinner.innerHTML = '<div class="spinner"></div>';
    spinner.style.cssText = `
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100px;
    `;

    // Добавляем CSS для спиннера если его нет
    if (!document.querySelector("#spinner-styles")) {
      const style = document.createElement("style");
      style.id = "spinner-styles";
      style.textContent = `
        .spinner {
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007bff;
          border-radius: 50%;
          width: 30px;
          height: 30px;
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    element.innerHTML = "";
    element.appendChild(spinner);
  },

  /**
   * Скрыть спиннер загрузки
   */
  hideLoading: function (element) {
    const spinner = element.querySelector(".loading-spinner");
    if (spinner) {
      spinner.remove();
    }
  },
};

console.log("Utils loaded successfully");
