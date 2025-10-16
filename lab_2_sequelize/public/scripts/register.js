// Скрипт для страницы регистрации

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
  console.log("Инициализация страницы регистрации...");

  // Проверяем, не авторизован ли пользователь уже
  if (window.bookstoreAPI && window.bookstoreAPI.isAuthenticated()) {
    showNotification("Вы уже авторизованы", "info");
    setTimeout(() => {
      window.location.href = "../index.html";
    }, 1500);
  }

  // Добавляем валидацию пароля в реальном времени
  setupPasswordValidation();

  // Обработка формы регистрации
  const registerForm = document.getElementById("register-form");
  if (registerForm) {
    registerForm.addEventListener("submit", handleRegister);
  }
});

// Настройка валидации пароля
function setupPasswordValidation() {
  const passwordInput = document.getElementById("password");

  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      validatePassword(this.value);
    });
  }
}

// Валидация требований к паролю
function validatePassword(password) {
  const requirements = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    digit: /\d/.test(password),
  };

  // Обновляем визуальные индикаторы
  updateRequirement("req-length", requirements.length);
  updateRequirement("req-uppercase", requirements.uppercase);
  updateRequirement("req-lowercase", requirements.lowercase);
  updateRequirement("req-digit", requirements.digit);

  return Object.values(requirements).every((req) => req);
}

// Обновление индикатора требования
function updateRequirement(elementId, isValid) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = element.textContent.replace(
      /^[✗✓]/,
      isValid ? "✓" : "✗"
    );
    element.style.color = isValid ? "green" : "red";
  }
}

// Обработка регистрации
async function handleRegister(e) {
  e.preventDefault();

  const formData = new FormData(e.target);
  const email = formData.get("email").trim();
  const password = formData.get("password");
  const confirmPassword = formData.get("confirm-password");
  const firstName = formData.get("first_name").trim();
  const lastName = formData.get("last_name").trim();

  const messagesDiv = document.getElementById("register-messages");
  if (messagesDiv) {
    messagesDiv.innerHTML = "";
  }

  // Валидация на клиенте
  if (!email || !password || !confirmPassword) {
    showFormMessage("Пожалуйста, заполните все обязательные поля", "error");
    return;
  }

  if (password !== confirmPassword) {
    showFormMessage("Пароли не совпадают", "error");
    return;
  }

  if (!validatePassword(password)) {
    showFormMessage("Пароль не соответствует требованиям", "error");
    return;
  }

  // Показываем индикатор загрузки
  setLoadingState(true);

  try {
    const userData = {
      email,
      password,
      first_name: firstName || undefined,
      last_name: lastName || undefined,
    };

    const response = await window.bookstoreAPI.auth.register(userData);

    if (response.success) {
      showFormMessage(
        "Регистрация успешна! Перенаправляем в каталог...",
        "success"
      );
      showNotification(
        `Добро пожаловать, ${
          response.data.user.first_name || response.data.user.email
        }!`,
        "success"
      );

      // Перенаправляем в каталог после успешной регистрации
      setTimeout(() => {
        window.location.href = "book.html";
      }, 1500);
    } else {
      showFormMessage(response.message || "Ошибка регистрации", "error");
    }
  } catch (error) {
    console.error("Ошибка регистрации:", error);

    let errorMessage = "Произошла ошибка при регистрации";
    if (error.message.includes("уже существует")) {
      errorMessage = "Пользователь с таким email уже зарегистрирован";
    } else if (error.message.includes("валидация")) {
      errorMessage = "Проверьте правильность введенных данных";
    }

    showFormMessage(errorMessage, "error");
  } finally {
    setLoadingState(false);
  }
}

// Показать сообщение в форме
function showFormMessage(message, type) {
  const messagesDiv = document.getElementById("register-messages");
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
  const registerBtn = document.getElementById("register-btn");
  const btnText = registerBtn?.querySelector(".btn-text");
  const btnLoading = registerBtn?.querySelector(".btn-loading");
  const form = document.getElementById("register-form");

  if (loading) {
    if (btnText) btnText.style.display = "none";
    if (btnLoading) btnLoading.style.display = "inline";
    if (registerBtn) registerBtn.disabled = true;
    if (form) form.style.opacity = "0.7";
  } else {
    if (btnText) btnText.style.display = "inline";
    if (btnLoading) btnLoading.style.display = "none";
    if (registerBtn) registerBtn.disabled = false;
    if (form) form.style.opacity = "1";
  }
}
