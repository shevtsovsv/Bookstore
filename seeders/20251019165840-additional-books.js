"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "books",
      [
        // Больше романтических книг
        {
          id: 7,
          title: "Гордость и предубеждение",
          categoryId: 1, // Романтика
          publisherId: 2, // Эксмо
          price: 750,
          priceCategory: "low",
          image: "book7.jpg", // Используем существующие изображения
          shortDescription:
            "Классический роман Джейн Остин о любви и предрассудках викторианской эпохи.",
          fullDescription:
            "Роман о Элизабет Беннет и мистере Дарси, их преодолении первых впечатлений и социальных барьеров ради истинной любви.",
          stock: 18,
          popularity: 245,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 8,
          title: "Джейн Эйр",
          categoryId: 1, // Романтика
          publisherId: 3, // АСТ
          price: 820,
          priceCategory: "low",
          image: "book8.jpg",
          shortDescription:
            "История сироты, ставшей гувернанткой и нашедшей любовь в мрачном поместье.",
          fullDescription:
            "Роман Шарлотты Бронте о независимой и сильной духом женщине, которая несмотря на все препятствия находит свое счастье.",
          stock: 14,
          popularity: 189,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 9,
          title: "Анна Каренина",
          categoryId: 1, // Романтика/Драма
          publisherId: 1, // Питер
          price: 1100,
          priceCategory: "high",
          image: "book9.jpg",
          shortDescription:
            "Величественный роман Толстого о любви, страсти и трагедии.",
          fullDescription:
            "История Анны Карениной, разрывающейся между долгом и страстью, на фоне жизни русского дворянства XIX века.",
          stock: 22,
          popularity: 287,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Больше драматических произведений
        {
          id: 10,
          title: "Преступление и наказание",
          categoryId: 2, // Драма
          publisherId: 2, // Эксмо
          price: 980,
          priceCategory: "low",
          image: "book10.jpg",
          shortDescription:
            "Психологический роман Достоевского о преступлении и муках совести.",
          fullDescription:
            "История студента Раскольникова, совершившего убийство и переживающего нравственные терзания.",
          stock: 16,
          popularity: 198,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 11,
          title: "Мастер и Маргарита",
          categoryId: 2, // Драма
          publisherId: 3, // АСТ
          price: 890,
          priceCategory: "low",
          image: "book11.jpg",
          shortDescription:
            "Мистическая сатира Булгакова о добре и зле, любви и творчестве.",
          fullDescription:
            "Роман о визите дьявола в советскую Москву и истории Понтия Пилата и Иешуа Га-Ноцри.",
          stock: 19,
          popularity: 324,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 12,
          title: "Братья Карамазовы",
          categoryId: 2, // Драма
          publisherId: 1, // Питер
          price: 1250,
          priceCategory: "high",
          image: "book12.jpg",
          shortDescription:
            "Философский роман Достоевского о семье, вере и человеческой природе.",
          fullDescription:
            "Последний роман Достоевского, рассматривающий основные вопросы человеческого существования через историю семьи Карамазовых.",
          stock: 11,
          popularity: 156,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Больше фантастики
        {
          id: 13,
          title: "1984",
          categoryId: 4, // Фантастика
          publisherId: 2, // Эксмо
          price: 690,
          priceCategory: "low",
          image: "book13.jpg",
          shortDescription:
            "Антиутопия Оруэлла о тотальном контроле и потере свободы.",
          fullDescription:
            "Роман о мрачном будущем, где государство контролирует каждый аспект жизни человека.",
          stock: 25,
          popularity: 278,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 14,
          title: "Дюна",
          categoryId: 4, // Фантастика
          publisherId: 3, // АСТ
          price: 1400,
          priceCategory: "high",
          image: "book14.jpg",
          shortDescription:
            "Космическая эпопея Фрэнка Херберта о пустынной планете и ее тайнах.",
          fullDescription:
            "История молодого дворянина Пола Атрейдеса на опасной планете Арракис, единственном источнике драгоценной пряности.",
          stock: 8,
          popularity: 167,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 15,
          title: "Война миров",
          categoryId: 4, // Фантастика
          publisherId: 1, // Питер
          price: 550,
          priceCategory: "low",
          image: "book15.jpg",
          shortDescription:
            "Классическая научная фантастика Г. Уэллса о вторжении марсиан.",
          fullDescription:
            "Один из первых романов о вторжении инопланетян, повествующий о борьбе человечества за выживание.",
          stock: 30,
          popularity: 145,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 16,
          title: "Солярис",
          categoryId: 4, // Фантастика
          publisherId: 2, // Эксмо
          price: 780,
          priceCategory: "low",
          image: "book16.jpg",
          shortDescription:
            "Философская фантастика Станислава Лема о контакте с чужим разумом.",
          fullDescription:
            "История психолога Криса Кельвина на загадочной планете-океане, способной материализовать человеческие воспоминания.",
          stock: 13,
          popularity: 134,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Биографические произведения
        {
          id: 17,
          title: "Стив Джобс",
          categoryId: 3, // Биография
          publisherId: 1, // Питер
          price: 1650,
          priceCategory: "high",
          image: "book17.jpg",
          shortDescription:
            "Официальная биография легендарного основателя Apple.",
          fullDescription:
            "Уолтер Айзексон рассказывает о жизни и карьере Стива Джобса на основе эксклюзивных интервью.",
          stock: 7,
          popularity: 89,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 18,
          title: "Илон Маск",
          categoryId: 3, // Биография
          publisherId: 3, // АСТ
          price: 1590,
          priceCategory: "high",
          image: "book18.jpg",
          shortDescription:
            "Биография визионера, изменившего мир технологий и космоса.",
          fullDescription:
            "История жизни и достижений Илона Маска - от PayPal до SpaceX и Tesla.",
          stock: 9,
          popularity: 112,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 19,
          title: "Леонардо да Винчи",
          categoryId: 3, // Биография
          publisherId: 2, // Эксмо
          price: 1780,
          priceCategory: "high",
          image: "book19.jpg",
          shortDescription:
            "Биография гения Возрождения - художника, изобретателя, ученого.",
          fullDescription:
            "Уолтер Айзексон исследует жизнь и творчество Леонардо да Винчи, раскрывая секреты его гениальности.",
          stock: 6,
          popularity: 67,
          createdAt: new Date(),
          updatedAt: new Date(),
        },

        // Еще несколько книг для разнообразия
        {
          id: 20,
          title: "Властелин колец",
          categoryId: 4, // Фантастика
          publisherId: 3, // АСТ
          price: 2100,
          priceCategory: "high",
          image: "book20.jpg",
          shortDescription:
            "Эпическая фэнтези-сага Толкина о борьбе добра со злом.",
          fullDescription:
            "Трилогия о хоббите Фродо и его путешествии для уничтожения Кольца Всевластия в Средиземье.",
          stock: 12,
          popularity: 398,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 21,
          title: "Граф Монте-Кристо",
          categoryId: 2, // Драма
          publisherId: 1, // Питер
          price: 1350,
          priceCategory: "high",
          image: "book21.jpg",
          shortDescription:
            "Классический роман Дюма о мести, любви и справедливости.",
          fullDescription:
            "История Эдмона Дантеса, несправедливо осужденного и отомстившего своим обидчикам.",
          stock: 15,
          popularity: 223,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 22,
          title: "Три мушкетера",
          categoryId: 2, // Драма/Приключения
          publisherId: 2, // Эксмо
          price: 920,
          priceCategory: "low",
          image: "book22.jpg",
          shortDescription:
            "Приключенческий роман о дружбе, чести и подвигах мушкетеров.",
          fullDescription:
            "История Д`Артаньяна и его друзей Атоса, Портоса и Арамиса в королевской Франции XVII века.",
          stock: 21,
          popularity: 267,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 23,
          title: "Война и мир",
          categoryId: 2, // Драма
          publisherId: 3, // АСТ
          price: 1890,
          priceCategory: "high",
          image: "book23.jpg",
          shortDescription:
            "Великая эпопея Толстого о России в эпоху наполеоновских войн.",
          fullDescription:
            "Масштабное произведение о судьбах людей на фоне исторических событий начала XIX века.",
          stock: 8,
          popularity: 345,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 24,
          title: "Отцы и дети",
          categoryId: 2, // Драма
          publisherId: 1, // Питер
          price: 650,
          priceCategory: "low",
          image: "book24.jpg",
          shortDescription:
            "Роман Тургенева о конфликте поколений в русском обществе.",
          fullDescription:
            "История о противостоянии либералов-дворян и революционеров-разночинцев в России XIX века.",
          stock: 26,
          popularity: 156,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 25,
          title: "Ромео и Джульетта",
          categoryId: 1, // Романтика
          publisherId: 2, // Эксмо
          price: 490,
          priceCategory: "low",
          image: "book25.jpg",
          shortDescription: "Бессмертная трагедия Шекспира о любви и вражде.",
          fullDescription:
            "История юных влюбленных из враждующих семей Вероны, ставшая символом истинной любви.",
          stock: 32,
          popularity: 289,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete(
      "books",
      {
        id: {
          [Sequelize.Op.in]: [
            7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24,
            25,
          ],
        },
      },
      {}
    );
  },
};
