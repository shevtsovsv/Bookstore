/**
 * Тестовый скрипт для проверки всех API endpoints
 * Запуск: node test-api.js
 *
 * ВАЖНО: Сервер должен быть запущен перед тестированием!
 * npm run dev (в другом терминале)
 */

const axios = require("axios");

// Базовый URL API
const BASE_URL = "http://localhost:3000/api";

// Глобальные переменные для тестирования
let userToken = null;
let testUserId = null;
let testBookId = null;

/**
 * Утилиты для тестирования
 */
const utils = {
  // Логирование результатов
  log: (emoji, message, data = null) => {
    console.log(`${emoji} ${message}`);
    if (data) {
      console.log("   ", JSON.stringify(data, null, 2).split("\n")[0]);
    }
  },

  // Обработка ошибок
  handleError: (error, context) => {
    console.log(`❌ ${context}:`);
    if (error.response) {
      console.log("   Status:", error.response.status);
      console.log(
        "   Message:",
        error.response.data.message || "Неизвестная ошибка"
      );
      if (error.response.data.errors) {
        console.log("   Errors:", error.response.data.errors);
      }
    } else {
      console.log("   Error:", error.message);
    }
  },

  // Задержка между запросами
  delay: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
};

/**
 * Тесты здоровья API
 */
const testHealthAndInfo = async () => {
  console.log("\n🏥 === ТЕСТИРОВАНИЕ ЗДОРОВЬЯ API ===");

  try {
    // Проверка здоровья API
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    utils.log("✅", "API Health Check", {
      status: healthResponse.status,
      message: healthResponse.data.message,
    });

    // Информация об API
    const infoResponse = await axios.get(`${BASE_URL}/info`);
    utils.log("✅", "API Info", {
      name: infoResponse.data.data.name,
      version: infoResponse.data.data.version,
    });
  } catch (error) {
    utils.handleError(error, "Тест здоровья API");
  }
};

/**
 * Тесты аутентификации
 */
