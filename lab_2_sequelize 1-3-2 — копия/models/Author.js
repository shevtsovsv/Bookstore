"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Author extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Many-to-Many: Автор может иметь много книг через book_authors
      Author.belongsToMany(models.Book, {
        through: models.BookAuthor,
        foreignKey: "author_id",
        otherKey: "book_id",
        as: "books",
      });

      // One-to-Many: Автор имеет много связей book_authors
      Author.hasMany(models.BookAuthor, {
        foreignKey: "author_id",
        as: "bookAuthors",
        onDelete: "CASCADE",
      });
    }

    // Методы экземпляра
    getFullName() {
      const parts = [this.first_name];
      if (this.middle_name) parts.push(this.middle_name);
      parts.push(this.last_name);
      return parts.join(" ");
    }

    getDisplayName() {
      return `${this.last_name}, ${this.first_name}${
        this.middle_name ? " " + this.middle_name : ""
      }`;
    }

    getAge() {
      if (!this.birth_date) return null;

      const endDate = this.death_date || new Date();
      const birthYear = new Date(this.birth_date).getFullYear();
      const endYear = new Date(endDate).getFullYear();

      return endYear - birthYear;
    }

    isAlive() {
      return !this.death_date;
    }

    async getBooksCount() {
      return await this.countBooks();
    }

    async getBooksByRole(role = "author") {
      return await this.getBooks({
        through: {
          where: { role: role },
        },
      });
    }

    async getPopularBooks(limit = 10) {
      return await this.getBooks({
        order: [["popularity", "DESC"]],
        limit: limit,
      });
    }

    getLifeSpan() {
      if (!this.birth_date) return null;

      const birth = new Date(this.birth_date);
      const death = this.death_date ? new Date(this.death_date) : null;

      const birthStr = birth.getFullYear().toString();
      const deathStr = death ? death.getFullYear().toString() : "н.в.";

      return `${birthStr} - ${deathStr}`;
    }
  }

  Author.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 100],
        },
      },
      middle_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      birth_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString().split("T")[0], // Не может быть в будущем
        },
      },
      death_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
          isBefore: new Date().toISOString().split("T")[0], // Не может быть в будущем
          isAfterBirth(value) {
            if (
              value &&
              this.birth_date &&
              new Date(value) <= new Date(this.birth_date)
            ) {
              throw new Error("Дата смерти должна быть после даты рождения");
            }
          },
        },
      },
      nationality: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      biography: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: "Author",
      tableName: "authors",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          fields: ["last_name", "first_name"],
        },
        {
          fields: ["nationality"],
        },
        {
          fields: ["birth_date"],
        },
        {
          fields: ["death_date"],
        },
      ],
      scopes: {
        alive: {
          where: {
            death_date: null,
          },
        },
        byNationality: (nationality) => ({
          where: {
            nationality: nationality,
          },
        }),
        bornAfter: (year) => ({
          where: {
            birth_date: {
              [sequelize.Sequelize.Op.gte]: `${year}-01-01`,
            },
          },
        }),
        bornBefore: (year) => ({
          where: {
            birth_date: {
              [sequelize.Sequelize.Op.lt]: `${year + 1}-01-01`,
            },
          },
        }),
        classical: {
          where: {
            birth_date: {
              [sequelize.Sequelize.Op.lt]: "1900-01-01",
            },
          },
        },
        contemporary: {
          where: {
            birth_date: {
              [sequelize.Sequelize.Op.gte]: "1900-01-01",
            },
          },
        },
      },
    }
  );

  return Author;
};
