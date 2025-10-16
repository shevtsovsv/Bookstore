"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Publisher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // One-to-Many: Издательство имеет много книг
      Publisher.hasMany(models.Book, {
        foreignKey: "publisher_id",
        as: "books",
        onDelete: "RESTRICT",
      });
    }

    // Методы экземпляра
    getAge() {
      if (!this.founded_year) return null;
      return new Date().getFullYear() - this.founded_year;
    }

    getContactInfo() {
      return {
        email: this.email,
        phone: this.phone,
        website: this.website,
        address: this.address,
      };
    }

    async getBooksCount() {
      return await this.countBooks();
    }

    async getPopularBooks(limit = 10) {
      return await this.getBooks({
        order: [["popularity", "DESC"]],
        limit: limit,
      });
    }
  }

  Publisher.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: [0, 100],
        },
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true,
        },
      },
      phone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[\+]?[1-9][\d]{0,15}$/i,
        },
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      founded_year: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
          min: 1400,
          max() {
            return new Date().getFullYear();
          },
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
      modelName: "Publisher",
      tableName: "publishers",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
        {
          fields: ["country"],
        },
        {
          fields: ["founded_year"],
        },
      ],
      scopes: {
        byCountry: (country) => ({
          where: {
            country: country,
          },
        }),
        withWebsite: {
          where: {
            website: {
              [sequelize.Sequelize.Op.ne]: null,
            },
          },
        },
        founded: (year) => ({
          where: {
            founded_year: year,
          },
        }),
      },
    }
  );

  return Publisher;
};
