"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Category extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // Self-referencing: Категория может иметь родительскую категорию
      Category.belongsTo(models.Category, {
        foreignKey: "parent_id",
        as: "parent",
        onDelete: "SET NULL",
      });

      // Self-referencing: Категория может иметь много дочерних категорий
      Category.hasMany(models.Category, {
        foreignKey: "parent_id",
        as: "children",
        onDelete: "SET NULL",
      });

      // One-to-Many: Категория имеет много книг
      Category.hasMany(models.Book, {
        foreignKey: "category_id",
        as: "books",
        onDelete: "RESTRICT",
      });
    }

    // Методы экземпляра
    async getAncestors() {
      // Получить всех предков категории
      const ancestors = [];
      let current = this;

      while (current.parent_id) {
        const parent = await Category.findByPk(current.parent_id);
        if (parent) {
          ancestors.unshift(parent);
          current = parent;
        } else {
          break;
        }
      }

      return ancestors;
    }

    async getDescendants() {
      // Получить всех потомков категории (рекурсивно)
      const descendants = [];
      const children = await this.getChildren();

      for (const child of children) {
        descendants.push(child);
        const childDescendants = await child.getDescendants();
        descendants.push(...childDescendants);
      }

      return descendants;
    }

    getFullPath() {
      // Получить полный путь категории (например: "Художественная / Романы / Классика")
      // Примечание: для полной реализации нужна рекурсивная загрузка родителей
      return this.name;
    }
  }

  Category.init(
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
      slug: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          is: /^[a-z0-9-]+$/i, // Slug может содержать буквы, цифры и дефисы
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      parent_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: "categories",
          key: "id",
        },
        onDelete: "SET NULL",
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      sort_order: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          min: 0,
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
      modelName: "Category",
      tableName: "categories",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      indexes: [
        {
          unique: true,
          fields: ["name"],
        },
        {
          unique: true,
          fields: ["slug"],
        },
        {
          fields: ["parent_id"],
        },
        {
          fields: ["is_active", "sort_order"],
        },
      ],
      scopes: {
        active: {
          where: {
            is_active: true,
          },
        },
        roots: {
          where: {
            parent_id: null,
          },
        },
        ordered: {
          order: [
            ["sort_order", "ASC"],
            ["name", "ASC"],
          ],
        },
      },
    }
  );

  return Category;
};
