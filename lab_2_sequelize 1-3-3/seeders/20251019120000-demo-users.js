"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Добавляем демонстрационных пользователей для тестирования аутентификации
     * Пароли соответствуют требованиям безопасности
     */
    await queryInterface.bulkInsert(
      "users",
      [
        {
          username: "admin",
          email: "admin@bookstore.com",
          password:
            "$2a$12$LqF8QmD5DG.GzGQJc0.8aeOl9QEi4l9PZb8wz8kx5.qL7X6V8R9Wa", // AdminPass123
          firstName: "Администратор",
          lastName: "Системы",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "user1",
          email: "user1@example.com",
          password:
            "$2a$12$LqF8QmD5DG.GzGQJc0.8aeOl9QEi4l9PZb8wz8kx5.qL7X6V8R9Wa", // UserPass123
          firstName: "Анна",
          lastName: "Иванова",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "user2",
          email: "user2@example.com",
          password:
            "$2a$12$LqF8QmD5DG.GzGQJc0.8aeOl9QEi4l9PZb8wz8kx5.qL7X6V8R9Wa", // TestPass123
          firstName: "Петр",
          lastName: "Петров",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: "testuser",
          email: "test@bookstore.com",
          password:
            "$2a$12$LqF8QmD5DG.GzGQJc0.8aeOl9QEi4l9PZb8wz8kx5.qL7X6V8R9Wa", // BookTest123
          firstName: "Тестовый",
          lastName: "Пользователь",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Удаляем все тестовые пользователи
     */
    await queryInterface.bulkDelete(
      "users",
      {
        email: {
          [Sequelize.Op.in]: [
            "admin@bookstore.com",
            "user1@example.com",
            "user2@example.com",
            "test@bookstore.com",
          ],
        },
      },
      {}
    );
  },
};
