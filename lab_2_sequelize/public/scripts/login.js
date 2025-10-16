// Скрипт для страницы входа

// Локальная функция для показа уведомлений
function showNotification(message, type = "info") {
  // Попробуем использовать UIUtils если доступен, иначе alert
  if (window.UIUtils && window.UIUtils.showNotification) {
    window.UIUtils.showNotification(message, type);
  } else {
    alert(message);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  console.log("Инициализация страницы входа...");

  // Проверяем, не авторизован ли пользователь уже
  if (window.bookstoreAPI && window.bookstoreAPI.isAuthenticated()) {
    showNotification("Вы уже авторизованы", "info");
    setTimeout(() => {
      window.location.href = "book.html";
    }, 1500);
  }

  // Обработка формы входа
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }
});

// Обработка входа
async function handleLogin(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get("email").trim();
  const password = formData.get("password");

  const messagesDiv = document.getElementById("login-messages");
  if (messagesDiv) {
    messagesDiv.innerHTML = "";
  }

  // Валидация на клиенте
  if (!email || !password) {
    showFormMessage("Пожалуйста, заполните все поля", "error");
    return;
  }

  // Показываем индикатор загрузки
  setLoadingState(true);

  try {
    const response = await window.bookstoreAPI.auth.login({ email, password });

    if (response.success) {
      showFormMessage(
        "Вход выполнен успешно! Перенаправляем в каталог...",
        "success"
      );
      showNotification(
        `Добро пожаловать, ${
          response.data.user.first_name || response.data.user.email
        }!`,
        "success"
      );

      // Перенаправляем в каталог после успешного входа
      setTimeout(() => {
        window.location.href = "book.html";
      }, 1500);
    } else {
      showFormMessage(response.message || "Ошибка входа", "error");
    }
  } catch (error) {
    console.error("Ошибка входа:", error);

    let errorMessage = "Произошла ошибка при входе";
    if (error.message.includes("Неверные учетные данные")) {
      errorMessage = "Неверный email или пароль";
    } else if (error.message.includes("сети")) {
      errorMessage = "Проблема с подключением к серверу";
    }

    showFormMessage(errorMessage, "error");
  } finally {
    setLoadingState(false);
  }
}

// Показать сообщение в форме
function showFormMessage(message, type) {
  const messagesDiv = document.getElementById("login-messages");
  if (messagesDiv) {
    messagesDiv.innerHTML = `
      <div class="form-message form-message--${type}">
        ${message}
      </div>
    `;
  }
}

// Управление состоянием загрузки
function setLoadingState(loading) {
  const loginBtn = document.getElementById("login-btn");
  const btnText = loginBtn?.querySelector(".btn-text");
  const btnLoading = loginBtn?.querySelector(".btn-loading");
  const form = document.getElementById("login-form");

  if (loading) {
    if (btnText) btnText.style.display = "none";
    if (btnLoading) btnLoading.style.display = "inline";
    if (loginBtn) loginBtn.disabled = true;
    if (form) form.style.opacity = "0.7";
  } else {
    if (btnText) btnText.style.display = "inline";
    if (btnLoading) btnLoading.style.display = "none";
    if (loginBtn) loginBtn.disabled = false;
    if (form) form.style.opacity = "1";
  }
}
