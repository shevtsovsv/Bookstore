/**
 * Тестовый скрипт для проверки работы моделей
 * Запуск: node test-models.js
 */

const { User, Book, sequelize } = require("./models");

async function testModels() {
  console.log("🚀 Тестирование моделей Sequelize...\n");

  try {
    // Тест подключения к базе данных
    console.log("📡 Проверка подключения к БД...");
    await sequelize.authenticate();
    console.log("✅ Подключение к PostgreSQL успешно!\n");

    // Тест создания пользователя
    console.log("👤 Тест создания пользователя...");
    const testUser = await User.createUser({
      email: "test@example.com",
      password: "TestPass123",
      first_name: "Иван",
      last_name: "Тестов",
    });
    console.log("✅ Пользователь создан:", {
      id: testUser.id,
      email: testUser.email,
      name: `${testUser.first_name} ${testUser.last_name}`,
    });

    // Тест аутентификации
    console.log("\n🔐 Тест аутентификации...");
    const authUser = await User.authenticate("test@example.com", "TestPass123");
    console.log("✅ Аутентификация успешна:", authUser ? "Да" : "Нет");

    // Тест неверного пароля
    const wrongAuth = await User.authenticate("test@example.com", "WrongPass");
    console.log(
      "✅ Защита от неверного пароля:",
      wrongAuth ? "Провал" : "Работает"
    );

    // Получение книг из базы
    console.log("\n📚 Тест получения книг...");
    const books = await Book.findAll({ limit: 3 });
    console.log(`✅ Найдено ${books.length} книг в БД:`);
    books.forEach((book) => {
      console.log(
        `  📖 ${book.title} - ${book.author} (${book.price}₽, склад: ${book.stock})`
      );
    });

    // Тест фильтрации книг в наличии
    console.log("\n📦 Тест фильтрации по наличию...");
    const availableBooks = await Book.findAvailable({ limit: 5 });
    console.log(`✅ Найдено ${availableBooks.length} книг в наличии:`);
    availableBooks.forEach((book) => {
      console.log(
        `  📖 ${book.title} - популярность: ${book.popularity}, склад: ${book.stock}`
      );
    });

    // Тест поиска по тексту
    console.log("\n🔍 Тест поиска книг...");
    const searchResults = await Book.search("принц");
    console.log(`✅ Поиск по "принц": найдено ${searchResults.length} книг`);
    searchResults.forEach((book) => {
      console.log(`  📖 ${book.title} - ${book.author}`);
    });

    // Тест покупки книги (транзакция)
    console.log("\n💰 Тест покупки книги...");
    const transaction = await sequelize.transaction();

    try {
      // Находим первую доступную книгу
      const { Op } = require("sequelize");
      const bookToBuy = await Book.findOne({
        where: { stock: { [Op.gt]: 0 } },
        transaction,
      });
      if (bookToBuy) {
        console.log(
          `📖 Покупаем: ${bookToBuy.title} (склад до покупки: ${bookToBuy.stock})`
        );

        // Покупка через модель (атомарная операция)
        await Book.purchaseBooks(bookToBuy.id, 1, transaction);

        await transaction.commit();

        // Добавляем заказ в историю пользователя (после коммита транзакции)
        await testUser.addOrder({
          book_id: bookToBuy.id,
          title: bookToBuy.title,
          quantity: 1,
          price: bookToBuy.price,
          total: bookToBuy.price,
        });

        // Проверяем обновленные данные
        await bookToBuy.reload();
        await testUser.reload();

        console.log(`✅ Покупка завершена! Склад после: ${bookToBuy.stock}`);
        console.log(`✅ Популярность увеличена до: ${bookToBuy.popularity}`);
        console.log(
          `✅ История заказов пользователя: ${testUser.getOrdersCount()} заказов`
        );
        console.log(`✅ Общая сумма покупок: ${testUser.getTotalSpent()}₽`);
      }
    } catch (error) {
      await transaction.rollback();
      console.log("❌ Ошибка покупки:", error.message);
    }

    // Тест статистики книг
    console.log("\n📊 Статистика книг...");
    const stats = await Book.getStats();
    console.log("✅ Статистика:", {
      "Всего книг": stats.total,
      "В наличии": stats.available,
      Закончились: stats.outOfStock,
      "Процент доступности": `${stats.percentage}%`,
    });

    // Тест популярных книг
    console.log("\n🏆 Топ-3 популярных книг...");
    const popularBooks = await Book.findPopular(3);
    console.log(`✅ Найдено ${popularBooks.length} популярных книг:`);
    popularBooks.forEach((book, index) => {
      console.log(
        `  ${index + 1}. ${book.title} - популярность: ${book.popularity}`
      );
    });

    console.log("\n🎉 Все тесты завершены успешно!");
  } catch (error) {
    console.error("❌ Ошибка при тестировании:", error.message);
    console.error("Подробности:", error);
  } finally {
    // Очистка тестовых данных
    console.log("\n🧹 Очистка тестовых данных...");
    try {
      await User.destroy({ where: { email: "test@example.com" } });
      console.log("✅ Тестовый пользователь удален");
    } catch (error) {
      console.log("⚠️ Ошибка при очистке:", error.message);
    }

    await sequelize.close();
    console.log("📡 Соединение с БД закрыто");
  }
}

// Запуск тестирования
if (require.main === module) {
  testModels()
    .then(() => {
      console.log("\n✅ Тестирование завершено!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("\n❌ Критическая ошибка:", error);
      process.exit(1);
    });
}

module.exports = testModels;
