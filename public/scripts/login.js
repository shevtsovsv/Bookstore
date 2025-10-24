/**
 * JavaScript для страницы входа
 * Обработка формы, валидация, API интеграция
 */

document.addEventListener("DOMContentLoaded", function () {
  // Проверить, не авторизован ли уже пользователь
  if (Auth.isAuthenticated()) {
    console.log("Пользователь уже авторизован, перенаправляем...");
    NavigationUtils.redirectAfterLogin();
    return;
  }

  // Получить элементы формы
  const loginForm = document.getElementById("loginForm");
  const emailField = document.getElementById("email");
  const passwordField = document.getElementById("password");
  const rememberField = document.getElementById("remember");

  // Обработчик отправки формы
  loginForm.addEventListener("submit", handleLoginSubmit);

  // Валидация в реальном времени
  emailField.addEventListener("blur", validateEmailField);
  passwordField.addEventListener("blur", validatePasswordField);

  /**
   * Обработчик отправки формы входа
   */
  async function handleLoginSubmit(event) {
    event.preventDefault();

    console.log("Начинаем процесс входа...");

    // Очистить предыдущие ошибки
    FormUtils.clearFormErrors();

    // Собрать данные формы
    const formData = {
      email: emailField.value.trim(),
      password: passwordField.value,
      remember: rememberField.checked,
    };

    console.log("Данные формы:", { ...formData, password: "[СКРЫТО]" });

    // Валидация на клиенте
    if (!validateForm(formData)) {
      console.log("Валидация формы не прошла");
      return;
    }

    try {
      // Показать состояние загрузки
      FormUtils.setButtonLoading("loginBtn", true);
      FormUtils.showNotification("Вход в систему...", "info");

      // Отправить запрос на сервер
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log("Ответ сервера:", data);

      if (response.ok && data.success) {
        // Успешный вход
        console.log("Вход успешен:", data.data.user);

        FormUtils.showNotification("Добро пожаловать!", "success");

        // Сохранить токен и данные пользователя
        Auth.login(data.data.token, data.data.user);

        // Перенаправить на сохраненную страницу или главную
        setTimeout(() => {
          NavigationUtils.redirectAfterLogin();
        }, 1000);
      } else {
        // Ошибки от сервера
        console.error("Ошибка входа:", data);
        handleServerErrors(data);
      }
    } catch (error) {
      console.error("Ошибка сети при входе:", error);
      FormUtils.showNotification(
        "Ошибка соединения с сервером. Попробуйте позже.",
        "error"
      );
    } finally {
      // Убрать состояние загрузки
      FormUtils.setButtonLoading("loginBtn", false);
    }
  }

  /**
   * Валидация всей формы
   */
  function validateForm(data) {
    let isValid = true;

    // Проверка email
    if (!data.email) {
      FormUtils.showFieldError("email", "Email обязателен для заполнения");
      isValid = false;
    } else if (!FormUtils.validateEmail(data.email)) {
      FormUtils.showFieldError("email", "Введите корректный email адрес");
      isValid = false;
    }

    // Проверка пароля
    if (!data.password) {
      FormUtils.showFieldError("password", "Пароль обязателен для заполнения");
      isValid = false;
    }

    return isValid;
  }

  /**
   * Обработка ошибок от сервера
   */
  function handleServerErrors(data) {
    if (data.errors && Array.isArray(data.errors)) {
      // Ошибки валидации express-validator
      data.errors.forEach((error) => {
        const fieldName = error.path || error.param;
        if (fieldName) {
          FormUtils.showFieldError(fieldName, error.msg);
        }
      });
    } else if (data.message) {
      // Общая ошибка (неверный email/пароль)
      FormUtils.showNotification(data.message, "error");
    } else {
      // Неизвестная ошибка
      FormUtils.showNotification("Произошла ошибка при входе", "error");
    }
  }

  /**
   * Валидация email поля
   */
  function validateEmailField() {
    const email = emailField.value.trim();
    const errorElement = document.getElementById("email-error");

    if (email && !FormUtils.validateEmail(email)) {
      FormUtils.showFieldError("email", "Введите корректный email адрес");
    } else if (errorElement) {
      errorElement.style.display = "none";
      emailField.classList.remove("error");
    }
  }

  /**
   * Валидация пароля
   */
  function validatePasswordField() {
    const password = passwordField.value;
    const errorElement = document.getElementById("password-error");

    if (!password) {
      FormUtils.showFieldError("password", "Пароль обязателен для заполнения");
    } else if (errorElement) {
      errorElement.style.display = "none";
      passwordField.classList.remove("error");
    }
  }

  console.log("Login script initialized");
});

/**
 * Показать форму восстановления пароля
 * (заглушка для будущей реализации)
 */
function showForgotPassword() {
  FormUtils.showNotification(
    "Функция восстановления пароля будет добавлена в следующих версиях",
    "info"
  );
}
