"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // 1. Вставка категорий
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
      {
        id: 3,
        name: "Драма",
        slug: "drama",
        description: "Драматические произведения",
        parent_id: 1,
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        name: "Фантастика",
        slug: "fantasy",
        description: "Научная фантастика и фэнтези",
        parent_id: 1,
        is_active: true,
        sort_order: 3,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        name: "Биография",
        slug: "biography",
        description: "Биографические произведения",
        parent_id: null,
        is_active: true,
        sort_order: 2,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 2. Вставка издательств
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
      {
        id: 2,
        name: "Эксмо",
        description: "Ведущее российское издательство",
        website: "https://eksmo.ru",
        contact_email: "info@eksmo.ru",
        founded_year: 1991,
        country: "Россия",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        name: "Азбука-Аттикус",
        description: "Издательская группа",
        website: "https://azbooka.ru",
        contact_email: "info@azbooka.ru",
        founded_year: 1995,
        country: "Россия",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 3. Вставка авторов
    await queryInterface.bulkInsert("authors", [
      {
        id: 1,
        first_name: "Маргарет",
        last_name: "Митчелл",
        biography: "Американская писательница, автор романа 'Унесённые ветром'",
        birth_date: new Date("1900-11-08"),
        death_date: new Date("1949-08-16"),
        nationality: "Американская",
        website: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        first_name: "Александр",
        last_name: "Островский",
        biography: "Русский драматург, театральный деятель",
        birth_date: new Date("1823-04-12"),
        death_date: new Date("1886-06-14"),
        nationality: "Русская",
        website: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        first_name: "Алексей",
        last_name: "Бирюлин",
        biography: "Современный российский писатель",
        birth_date: new Date("1965-03-15"),
        death_date: null,
        nationality: "Русская",
        website: "https://biryulin.ru",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
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
      {
        id: 5,
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
        id: 6,
        first_name: "Фрэнсис Скотт",
        last_name: "Фицджеральд",
        biography:
          "Американский писатель, представитель 'потерянного поколения'",
        birth_date: new Date("1896-09-24"),
        death_date: new Date("1940-12-21"),
        nationality: "Американская",
        website: null,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 4. Вставка книг
    await queryInterface.bulkInsert("books", [
      {
        id: 1,
        title: "Унесённые ветром",
        isbn: "978-5-389-12345-1",
        publisher_id: 1,
        category_id: 2, // Романтика
        price: 900.0,
        stock: 15,
        description:
          "«Унесённые ветром» — роман американской писательницы Маргарет Митчелл, опубликованный в 1936 году. Действие происходит в штате Джорджия во время Гражданской войны в США и в период Реконструкции Юга.",
        short_description:
          "Масштабная история любви на фоне Гражданской войны в США",
        image: "book1.jpg",
        pages: 704,
        publication_year: 1936,
        popularity: 85,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        title: "Гроза",
        isbn: "978-5-389-12345-2",
        publisher_id: 2,
        category_id: 3, // Драма
        price: 550.0,
        stock: 8,
        description:
          "«Гроза» — пьеса А. Н. Островского в пяти действиях, написанная в 1859 году. Это одно из самых известных произведений русской драматургии.",
        short_description: "Драма о столкновении старого и нового мира",
        image: "book2.jpg",
        pages: 128,
        publication_year: 1859,
        popularity: 120,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        title: "Море и звезды",
        isbn: "978-5-389-12345-3",
        publisher_id: 3,
        category_id: 5, // Биография
        price: 1670.0,
        stock: 12,
        description:
          "«Море и звезды» — художественно-документальное произведение о великих мореплавателях и исследователях.",
        short_description:
          "Исторический роман-биография о великих мореплавателях",
        image: "book3.jpg",
        pages: 412,
        publication_year: 2020,
        popularity: 45,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 4,
        title: "Человек-амфибия",
        isbn: "978-5-389-12345-4",
        publisher_id: 1,
        category_id: 4, // Фантастика
        price: 1750.0,
        stock: 20,
        description:
          "«Человек-амфибия» — научно-фантастический роман Александра Беляева, опубликованный в 1928 году.",
        short_description: "Научно-фантастическая драма о человеке с жабрами",
        image: "book4.jpg",
        pages: 256,
        publication_year: 1928,
        popularity: 95,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 5,
        title: "Маленький принц",
        isbn: "978-5-389-12345-5",
        publisher_id: 2,
        category_id: 4, // Фантастика
        price: 890.0,
        stock: 25,
        description:
          "«Маленький принц» — наиболее известное произведение Антуана де Сент-Экзюпери.",
        short_description: "Философская сказка-притча о самом важном",
        image: "book5.jpg",
        pages: 96,
        publication_year: 1943,
        popularity: 150,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 6,
        title: "Великий Гэтсби",
        isbn: "978-5-389-12345-6",
        publisher_id: 3,
        category_id: 3, // Драма
        price: 1200.0,
        stock: 0, // Закончился на складе
        description:
          "«Великий Гэтсби» — роман американского писателя Фрэнсиса Скотта Фицджеральда, опубликованный в 1925 году.",
        short_description: "Трагическая история о американской мечте",
        image: "book6.jpg",
        pages: 180,
        publication_year: 1925,
        popularity: 78,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 5. Связи книг и авторов
    await queryInterface.bulkInsert("book_authors", [
      {
        book_id: 1,
        author_id: 1, // Маргарет Митчелл
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 2,
        author_id: 2, // Александр Островский
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 3,
        author_id: 3, // Алексей Бирюлин
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 4,
        author_id: 4, // Александр Беляев
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 5,
        author_id: 5, // Антуан де Сент-Экзюпери
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        book_id: 6,
        author_id: 6, // Фрэнсис Скотт Фицджеральд
        role: "main_author",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 6. Тестовые пользователи
    await queryInterface.bulkInsert("users", [
      {
        id: 1,
        email: "admin@bookstore.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS", // password: admin123
        first_name: "Администратор",
        last_name: "Системы",
        phone: "+7-900-123-45-67",
        address: "Москва, ул. Тверская, 1",
        role: "admin",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 2,
        email: "user@example.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS", // password: User123!
        first_name: "Иван",
        last_name: "Петров",
        phone: "+7-900-123-45-68",
        address: "Санкт-Петербург, Невский проспект, 20",
        role: "customer",
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        id: 3,
        email: "manager@bookstore.com",
        password_hash:
          "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/JG0QE6jAS", // password: Manager123!
        first_name: "Анна",
        last_name: "Менеджер",
        phone: "+7-900-123-45-69",
        address: "Москва, ул. Арбат, 10",
        role: "manager",
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);

    // 7. Примеры заказов
    await queryInterface.bulkInsert("orders", [
      {
        id: 1,
        user_id: 2,
        order_number: "ORD-2024-001",
        status: "delivered",
        total_amount: 1340.0,
        shipping_address: "Санкт-Петербург, Невский проспект, 20",
        payment_method: "card",
        notes: "Доставить до 18:00",
        created_at: new Date("2024-10-01"),
        updated_at: new Date("2024-10-03"),
        shipped_at: new Date("2024-10-02"),
        delivered_at: new Date("2024-10-03"),
      },
      {
        id: 2,
        user_id: 2,
        order_number: "ORD-2024-002",
        status: "processing",
        total_amount: 1750.0,
        shipping_address: "Санкт-Петербург, Невский проспект, 20",
        payment_method: "online",
        notes: null,
        created_at: new Date("2024-10-12"),
        updated_at: new Date("2024-10-12"),
        shipped_at: null,
        delivered_at: null,
      },
    ]);

    // 8. Позиции заказов
    await queryInterface.bulkInsert("order_items", [
      {
        order_id: 1,
        book_id: 2, // Гроза
        quantity: 1,
        price_per_item: 550.0,
        total_price: 550.0,
        created_at: new Date("2024-10-01"),
        updated_at: new Date("2024-10-01"),
      },
      {
        order_id: 1,
        book_id: 5, // Маленький принц
        quantity: 1,
        price_per_item: 890.0,
        total_price: 890.0,
        created_at: new Date("2024-10-01"),
        updated_at: new Date("2024-10-01"),
      },
      {
        order_id: 2,
        book_id: 4, // Человек-амфибия
        quantity: 1,
        price_per_item: 1750.0,
        total_price: 1750.0,
        created_at: new Date("2024-10-12"),
        updated_at: new Date("2024-10-12"),
      },
    ]);

    // 9. Отзывы
    await queryInterface.bulkInsert("reviews", [
      {
        user_id: 2,
        book_id: 2, // Гроза
        rating: 5,
        title: "Великолепная классика!",
        comment:
          "Островский мастерски показал конфликт поколений. Читается на одном дыхании.",
        is_verified_purchase: true,
        created_at: new Date("2024-10-04"),
        updated_at: new Date("2024-10-04"),
      },
      {
        user_id: 2,
        book_id: 5, // Маленький принц
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
        user_id: 2,
        book_id: 1, // Унесённые ветром
        quantity: 1,
        added_at: new Date(),
      },
      {
        user_id: 2,
        book_id: 3, // Море и звезды
        quantity: 2,
        added_at: new Date(),
      },
    ]);

    // 11. Список желаний
    await queryInterface.bulkInsert("wishlist", [
      {
        user_id: 2,
        book_id: 6, // Великий Гэтсби (закончился на складе)
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
