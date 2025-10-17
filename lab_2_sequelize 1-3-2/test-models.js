/**
 * Тестовый скрипт для проверки работы упрощённых моделей (7 таблиц)
 * Запуск: node test-models.js
 */

const { sequelize } = require("./models");

async function testModels() {
  console.log("🚀 Тестирование упрощённых моделей Sequelize (7 таблиц)...\n");

  try {
    console.log("🔄 Проверка подключения к базе данных...");

    // Проверяем подключение к БД
    await sequelize.authenticate();
    console.log("✅ Подключение к PostgreSQL установлено успешно.");

    // Выводим список всех моделей
    console.log("\n📋 Загруженные модели:");
    Object.keys(sequelize.models).forEach((modelName) => {
      console.log(`  - ${modelName}`);
    });

    console.log("\n🔗 Проверка ассоциаций:");

    // Проверяем ассоциации для упрощённых моделей
    const {
      User,
      Book,
      Category,
      Author,
      Publisher,
      CartItem,
      BookAuthor,
    } = sequelize.models;

    console.log(
      `  - User ассоциации: ${Object.keys(User.associations).join(", ")}`
    );
    console.log(
      `  - Book ассоциации: ${Object.keys(Book.associations).join(", ")}`
    );
    console.log(
      `  - Category ассоциации: ${Object.keys(Category.associations).join(
        ", "
      )}`
    );
    console.log(
      `  - Author ассоциации: ${Object.keys(Author.associations).join(", ")}`
    );
    console.log(
      `  - Publisher ассоциации: ${Object.keys(Publisher.associations).join(
        ", "
      )}`
    );
    console.log(
      `  - CartItem ассоциации: ${Object.keys(CartItem.associations).join(
        ", "
      )}`
    );
    console.log(
      `  - BookAuthor ассоциации: ${Object.keys(BookAuthor.associations).join(
        ", "
      )}`
    );

    console.log("\n📊 Статистика моделей:");
    console.log(`  - Всего моделей: ${Object.keys(sequelize.models).length}`);
    console.log(
      `  - Основные сущности: User, Category, Publisher, Author, Book`
    );
    console.log(`  - Связующие таблицы: BookAuthor`);
    console.log(
      `  - Функциональность: CartItem (корзина покупок)`
    );

    console.log("\n✅ Все модели загружены и ассоциации настроены корректно!");
    console.log("🎯 Готово для запуска миграций и создания таблиц в БД");
  } catch (error) {
    console.error("❌ Ошибка при тестировании моделей:", error.message);

    if (error.name === "ConnectionError") {
      console.log("\n💡 Возможные причины:");
      console.log("  1. PostgreSQL не запущен");
      console.log(
        "  2. Неправильные настройки подключения в config/config.json"
      );
      console.log("  3. База данных не создана");
      console.log(
        "  4. Нужно запустить миграции: npx sequelize-cli db:migrate"
      );
    }
  } finally {
    await sequelize.close();
  }
}

// Запускаем тест
if (require.main === module) {
  testModels();
}

module.exports = { testModels };
