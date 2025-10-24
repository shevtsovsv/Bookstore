const {
  Author,
  BookAuthor,
  Book,
  Publisher,
  Category,
} = require("../../models");
const { validationResult } = require("express-validator");
const { Op } = require("sequelize");

/**
 * Получение списка авторов с пагинацией
 */
const getAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || "";
    const authorType = req.query.authorType || "";
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search.trim()) {
      whereClause.name = { [Op.iLike]: `%${search}%` };
    }

    if (authorType && ["russian", "foreign"].includes(authorType)) {
      whereClause.authorType = authorType;
    }

    const { count, rows: authors } = await Author.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["name", "ASC"]],
      include: [
        {
          model: Book,
          as: "books",
          attributes: ["id", "title"],
          through: { attributes: [] }, // Исключаем атрибуты связующей таблицы
        },
      ],
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        authors: authors.map((author) => ({
          id: author.id,
          name: author.name,
          bio: author.bio
            ? author.bio.substring(0, 200) +
              (author.bio.length > 200 ? "..." : "")
            : null,
          authorType: author.authorType,
          booksCount: author.books ? author.books.length : 0,
          createdAt: author.createdAt,
          updatedAt: author.updatedAt,
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
    console.error("Get authors error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения авторов",
    });
  }
};

/**
 * Получение автора по ID
 */
const getAuthorById = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await Author.findByPk(id, {
      include: [
        {
          model: Book,
          as: "books",
          through: { attributes: [] },
          include: [
            {
              model: Publisher,
              as: "publisher",
              attributes: ["id", "name"],
            },
            {
              model: Category,
              as: "category",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Обрабатываем книги автора
    const books = author.books
      ? author.books.map((book) => ({
          id: book.id,
          title: book.title,
          description: book.description,
          price: parseFloat(book.price),
          publicationYear: book.publicationYear,
          isbn: book.isbn,
          pages: book.pages,
          stock: book.stock,
          image: book.image,
          publisher: book.publisher
            ? {
                id: book.publisher.id,
                name: book.publisher.name,
              }
            : null,
          category: book.category
            ? {
                id: book.category.id,
                name: book.category.name,
              }
            : null,
        }))
      : [];

    res.json({
      success: true,
      data: {
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          authorType: author.authorType,
          createdAt: author.createdAt,
          updatedAt: author.updatedAt,
          booksCount: books.length,
          books: books.sort((a, b) => b.publicationYear - a.publicationYear), // Сортируем по году издания
        },
      },
    });
  } catch (error) {
    console.error("Get author by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения автора",
    });
  }
};

/**
 * Получение книг автора с пагинацией
 */
const getAuthorBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Проверяем существование автора
    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Получаем книги автора через ассоциацию
    const { count, rows: books } = await Book.findAndCountAll({
      limit,
      offset,
      include: [
        {
          model: Author,
          as: "authors",
          where: { id: id },
          through: { attributes: [] },
          attributes: [],
        },
        {
          model: Publisher,
          as: "publisher",
          attributes: ["id", "name"],
        },
        {
          model: Category,
          as: "category",
          attributes: ["id", "name"],
        },
      ],
      order: [["publicationYear", "DESC"]],
    });

    const totalPages = Math.ceil(count / limit);

    const formattedBooks = books.map((book) => ({
      id: book.id,
      title: book.title,
      description: book.description,
      price: parseFloat(book.price),
      publicationYear: book.publicationYear,
      isbn: book.isbn,
      pages: book.pages,
      stock: book.stock,
      image: book.image,
      publisher: book.publisher
        ? {
            id: book.publisher.id,
            name: book.publisher.name,
          }
        : null,
      category: book.category
        ? {
            id: book.category.id,
            name: book.category.name,
          }
        : null,
      createdAt: book.createdAt,
    }));

    res.json({
      success: true,
      data: {
        author: {
          id: author.id,
          name: author.name,
          authorType: author.authorType,
        },
        books: formattedBooks,
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
    console.error("Get author books error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения книг автора",
    });
  }
};

/**
 * Создание нового автора (только для админов)
 */
const createAuthor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { name, bio, authorType } = req.body;

    // Проверяем уникальность автора по имени
    const existingAuthor = await Author.findOne({
      where: { name: name.trim() },
    });

    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: "Автор с таким именем уже существует",
      });
    }

    const author = await Author.create({
      name: name.trim(),
      bio: bio?.trim() || null,
      authorType: authorType || "russian",
    });

    res.status(201).json({
      success: true,
      message: "Автор успешно создан",
      data: {
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          authorType: author.authorType,
          createdAt: author.createdAt,
        },
      },
    });
  } catch (error) {
    console.error("Create author error:", error);

    // Обработка специфических ошибок Sequelize
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Автор с таким именем уже существует",
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
      message: "Ошибка создания автора",
    });
  }
};

/**
 * Обновление автора (только для админов)
 */
const updateAuthor = async (req, res) => {
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
    const { name, bio, authorType } = req.body;

    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Проверяем уникальность имени (исключая текущего автора)
    if (name && name.trim() !== author.name) {
      const existingAuthor = await Author.findOne({
        where: {
          name: name.trim(),
          id: { [Op.ne]: id },
        },
      });

      if (existingAuthor) {
        return res.status(400).json({
          success: false,
          message: "Автор с таким именем уже существует",
        });
      }
    }

    // Обновляем поля
    await author.update({
      name: name?.trim() || author.name,
      bio: bio !== undefined ? bio?.trim() || null : author.bio,
      authorType: authorType || author.authorType,
    });

    res.json({
      success: true,
      message: "Автор успешно обновлён",
      data: {
        author: {
          id: author.id,
          name: author.name,
          bio: author.bio,
          authorType: author.authorType,
          updatedAt: author.updatedAt,
        },
      },
    });
  } catch (error) {
    console.error("Update author error:", error);

    // Обработка специфических ошибок Sequelize
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).json({
        success: false,
        message: "Автор с таким именем уже существует",
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
      message: "Ошибка обновления автора",
    });
  }
};

/**
 * Удаление автора (только для админов)
 */
const deleteAuthor = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await Author.findByPk(id, {
      include: [
        {
          model: Book,
          as: "books",
          attributes: ["id"],
          through: { attributes: [] },
        },
      ],
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: "Автор не найден",
      });
    }

    // Проверяем, есть ли связанные книги
    if (author.books && author.books.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить автора. У него есть ${author.books.length} связанных книг`,
      });
    }

    await author.destroy();

    res.json({
      success: true,
      message: "Автор успешно удалён",
    });
  } catch (error) {
    console.error("Delete author error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления автора",
    });
  }
};

module.exports = {
  getAuthors,
  getAuthorById,
  getAuthorBooks,
  createAuthor,
  updateAuthor,
  deleteAuthor,
};
