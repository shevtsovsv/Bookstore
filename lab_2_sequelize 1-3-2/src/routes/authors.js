const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/authorsController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validateAuthorId,
  validateCreateAuthor,
  validateUpdateAuthor,
  validateAuthorsPagination,
} = require("../middleware/authorsValidation");

/**
 * @route   GET /api/authors
 * @desc    Получение списка авторов с пагинацией и поиском
 * @access  Public
 * @query   page, limit, search, authorType
 */
router.get("/", validateAuthorsPagination, authorsController.getAuthors);

/**
 * @route   GET /api/authors/:id
 * @desc    Получение автора по ID
 * @access  Public
 * @params  id - ID автора
 */
router.get("/:id", validateAuthorId, authorsController.getAuthorById);

/**
 * @route   GET /api/authors/:id/books
 * @desc    Получение книг автора с пагинацией
 * @access  Public
 * @params  id - ID автора
 * @query   page, limit
 */
router.get(
  "/:id/books",
  [...validateAuthorId, ...validateAuthorsPagination],
  authorsController.getAuthorBooks
);

/**
 * @route   POST /api/authors
 * @desc    Создание нового автора
 * @access  Private (Admin only)
 * @body    { name, bio?, authorType? }
 */
router.post(
  "/",
  [authenticateToken, requireAdmin, ...validateCreateAuthor],
  authorsController.createAuthor
);

/**
 * @route   PUT /api/authors/:id
 * @desc    Обновление автора
 * @access  Private (Admin only)
 * @params  id - ID автора
 * @body    { name?, bio?, authorType? }
 */
router.put(
  "/:id",
  [
    authenticateToken,
    requireAdmin,
    ...validateAuthorId,
    ...validateUpdateAuthor,
  ],
  authorsController.updateAuthor
);

/**
 * @route   DELETE /api/authors/:id
 * @desc    Удаление автора
 * @access  Private (Admin only)
 * @params  id - ID автора
 */
router.delete(
  "/:id",
  [authenticateToken, requireAdmin, ...validateAuthorId],
  authorsController.deleteAuthor
);

module.exports = router;
