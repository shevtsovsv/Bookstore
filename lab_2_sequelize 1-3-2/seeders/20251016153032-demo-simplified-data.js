"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Категории
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
        name: "Романтика",
        slug: "romance",
        description: "Романтические произведения",
        parent_id: 1,
        is_active: true,
        sort_order: 1,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Издательства
    await queryInterface.bulkInsert("publishers", [
      {
        id: 1,
        name: "АСТ",
        country: "Россия",
        website: "https://ast.ru",
        contact_email: "info@ast.ru",
        founded_year: 1990,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Авторы
    await queryInterface.bulkInsert("authors", [
      {
        id: 1,
        first_name: "Маргарет",
        last_name: "Митчелл",
        birth_date: new Date("1900-11-08"),
        death_date: new Date("1949-08-16"),
        nationality: "Американская",
        biography: "Американская писательница, автор романа «Унесённые ветром»",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 4. Книги
    await queryInterface.bulkInsert("books", [
      {
        id: 1,
        title: "Унесённые ветром",
        isbn: "978-5-389-12345-1",
        publisher_id: 1,
        category_id: 2,
        price: 1750.0,
        stock: 5,
        description:
          "«Унесённые ветром» — роман Маргарет Митчелл, опубликованный в 1936 году.",
        pages: 1037,
        publication_year: 1936,
        popularity: 210,
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
    ]);

    // 6. Пользователи
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        first_name: "Администратор",
        last_name: "Системы",
        email: "admin@bookstore.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS",
        phone: "+7-900-123-45-67",
        role: "admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        first_name: "Иван",
        last_name: "Петров",
        email: "user@example.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS",
        phone: "+7-900-345-67-89",
        role: "customer",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 7. Корзина
    await queryInterface.bulkInsert("cart_items", [
      {
        user_id: 2,
        book_id: 1,
        quantity: 1,
        added_at: new Date(),
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    // Удаляем данные в обратном порядке (из-за foreign key constraints)
    await queryInterface.bulkDelete("cart_items", null, {});
    await queryInterface.bulkDelete("users", null, {});
    await queryInterface.bulkDelete("book_authors", null, {});
    await queryInterface.bulkDelete("books", null, {});
    await queryInterface.bulkDelete("authors", null, {});
    await queryInterface.bulkDelete("publishers", null, {});
    await queryInterface.bulkDelete("categories", null, {});
  },
};
