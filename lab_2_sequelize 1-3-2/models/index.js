"use strict";

const fs = require("fs");
const path = require("path");
const Sequelize = require("sequelize");
const process = require("process");
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || "development";
const config = require(__dirname + "/../config/config.json")[env];
const db = {};

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  );
}

// Подключаем все модели напрямую
const User = require("./User")(sequelize, Sequelize.DataTypes);
const Category = require("./Category")(sequelize, Sequelize.DataTypes);
const Publisher = require("./Publisher")(sequelize, Sequelize.DataTypes);
const Author = require("./Author")(sequelize, Sequelize.DataTypes);
const Book = require("./Book")(sequelize, Sequelize.DataTypes);
const BookAuthor = require("./BookAuthor")(sequelize, Sequelize.DataTypes);
const CartItem = require("./CartItem")(sequelize, Sequelize.DataTypes);

// Добавляем модели в объект db
db.User = User;
db.Category = Category;
db.Publisher = Publisher;
db.Author = Author;
db.Book = Book;
db.BookAuthor = BookAuthor;
db.CartItem = CartItem;

// Инициализация ассоциаций
Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

// Добавляем sequelize и Sequelize в объект db для экспорта
db.sequelize = sequelize;
db.Sequelize = Sequelize;

// Экспорт операторов Sequelize для использования в контроллерах
db.Op = Sequelize.Op;

module.exports = db;
