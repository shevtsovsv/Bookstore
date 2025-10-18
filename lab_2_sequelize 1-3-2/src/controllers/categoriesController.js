const { Category, Book } = require('../../models');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

/**
 * Получение всех категорий с иерархией
 */
const getCategories = async (req, res) => {
  try {
    const { includeInactive = false } = req.query;

    const whereConditions = {};
    
    // Показывать только активные категории по умолчанию
    if (!includeInactive || includeInactive === 'false') {
      whereConditions.is_active = true;
    }

    const categories = await Category.findAll({
      where: whereConditions,
      include: [
        {
          model: Category,
          as: 'children',
          where: includeInactive ? {} : { is_active: true },
          required: false,
          attributes: ['id', 'name', 'slug', 'description', 'sort_order']
        },
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [
        ['sort_order', 'ASC'],
        ['name', 'ASC'],
        [{ model: Category, as: 'children' }, 'sort_order', 'ASC']
      ]
    });

    // Группируем по родительским категориям
    const rootCategories = categories.filter(cat => !cat.parent_id);
    
    res.json({
      success: true,
      data: {
        categories: rootCategories,
        total: categories.length
      }
    });

  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения категорий'
    });
  }
};

/**
 * Получение категории по ID с книгами
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const category = await Category.findByPk(id, {
      include: [
        {
          model: Category,
          as: 'parent',
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Category,
          as: 'children',
          attributes: ['id', 'name', 'slug', 'description']
        }
      ]
    });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Категория не найдена'
      });
    }

    // Получаем книги этой категории с пагинацией
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const { count, rows: books } = await Book.findAndCountAll({
      where: {
        category_id: id,
        stock: { [Op.gt]: 0 }
      },
      order: [['popularity', 'DESC']],
      limit: limitNum,
      offset: offset
    });

    res.json({
      success: true,
      data: {
        category: {
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
          parent: category.parent,
          children: category.children
        },
        books: {
          items: books,
          pagination: {
            page: pageNum,
            limit: limitNum,
            total: count,
            totalPages: Math.ceil(count / limitNum)
          }
        }
      }
    });

  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка получения категории'
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
        message: 'Ошибки валидации',
        errors: errors.array()
      });
    }

    const { name, slug, description, parent_id, sort_order } = req.body;

    // Проверка уникальности slug
    const existingCategory = await Category.findOne({ where: { slug } });
    if (existingCategory) {
      return res.status(409).json({
        success: false,
        message: 'Категория с таким slug уже существует'
      });
    }

    const category = await Category.create({
      name,
      slug,
      description,
      parent_id: parent_id || null,
      sort_order: sort_order || 0,
      is_active: true
    });

    res.status(201).json({
      success: true,
      message: 'Категория создана',
      data: { category }
    });

  } catch (error) {
    console.error('Create category error:', error);
    res.status(500).json({
      success: false,
      message: 'Ошибка создания категории'
    });
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory
};