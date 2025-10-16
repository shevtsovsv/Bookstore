"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "books",
      [
        {
          title: "Унесённые ветром",
          author: "Маргарет Митчелл",
          genre: "Романтика",
          price: 900.0,
          description:
            "«Унесённые ветром» — роман американской писательницы Маргарет Митчелл, опубликованный в 1936 году. Действие происходит в штате Джорджия во время Гражданской войны в США и в период Реконструкции Юга. В центре повествования — история Скарлетт О'Хара, дочери владельца плантации, и её сложных отношений с Реттом Батлером.",
          short_description: "«Унесённые ветром» — масштабная история...",
          image: "book1.jpg",
          popularity: 85, // Количество покупок
          stock: 15,
          metadata: JSON.stringify({
            categories: ["romance", "foreign", "price-low"],
            priceCategory: "low",
            authorType: "foreign",
            isbn: "978-5-389-12345-1",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: "Гроза",
          author: "Александр Островский",
          genre: "Драма",
          price: 550.0,
          description:
            "«Гроза» — пьеса А. Н. Островского в пяти действиях, написанная в 1859 году. Это одно из самых известных произведений русской драматургии. В центре сюжета — трагическая история Катерины Кабановой, молодой женщины, задыхающейся в атмосфере патриархального купеческого быта.",
          short_description: "«Гроза» — драма о столкновении...",
          image: "book2.jpg",
          popularity: 120, // Самая популярная
          stock: 8,
          metadata: JSON.stringify({
            categories: ["drama", "russian", "price-low"],
            priceCategory: "low",
            authorType: "russian",
            isbn: "978-5-389-12345-2",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: "Море и звезды",
          author: "Алексей Бирюлин",
          genre: "Биография",
          price: 1670.0,
          description:
            "«Море и звезды» — художественно-документальное произведение о великих мореплавателях и исследователях. Автор рассказывает о людях, которые посвятили свою жизнь изучению морских глубин и освоению новых территорий, об их открытиях и подвигах.",
          short_description:
            "«Море и звезды» — исторический роман-биография...",
          image: "book3.jpg",
          popularity: 45,
          stock: 12,
          metadata: JSON.stringify({
            categories: ["bio", "russian", "price-high"],
            priceCategory: "high",
            authorType: "russian",
            isbn: "978-5-389-12345-3",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: "Человек-амфибия",
          author: "Александр Беляев",
          genre: "Фантастика",
          price: 1750.0,
          description:
            "«Человек-амфибия» — научно-фантастический роман Александра Беляева, опубликованный в 1928 году. История об Ихтиандре, молодом человеке с пересаженными жабрами акулы, который может жить как на суше, так и под водой. Роман поднимает вопросы научной этики и человеческих отношений.",
          short_description:
            "«Человек-амфибия» — научно-фантастическая драма...",
          image: "book4.jpg",
          popularity: 95,
          stock: 20,
          metadata: JSON.stringify({
            categories: ["fantasy", "russian", "price-high"],
            priceCategory: "high",
            authorType: "russian",
            isbn: "978-5-389-12345-4",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: "Маленький принц",
          author: "Антуан де Сент-Экзюпери",
          genre: "Фантастика",
          price: 890.0,
          description:
            "«Маленький принц» — наиболее известное произведение Антуана де Сент-Экзюпери. Это философская сказка-притча, в которой главные человеческие ценности представлены в простой и трогательной форме. История о встрече пилота с загадочным мальчиком с другой планеты.",
          short_description: "«Маленький принц» — философская сказка-притча...",
          image: "book5.jpg",
          popularity: 150, // Самая популярная
          stock: 25,
          metadata: JSON.stringify({
            categories: ["fantasy", "foreign", "price-low"],
            priceCategory: "low",
            authorType: "foreign",
            isbn: "978-5-389-12345-5",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          title: "Великий Гэтсби",
          author: "Фрэнсис Скотт Фицджеральд",
          genre: "Драма",
          price: 1200.0,
          description:
            "«Великий Гэтсби» — роман американского писателя Фрэнсиса Скотта Фицджеральда, опубликованный в 1925 году. Считается одним из величайших произведений американской литературы. История рассказывает о загадочном миллионере Джее Гэтсби и его безответной любви к Дэйзи Бьюкенен.",
          short_description: "«Великий Гэтсби» — трагическая история...",
          image: "book6.jpg",
          popularity: 78,
          stock: 0, // Закончились на складе
          metadata: JSON.stringify({
            categories: ["drama", "foreign", "price-high"],
            priceCategory: "high",
            authorType: "foreign",
            isbn: "978-5-389-12345-6",
          }),
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("books", null, {});
  },
};
