const express = require("express");
const categoriesController = require("../controllers/categoriesController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateCategoryId,
  validateCreateCategory,
  validateUpdateCategory,
  validateCategoriesPagination,
} = require("../middleware/categoriesValidation");

const router = express.Router();

/**
 * @route   GET /api/categories
 * @desc    Получение списка категорий с пагинацией и поиском
 * @access  Public
 * @query   page, limit, search
 */
router.get(
  "/",
  validateCategoriesPagination,
  categoriesController.getCategories
);

/**
 * @route   GET /api/categories/:id
 * @desc    Получение категории по ID с книгами
 * @access  Public
 * @params  id - ID категории
 * @query   page, limit (для книг)
 */
router.get("/:id", validateCategoryId, categoriesController.getCategoryById);

/**
 * @route   GET /api/categories/:id/books
 * @desc    Получение книг категории с пагинацией
 * @access  Public
 * @params  id - ID категории
 * @query   page, limit
 */
router.get(
  "/:id/books",
  [...validateCategoryId, ...validateCategoriesPagination],
  categoriesController.getCategoryBooks
);

/**
 * @route   POST /api/categories
 * @desc    Создание новой категории
 * @access  Private (Admin only)
 * @body    { name, slug, description? }
 */
router.post(
  "/",
  [authenticateToken, requireAdmin, ...validateCreateCategory],
  categoriesController.createCategory
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Обновление категории
 * @access  Private (Admin only)
 * @params  id - ID категории
 * @body    { name?, slug?, description? }
 */
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    ...validateCategoryId,
    ...validateUpdateCategory,
  ],
  categoriesController.updateCategory
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Удаление категории
 * @access  Private (Admin only)
 * @params  id - ID категории
 */
router.delete(
  "/:id",
  [authenticateToken, requireAdmin, ...validateCategoryId],
  categoriesController.deleteCategory
);

module.exports = router;