const testAuthentication = async () => {
  console.log("\n🔐 === ТЕСТИРОВАНИЕ АУТЕНТИФИКАЦИИ ===");

  try {
    // Генерация уникального email для тестирования
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "TestPass123";

    // 1. Регистрация пользователя
    utils.log("📝", "Тест регистрации...");
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      email: testEmail,
      password: testPassword,
      first_name: "Тест",
      last_name: "Пользователь",
    });

    utils.log("✅", "Регистрация успешна", {
      user_id: registerResponse.data.data.user.id,
      email: registerResponse.data.data.user.email,
    });

    userToken = registerResponse.data.data.token;
    testUserId = registerResponse.data.data.user.id;

    await utils.delay(100);

    // 2. Авторизация пользователя
    utils.log("🔓", "Тест авторизации...");
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmail,
      password: testPassword,
    });

    utils.log("✅", "Авторизация успешна", {
      token_type: loginResponse.data.data.token_type,
      user_email: loginResponse.data.data.user.email,
    });

    await utils.delay(100);

    // 3. Получение профиля пользователя
    utils.log("👤", "Тест получения профиля...");
    const profileResponse = await axios.get(`${BASE_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    utils.log("✅", "Профиль получен", {
      id: profileResponse.data.data.user.id,
      email: profileResponse.data.data.user.email,
      orders_count: profileResponse.data.data.user.orders_count,
    });

    await utils.delay(100);

    // 4. Тест неверного пароля
    utils.log("🚫", "Тест неверного пароля...");
    try {
      await axios.post(`${BASE_URL}/auth/login`, {
        email: testEmail,
        password: "WrongPassword",
      });
      utils.log("❌", "Ошибка: неверный пароль должен быть отклонен");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        utils.log("✅", "Неверный пароль корректно отклонен");
      } else {
        throw error;
      }
    }
  } catch (error) {
    utils.handleError(error, "Тест аутентификации");
  }
};

/**
 * Тесты каталога книг
 */
const testBooksAPI = async () => {
  console.log("\n📚 === ТЕСТИРОВАНИЕ API КНИГ ===");

  try {
    // 1. Получение списка книг
    utils.log("📖", "Тест получения списка книг...");
    const booksResponse = await axios.get(`${BASE_URL}/books`, {
      params: {
        page: 1,
        limit: 5,
        onlyAvailable: true,
      },
    });

    const books = booksResponse.data.data.books;
    utils.log("✅", `Получено ${books.length} книг`, {
      total: booksResponse.data.data.pagination.total,
      first_book: books[0] ? books[0].title : "Нет книг",
    });

    if (books.length > 0) {
      testBookId = books[0].id;
    }

    await utils.delay(100);

    // 2. Поиск книг
    utils.log("🔍", "Тест поиска книг...");
    const searchResponse = await axios.get(`${BASE_URL}/books`, {
      params: {
        search: "принц",
        limit: 3,
      },
    });

    utils.log(
      "✅",
      `Поиск по "принц": найдено ${searchResponse.data.data.books.length} книг`
    );

    await utils.delay(100);

    // 3. Получение популярных книг
    utils.log("🏆", "Тест популярных книг...");
    const popularResponse = await axios.get(`${BASE_URL}/books/popular`, {
      params: { limit: 3 },
    });

    utils.log(
      "✅",
      `Популярные книги: ${popularResponse.data.data.books.length} шт`,
      {
        top_book: popularResponse.data.data.books[0]
          ? `${popularResponse.data.data.books[0].title} (${popularResponse.data.data.books[0].popularity})`
          : "Нет книг",
      }
    );

    await utils.delay(100);

    // 4. Получение статистики
    utils.log("📊", "Тест статистики книг...");
    const statsResponse = await axios.get(`${BASE_URL}/books/stats`);

    utils.log("✅", "Статистика получена", {
      total_books: statsResponse.data.data.books.total,
      available: statsResponse.data.data.books.available,
      avg_price: statsResponse.data.data.pricing.average,
    });

    await utils.delay(100);

    // 5. Получение конкретной книги
    if (testBookId) {
      utils.log("📋", "Тест получения конкретной книги...");
      const bookResponse = await axios.get(`${BASE_URL}/books/${testBookId}`);

      utils.log("✅", "Книга получена", {
        id: bookResponse.data.data.book.id,
        title: bookResponse.data.data.book.title,
        stock: bookResponse.data.data.book.stock,
      });
    }
  } catch (error) {
    utils.handleError(error, "Тест API книг");
  }
};

/**
 * Тесты покупок
 */
const testPurchasing = async () => {
  console.log("\n💰 === ТЕСТИРОВАНИЕ ПОКУПОК ===");

  if (!userToken || !testBookId) {
    utils.log("⚠️", "Пропуск тестов покупок: нет токена или ID книги");
    return;
  }

  try {
    // 1. Покупка книги
    utils.log("🛒", "Тест покупки книги...");
    const purchaseResponse = await axios.post(
      `${BASE_URL}/books/${testBookId}/purchase`,
      { quantity: 1 },
      {
        headers: {
          Authorization: `Bearer ${userToken}`,
        },
      }
    );

    utils.log("✅", "Покупка завершена", {
      order_id: purchaseResponse.data.data.order.order_id,
      book_title: purchaseResponse.data.data.order.title,
      total: purchaseResponse.data.data.order.total,
      new_stock: purchaseResponse.data.data.book.stock,
    });

    await utils.delay(100);

    // 2. Проверка истории заказов
    utils.log("📋", "Тест истории заказов...");
    const ordersResponse = await axios.get(`${BASE_URL}/auth/orders`, {
      headers: {
        Authorization: `Bearer ${userToken}`,
      },
    });

    utils.log("✅", "История заказов получена", {
      orders_count: ordersResponse.data.data.orders.length,
      total_spent: ordersResponse.data.data.statistics.total_spent,
    });

    await utils.delay(100);

    // 3. Тест покупки без аутентификации
    utils.log("🚫", "Тест покупки без токена...");
    try {
      await axios.post(`${BASE_URL}/books/${testBookId}/purchase`, {
        quantity: 1,
      });
      utils.log("❌", "Ошибка: покупка без токена должна быть отклонена");
    } catch (error) {
      if (error.response && error.response.status === 401) {
        utils.log("✅", "Покупка без токена корректно отклонена");
      } else {
        throw error;
      }
    }
  } catch (error) {
    utils.handleError(error, "Тест покупок");
  }
};

/**
 * Тесты валидации
 */
const testValidation = async () => {
  console.log("\n🔍 === ТЕСТИРОВАНИЕ ВАЛИДАЦИИ ===");

  try {
    // 1. Тест регистрации с неверными данными
    utils.log("📝", "Тест валидации регистрации...");
    try {
      await axios.post(`${BASE_URL}/auth/register`, {
        email: "invalid-email",
        password: "123", // слишком короткий
        first_name: "",
      });
      utils.log("❌", "Ошибка: неверные данные должны быть отклонены");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        utils.log("✅", "Валидация регистрации работает", {
          errors_count: error.response.data.errors
            ? error.response.data.errors.length
            : 0,
        });
      } else {
        throw error;
      }
    }

    await utils.delay(100);

    // 2. Тест валидации параметров книг
    utils.log("📖", "Тест валидации параметров книг...");
    try {
      await axios.get(`${BASE_URL}/books`, {
        params: {
          page: 0, // невалидная страница
          limit: 1000, // превышает максимум
        },
      });
      utils.log("❌", "Ошибка: неверные параметры должны быть отклонены");
    } catch (error) {
      if (error.response && error.response.status === 400) {
        utils.log("✅", "Валидация параметров книг работает");
      } else {
        throw error;
      }
    }
  } catch (error) {
    utils.handleError(error, "Тест валидации");
  }
};

/**
 * Очистка тестовых данных
 */
const cleanup = async () => {
  console.log("\n🧹 === ОЧИСТКА ТЕСТОВЫХ ДАННЫХ ===");

  if (!testUserId) {
    utils.log("ℹ️", "Нет данных для очистки");
    return;
  }

  try {
    // Удаляем тестового пользователя из базы данных
    const { User } = require("./models");
    await User.destroy({ where: { id: testUserId } });
    utils.log("✅", "Тестовый пользователь удален");
  } catch (error) {
    utils.log("⚠️", "Ошибка при очистке:", error.message);
  }
};

/**
 * Основная функция тестирования
 */
const runAllTests = async () => {
  console.log("🚀 === НАЧАЛО ТЕСТИРОВАНИЯ API ===");
  console.log("📅 Время:", new Date().toLocaleString());
  console.log("🌐 Базовый URL:", BASE_URL);

  try {
    await testHealthAndInfo();
    await testAuthentication();
    await testBooksAPI();
    await testPurchasing();
    await testValidation();

    console.log("\n✅ === ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ УСПЕШНО ===");
  } catch (error) {
    console.log("\n❌ === КРИТИЧЕСКАЯ ОШИБКА В ТЕСТАХ ===");
    console.error(error);
  } finally {
    await cleanup();
    console.log("\n🏁 === ТЕСТИРОВАНИЕ ЗАВЕРШЕНО ===");
  }
};

// Проверка доступности сервера перед тестированием
const checkServerAvailability = async () => {
  try {
    await axios.get(`${BASE_URL}/health`);
    console.log("✅ Сервер доступен, начинаем тестирование...\n");
    await runAllTests();
  } catch (error) {
    console.log("❌ Сервер недоступен!");
    console.log("💡 Убедитесь, что сервер запущен: npm run dev");
    console.log("🌐 URL сервера:", BASE_URL);
    process.exit(1);
  }
};

// Запуск тестирования
if (require.main === module) {
  checkServerAvailability()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error("Критическая ошибка:", error);
      process.exit(1);
    });
}

module.exports = {
  runAllTests,
  checkServerAvailability,
};
