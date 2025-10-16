"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Вставка категорий (упрощенная версия - только основные)
    await queryInterface.bulkInsert("categories", [
      {
        id: 1,
        name: "Художественная литература",
        slug: "fiction",
        description: "Романы, повести, рассказы",
        parent_id: null,
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        name: "Фантастика",
        slug: "fantasy",
        description: "Научная фантастика и фэнтези",
        parent_id: 1,
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Вставка издательств (упрощенная версия)
    await queryInterface.bulkInsert("publishers", [
      {
        id: 1,
        name: "Издательство АСТ",
        description: "Крупнейшее российское издательство",
        website: "https://ast.ru",
        contact_email: "info@ast.ru",
        founded_year: 1990,
        country: "Россия",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Вставка авторов (упрощенная версия - только 2 автора)
    await queryInterface.bulkInsert("authors", [
      {
        id: 1,
        first_name: "Антуан",
        last_name: "де Сент-Экзюпери",
        biography: "Французский писатель, поэт и профессиональный лётчик",
        birth_date: new Date("1900-06-29"),
        death_date: new Date("1944-07-31"),
        nationality: "Французская",
        website: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        first_name: "Александр",
        last_name: "Беляев",
        biography: "Советский писатель-фантаст",
        birth_date: new Date("1884-03-16"),
        death_date: new Date("1942-01-06"),
        nationality: "Русская",
        website: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 4. Вставка книг (упрощенная версия - только 2 книги)
    await queryInterface.bulkInsert("books", [
      {
        id: 1,
        title: "Маленький принц",
        isbn: "978-5-389-12345-5",
        publisher_id: 1,
        category_id: 2,
        price: 890.0,
        stock: 25,
        description:
          "«Маленький принц» — наиболее известное произведение Антуана де Сент-Экзюпери. Это философская сказка-притча, в которой главные человеческие ценности представлены в простой и трогательной форме.",
        pages: 96,
        language: "ru",
        publication_year: 1943,
        popularity: 150,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Человек-амфибия",
        isbn: "978-5-389-12345-4",
        publisher_id: 1,
        category_id: 2,
        price: 1750.0,
        stock: 20,
        description:
          "«Человек-амфибия» — научно-фантастический роман Александра Беляева, опубликованный в 1928 году. История об Ихтиандре, молодом человеке с пересаженными жабрами акулы.",
        pages: 256,
        language: "ru",
        publication_year: 1928,
        popularity: 95,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 5. Связи книг и авторов
    await queryInterface.bulkInsert("book_authors", [
      {
        book_id: 1,
        author_id: 1,
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 2,
        author_id: 2,
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 6. Тестовый пользователь
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        email: "user@example.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS",
        first_name: "Иван",
        last_name: "Петров",
        phone: "+7-900-123-45-68",
        address: "Санкт-Петербург, Невский проспект, 20",
        role: "customer",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 7. Пример заказа
    await queryInterface.bulkInsert("orders", [
      {
        id: 1,
        user_id: 1,
        order_number: "ORD-2024-001",
        status: "delivered",
        total_amount: 890.0,
        shipping_address: "Санкт-Петербург, Невский проспект, 20",
        payment_method: "card",
        notes: null,
        created_at: new Date("2024-10-01"),
        updated_at: new Date("2024-10-03"),
        shipped_at: new Date("2024-10-02"),
        delivered_at: new Date("2024-10-03"),
      },
    ]);

    // 8. Позиция заказа
    await queryInterface.bulkInsert("order_items", [
      {
        order_id: 1,
        book_id: 1,
        quantity: 1,
        price_per_item: 890.0,
        total_price: 890.0,
        created_at: new Date("2024-10-01"),
        updated_at: new Date("2024-10-01"),
      },
    ]);

    // 9. Отзыв
    await queryInterface.bulkInsert("reviews", [
      {
        user_id: 1,
        book_id: 1,
        rating: 5,
        title: "Книга на все времена",
        comment:
          "Философская сказка, которую стоит перечитывать. Каждый раз находишь что-то новое.",
        is_verified_purchase: true,
        created_at: new Date("2024-10-05"),
        updated_at: new Date("2024-10-05"),
      },
    ]);

    // 10. Корзина
    await queryInterface.bulkInsert("cart_items", [
      {
        user_id: 1,
        book_id: 2,
        quantity: 1,
        added_at: new Date(),
      },
    ]);

    // 11. Список желаний
    await queryInterface.bulkInsert("wishlist", [
      {
        user_id: 1,
        book_id: 2,
        added_at: new Date("2024-10-10"),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем данные в обратном порядке (из-за foreign key constraints)
    await queryInterface.bulkDelete("wishlist", null, {});
    await queryInterface.bulkDelete("cart_items", null, {});
    await queryInterface.bulkDelete("reviews", null, {});
    await queryInterface.bulkDelete("order_items", null, {});
    await queryInterface.bulkDelete("orders", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("book_authors", null, {});
    await queryInterface.bulkDelete("books", null, {});
    await queryInterface.bulkDelete("authors", null, {});
    await queryInterface.bulkDelete("publishers", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
