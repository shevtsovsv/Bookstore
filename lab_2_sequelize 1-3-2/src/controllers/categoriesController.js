const { Category, Book, Author, Publisher } = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение всех категорий
 */
const getCategories = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search.trim()) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["name", "ASC"]],
      include: [
        {
          model: Book,
          as: "books",
          attributes: ["id"],
          required: false,
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        categories: categories.map((category) => ({
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          booksCount: category.books ? category.books.length : 0,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения категорий",
    });
  }
};

/**
 * Получение категории по ID с книгами
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Получаем книги этой категории с пагинацией
    const { count, rows: books } = await Book.findAndCountAll({
      where: { categoryId: id },
      limit,
      offset,
      order: [["title", "ASC"]],
      include: [
        {
          model: Author,
          as: "authors",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
        {
          model: Publisher,
          as: "publisher",
          attributes: ["id", "name"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt,
          updatedAt: category.updatedAt,
        },
        books: books.map((book) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          price: parseFloat(book.price),
          isbn: book.isbn,
          pages: book.pages,
          stock: book.stock,
          image: book.image,
          publicationYear: book.publicationYear,
          authors: book.authors,
          publisher: book.publisher,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get category error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения категории",
    });
  }
};

/**
 * Получение книг категории с пагинацией
 */
const getCategoryBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Проверяем существование категории
    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Получаем книги категории с пагинацией
    const { count, rows: books } = await Book.findAndCountAll({
      where: { categoryId: id },
      limit,
      offset,
      order: [["title", "ASC"]],
      include: [
        {
          model: Author,
          as: "authors",
          through: { attributes: [] },
          attributes: ["id", "name"],
        },
        {
          model: Publisher,
          as: "publisher",
          attributes: ["id", "name"],
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
        },
        books: books.map((book) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          price: parseFloat(book.price),
          isbn: book.isbn,
          pages: book.pages,
          stock: book.stock,
          image: book.image,
          publicationYear: book.publicationYear,
          authors: book.authors,
          publisher: book.publisher,
          createdAt: book.createdAt,
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Get category books error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книг категории",
    });
  }
};

/**
 * Создание новой категории (только для администраторов)
 */
const createCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { name, slug, description } = req.body;

    // Проверка уникальности имени и slug
    const existingCategory = await Category.findOne({
      where: {
        [Op.or]: [{ name: name.trim() }, { slug: slug.trim() }],
      },
    });

    if (existingCategory) {
      const conflictField =
        existingCategory.name === name.trim() ? "именем" : "slug";
      return res.status(400).json({
        success: false,
        message: `Категория с таким ${conflictField} уже существует`,
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
    });

    res.status(201).json({
      success: true,
      message: "Категория успешно создана",
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          createdAt: category.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create category error:", error);

    // Обработка специфических ошибок Sequelize
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Категория с таким именем или slug уже существует",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка создания категории",
    });
  }
};

/**
 * Обновление категории (только для администраторов)
 */
const updateCategory = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const { name, slug, description } = req.body;

    const category = await Category.findByPk(id);
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Проверяем уникальность (исключая текущую категорию)
    if (name || slug) {
      const whereClause = {
        id: { [Op.ne]: id },
      };

      if (name && slug) {
        whereClause[Op.or] = [{ name: name.trim() }, { slug: slug.trim() }];
      } else if (name) {
        whereClause.name = name.trim();
      } else if (slug) {
        whereClause.slug = slug.trim();
      }

      const existingCategory = await Category.findOne({ where: whereClause });
      if (existingCategory) {
        const conflictField =
          existingCategory.name === name?.trim() ? "именем" : "slug";
        return res.status(400).json({
          success: false,
          message: `Категория с таким ${conflictField} уже существует`,
        });
      }
    }

    // Обновляем поля
    await category.update({
      name: name?.trim() || category.name,
      slug: slug?.trim() || category.slug,
      description:
        description !== undefined
          ? description?.trim() || null
          : category.description,
    });

    res.json({
      success: true,
      message: "Категория успешно обновлена",
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          updatedAt: category.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update category error:", error);

    // Обработка специфических ошибок Sequelize
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Категория с таким именем или slug уже существует",
      });
    }

    if (error.name === "SequelizeValidationError") {
      return res.status(400).json({
        success: false,
        message: "Ошибка валидации данных",
        errors: error.errors.map((err) => err.message),
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка обновления категории",
    });
  }
};

/**
 * Удаление категории (только для администраторов)
 */
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Book,
          as: "books",
          attributes: ["id"],
        },
      ],
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Категория не найдена",
      });
    }

    // Проверяем, есть ли связанные книги
    if (category.books && category.books.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить категорию. У неё есть ${category.books.length} связанных книг`,
      });
    }

    await category.destroy();

    res.json({
      success: true,
      message: "Категория успешно удалена",
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления категории",
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  getCategoryBooks,
  createCategory,
  updateCategory,
  deleteCategory,
};
