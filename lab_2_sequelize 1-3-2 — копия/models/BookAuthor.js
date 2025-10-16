"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BookAuthor extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-One: Связь принадлежит книге
      BookAuthor.belongsTo(models.Book, {
        foreignKey: "book_id",
        as: "book",
        onDelete: "CASCADE",
      });

      // Many-to-One: Связь принадлежит автору
      BookAuthor.belongsTo(models.Author, {
        foreignKey: "author_id",
        as: "author",
        onDelete: "CASCADE",
      });
    }

    // Методы экземпляра
    isMainAuthor() {
      return this.role === "author";
    }

    isCoAuthor() {
      return this.role === "co-author";
    }

    isTranslator() {
      return this.role === "translator";
    }

    isEditor() {
      return this.role === "editor";
    }

    getRoleDisplayName() {
      const roles = {
        author: "Автор",
        "co-author": "Соавтор",
        translator: "Переводчик",
        editor: "Редактор",
      };
      return roles[this.role] || this.role;
    }
  }

  BookAuthor.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      book_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "books",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      author_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "authors",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      role: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "author",
        validate: {
          isIn: [["author", "co-author", "translator", "editor"]],
        },
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "BookAuthor",
      tableName: "book_authors",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["book_id", "author_id", "role"],
        },
        {
          fields: ["book_id"],
        },
        {
          fields: ["author_id"],
        },
        {
          fields: ["role"],
        },
      ],
      scopes: {
        authors: {
          where: {
            role: "author",
          },
        },
        coAuthors: {
          where: {
            role: "co-author",
          },
        },
        translators: {
          where: {
            role: "translator",
          },
        },
        editors: {
          where: {
            role: "editor",
          },
        },
        byRole: (role) => ({
          where: {
            role: role,
          },
        }),
      },
    }
  );

  return BookAuthor;
};
