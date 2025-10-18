const { Author, BookAuthor, Book, Publisher, Category } = require('../../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Получение списка авторов с пагинацией
 */
const getAuthors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search.trim()) {
      whereClause = {
        [Op.or]: [
          { first_name: { [Op.iLike]: `%${search}%` } },
          { last_name: { [Op.iLike]: `%${search}%` } },
          { biography: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: authors } = await Author.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['last_name', 'ASC'], ['first_name', 'ASC']],
      include: [
        {
          model: BookAuthor,
          as: 'bookAuthors',
          attributes: ['book_id'],
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title']
            }
          ]
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        authors: authors.map(author => ({
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          fullName: `${author.first_name} ${author.last_name}`.trim(),
          birthDate: author.birth_date,
          deathDate: author.death_date,
          nationality: author.nationality,
          biography: author.biography ? author.biography.substring(0, 200) + (author.biography.length > 200 ? '...' : '') : null,
          booksCount: author.bookAuthors ? author.bookAuthors.length : 0,
          createdAt: author.created_at,
          updatedAt: author.updated_at
        })),
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get authors error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения авторов'
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
          model: BookAuthor,
          as: 'bookAuthors',
          include: [
            {
              model: Book,
              as: 'book',
              attributes: ['id', 'title', 'description', 'price', 'publication_year', 'isbn', 'pages', 'stock', 'image'],
              include: [
                {
                  model: Publisher,
                  as: 'publisher',
                  attributes: ['id', 'name']
                },
                {
                  model: Category,
                  as: 'category',
                  attributes: ['id', 'name']
                }
              ]
            }
          ]
        }
      ]
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Автор не найден'
      });
    }

    // Обрабатываем книги автора
    const books = author.bookAuthors ? author.bookAuthors.map(ba => ({
      id: ba.book.id,
      title: ba.book.title,
      description: ba.book.description,
      price: parseFloat(ba.book.price),
      publicationYear: ba.book.publication_year,
      isbn: ba.book.isbn,
      pages: ba.book.pages,
      stock: ba.book.stock,
      image: ba.book.image,
      publisher: ba.book.publisher ? {
        id: ba.book.publisher.id,
        name: ba.book.publisher.name
      } : null,
      category: ba.book.category ? {
        id: ba.book.category.id,
        name: ba.book.category.name
      } : null
    })) : [];

    res.json({
      success: true,
      data: {
        author: {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          fullName: `${author.first_name} ${author.last_name}`.trim(),
          birthDate: author.birth_date,
          deathDate: author.death_date,
          nationality: author.nationality,
          biography: author.biography,
          createdAt: author.created_at,
          updatedAt: author.updated_at,
          booksCount: books.length,
          books: books.sort((a, b) => b.publicationYear - a.publicationYear) // Сортируем по году издания
        }
      }
    });

  } catch (error) {
    console.error('Get author by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения автора'
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
        message: 'Автор не найден'
      });
    }

    // Получаем книги через связующую таблицу
    const { count, rows: bookAuthors } = await BookAuthor.findAndCountAll({
      where: { author_id: id },
      limit,
      offset,
      include: [
        {
          model: Book,
          as: 'book',
          include: [
            {
              model: Publisher,
              as: 'publisher',
              attributes: ['id', 'name']
            },
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name']
            }
          ]
        }
      ],
      order: [[{model: Book, as: 'book'}, 'publication_year', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit);

    const books = bookAuthors.map(ba => ({
      id: ba.book.id,
      title: ba.book.title,
      description: ba.book.description,
      price: parseFloat(ba.book.price),
      publicationYear: ba.book.publication_year,
      isbn: ba.book.isbn,
      pages: ba.book.pages,
      stock: ba.book.stock,
      image: ba.book.image,
      publisher: ba.book.publisher ? {
        id: ba.book.publisher.id,
        name: ba.book.publisher.name
      } : null,
      category: ba.book.category ? {
        id: ba.book.category.id,
        name: ba.book.category.name
      } : null,
      createdAt: ba.book.created_at
    }));

    res.json({
      success: true,
      data: {
        author: {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          fullName: `${author.first_name} ${author.last_name}`.trim()
        },
        books,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: count,
          itemsPerPage: limit,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get author books error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения книг автора'
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
        message: 'Ошибки валидации',
        errors: errors.array()
      });
    }

    const {
      firstName,
      lastName,
      birthDate,
      deathDate,
      nationality,
      biography
    } = req.body;

    // Проверяем логичность дат
    if (birthDate && deathDate && new Date(birthDate) > new Date(deathDate)) {
      return res.status(400).json({
        success: false,
        message: 'Дата рождения не может быть позже даты смерти'
      });
    }

    // Проверяем уникальность автора (имя + фамилия + дата рождения)
    const whereClause = {
      first_name: firstName.trim(),
      last_name: lastName.trim()
    };
    
    if (birthDate) {
      whereClause.birth_date = birthDate;
    }

    const existingAuthor = await Author.findOne({
      where: whereClause
    });

    if (existingAuthor) {
      return res.status(400).json({
        success: false,
        message: 'Автор с такими данными уже существует'
      });
    }

    const author = await Author.create({
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      birth_date: birthDate || null,
      death_date: deathDate || null,
      nationality: nationality?.trim() || null,
      biography: biography?.trim() || null
    });

    res.status(201).json({
      success: true,
      message: 'Автор успешно создан',
      data: {
        author: {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          fullName: `${author.first_name} ${author.last_name}`.trim(),
          birthDate: author.birth_date,
          deathDate: author.death_date,
          nationality: author.nationality,
          biography: author.biography,
          createdAt: author.created_at
        }
      }
    });

  } catch (error) {
    console.error('Create author error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания автора'
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
        message: 'Ошибки валидации',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const {
      firstName,
      lastName,
      birthDate,
      deathDate,
      nationality,
      biography
    } = req.body;

    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Автор не найден'
      });
    }

    // Проверяем логичность дат
    const newBirthDate = birthDate !== undefined ? birthDate : author.birth_date;
    const newDeathDate = deathDate !== undefined ? deathDate : author.death_date;
    
    if (newBirthDate && newDeathDate && new Date(newBirthDate) > new Date(newDeathDate)) {
      return res.status(400).json({
        success: false,
        message: 'Дата рождения не может быть позже даты смерти'
      });
    }

    // Проверяем уникальность (исключая текущего автора)
    if (firstName || lastName || birthDate !== undefined) {
      const whereClause = {
        first_name: firstName?.trim() || author.first_name,
        last_name: lastName?.trim() || author.last_name,
        id: { [Op.ne]: id }
      };
      
      if (newBirthDate) {
        whereClause.birth_date = newBirthDate;
      }

      const existingAuthor = await Author.findOne({
        where: whereClause
      });

      if (existingAuthor) {
        return res.status(400).json({
          success: false,
          message: 'Автор с такими данными уже существует'
        });
      }
    }

    // Обновляем поля
    await author.update({
      first_name: firstName?.trim() || author.first_name,
      last_name: lastName?.trim() || author.last_name,
      birth_date: birthDate !== undefined ? birthDate : author.birth_date,
      death_date: deathDate !== undefined ? deathDate : author.death_date,
      nationality: nationality?.trim() || author.nationality,
      biography: biography?.trim() || author.biography
    });

    res.json({
      success: true,
      message: 'Автор успешно обновлён',
      data: {
        author: {
          id: author.id,
          firstName: author.first_name,
          lastName: author.last_name,
          fullName: `${author.first_name} ${author.last_name}`.trim(),
          birthDate: author.birth_date,
          deathDate: author.death_date,
          nationality: author.nationality,
          biography: author.biography,
          updatedAt: author.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update author error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления автора'
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
          model: BookAuthor,
          as: 'bookAuthors',
          attributes: ['id']
        }
      ]
    });

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Автор не найден'
      });
    }

    // Проверяем, есть ли связанные книги
    if (author.bookAuthors && author.bookAuthors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить автора. У него есть ${author.bookAuthors.length} связанных книг`
      });
    }

    await author.destroy();

    res.json({
      success: true,
      message: 'Автор успешно удалён'
    });

  } catch (error) {
    console.error('Delete author error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления автора'
    });
  }
};

module.exports = {
  getAuthors,
  getAuthorById,
  getAuthorBooks,
  createAuthor,
  updateAuthor,
  deleteAuthor
};