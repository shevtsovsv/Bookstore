const { Publisher, Book } = require('../../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Получение списка издателей с пагинацией
 */
const getPublishers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const offset = (page - 1) * limit;

    let whereClause = {};
    if (search.trim()) {
      whereClause = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ]
      };
    }

    const { count, rows: publishers } = await Publisher.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [['name', 'ASC']],
      include: [
        {
          model: Book,
          as: 'books',
          attributes: ['id'],
          required: false
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        publishers: publishers.map(publisher => ({
          id: publisher.id,
          name: publisher.name,
          description: publisher.description,
          address: publisher.address,
          phone: publisher.phone,
          email: publisher.email,
          website: publisher.website,
          booksCount: publisher.books ? publisher.books.length : 0,
          createdAt: publisher.created_at,
          updatedAt: publisher.updated_at
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
    console.error('Get publishers error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения издателей'
    });
  }
};

/**
 * Получение издателя по ID
 */
const getPublisherById = async (req, res) => {
  try {
    const { id } = req.params;

    const publisher = await Publisher.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'books',
          attributes: ['id', 'title', 'price', 'publication_year', 'isbn', 'stock'],
          limit: 10,
          order: [['created_at', 'DESC']]
        }
      ]
    });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Издатель не найден'
      });
    }

    // Получаем общее количество книг этого издателя
    const booksCount = await Book.count({
      where: { publisher_id: id }
    });

    res.json({
      success: true,
      data: {
        publisher: {
          id: publisher.id,
          name: publisher.name,
          description: publisher.description,
          address: publisher.address,
          phone: publisher.phone,
          email: publisher.email,
          website: publisher.website,
          createdAt: publisher.created_at,
          updatedAt: publisher.updated_at,
          booksCount,
          recentBooks: publisher.books.map(book => ({
            id: book.id,
            title: book.title,
            price: parseFloat(book.price),
            publicationYear: book.publication_year,
            isbn: book.isbn,
            stock: book.stock
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get publisher by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения издателя'
    });
  }
};

/**
 * Получение книг издателя с пагинацией
 */
const getPublisherBooks = async (req, res) => {
  try {
    const { id } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const offset = (page - 1) * limit;

    // Проверяем существование издателя
    const publisher = await Publisher.findByPk(id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Издатель не найден'
      });
    }

    const { count, rows: books } = await Book.findAndCountAll({
      where: { publisher_id: id },
      limit,
      offset,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: require('../../models').Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        publisher: {
          id: publisher.id,
          name: publisher.name
        },
        books: books.map(book => ({
          id: book.id,
          title: book.title,
          description: book.description,
          price: parseFloat(book.price),
          publicationYear: book.publication_year,
          isbn: book.isbn,
          pages: book.pages,
          stock: book.stock,
          image: book.image,
          category: book.category ? {
            id: book.category.id,
            name: book.category.name
          } : null,
          createdAt: book.created_at
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
    console.error('Get publisher books error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения книг издателя'
    });
  }
};

/**
 * Создание нового издателя (только для админов)
 */
const createPublisher = async (req, res) => {
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
      name,
      description,
      address,
      phone,
      email,
      website
    } = req.body;

    // Проверяем уникальность имени
    const existingPublisher = await Publisher.findOne({
      where: { name }
    });

    if (existingPublisher) {
      return res.status(400).json({
        success: false,
        message: 'Издатель с таким названием уже существует'
      });
    }

    // Проверяем уникальность email (если указан)
    if (email) {
      const emailExists = await Publisher.findOne({
        where: { email }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Издатель с таким email уже существует'
        });
      }
    }

    const publisher = await Publisher.create({
      name: name.trim(),
      description: description?.trim(),
      address: address?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      website: website?.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Издатель успешно создан',
      data: {
        publisher: {
          id: publisher.id,
          name: publisher.name,
          description: publisher.description,
          address: publisher.address,
          phone: publisher.phone,
          email: publisher.email,
          website: publisher.website,
          createdAt: publisher.created_at
        }
      }
    });

  } catch (error) {
    console.error('Create publisher error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания издателя'
    });
  }
};

/**
 * Обновление издателя (только для админов)
 */
const updatePublisher = async (req, res) => {
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
      name,
      description,
      address,
      phone,
      email,
      website
    } = req.body;

    const publisher = await Publisher.findByPk(id);
    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Издатель не найден'
      });
    }

    // Проверяем уникальность имени (исключая текущего издателя)
    if (name && name !== publisher.name) {
      const existingPublisher = await Publisher.findOne({
        where: {
          name,
          id: { [Op.ne]: id }
        }
      });

      if (existingPublisher) {
        return res.status(400).json({
          success: false,
          message: 'Издатель с таким названием уже существует'
        });
      }
    }

    // Проверяем уникальность email (исключая текущего издателя)
    if (email && email !== publisher.email) {
      const emailExists = await Publisher.findOne({
        where: {
          email,
          id: { [Op.ne]: id }
        }
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Издатель с таким email уже существует'
        });
      }
    }

    // Обновляем поля
    await publisher.update({
      name: name?.trim() || publisher.name,
      description: description?.trim(),
      address: address?.trim(),
      phone: phone?.trim(),
      email: email?.trim(),
      website: website?.trim()
    });

    res.json({
      success: true,
      message: 'Издатель успешно обновлён',
      data: {
        publisher: {
          id: publisher.id,
          name: publisher.name,
          description: publisher.description,
          address: publisher.address,
          phone: publisher.phone,
          email: publisher.email,
          website: publisher.website,
          updatedAt: publisher.updated_at
        }
      }
    });

  } catch (error) {
    console.error('Update publisher error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка обновления издателя'
    });
  }
};

/**
 * Удаление издателя (только для админов)
 */
const deletePublisher = async (req, res) => {
  try {
    const { id } = req.params;

    const publisher = await Publisher.findByPk(id, {
      include: [
        {
          model: Book,
          as: 'books',
          attributes: ['id']
        }
      ]
    });

    if (!publisher) {
      return res.status(404).json({
        success: false,
        message: 'Издатель не найден'
      });
    }

    // Проверяем, есть ли связанные книги
    if (publisher.books && publisher.books.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Невозможно удалить издателя. У него есть ${publisher.books.length} связанных книг`
      });
    }

    await publisher.destroy();

    res.json({
      success: true,
      message: 'Издатель успешно удалён'
    });

  } catch (error) {
    console.error('Delete publisher error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка удаления издателя'
    });
  }
};

module.exports = {
  getPublishers,
  getPublisherById,
  getPublisherBooks,
  createPublisher,
  updatePublisher,
  deletePublisher
};