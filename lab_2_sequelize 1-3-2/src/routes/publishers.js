const express = require("express");
const router = express.Router();
const publishersController = require("../controllers/publishersController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const {
  validatePublisherId,
  validateCreatePublisher,
  validateUpdatePublisher,
  validatePublishersPagination,
} = require("../middleware/publishersValidation");

/**
 * @route   GET /api/publishers
 * @desc    Получение списка издателей с пагинацией и поиском
 * @access  Public
 * @query   page, limit, search
 */
router.get(
  "/",
  validatePublishersPagination,
  publishersController.getPublishers
);

/**
 * @route   GET /api/publishers/:id
 * @desc    Получение издателя по ID
 * @access  Public
 * @params  id - ID издателя
 */
router.get("/:id", validatePublisherId, publishersController.getPublisherById);

/**
 * @route   GET /api/publishers/:id/books
 * @desc    Получение книг издателя с пагинацией
 * @access  Public
 * @params  id - ID издателя
 * @query   page, limit
 */
router.get(
  "/:id/books",
  validatePublisherId,
  validatePublishersPagination,
  publishersController.getPublisherBooks
);

/**
 * @route   POST /api/publishers
 * @desc    Создание нового издателя
 * @access  Private (Admin only)
 * @body    { name, description?, website?, contact_email?, founded_year?, country? }
 */
router.post(
  "/",
  authenticateToken,
  requireAdmin,
  validateCreatePublisher,
  publishersController.createPublisher
);

/**
 * @route   PUT /api/publishers/:id
 * @desc    Обновление издателя
 * @access  Private (Admin only)
 * @params  id - ID издателя
 * @body    { name?, description?, website?, contact_email?, founded_year?, country? }
 */
router.put(
  "/:id",
  authenticateToken,
  requireAdmin,
  validatePublisherId,
  validateUpdatePublisher,
  publishersController.updatePublisher
);

/**
 * @route   DELETE /api/publishers/:id
 * @desc    Удаление издателя
 * @access  Private (Admin only)
 * @params  id - ID издателя
 */
router.delete(
  "/:id",
  authenticateToken,
  requireAdmin,
  validatePublisherId,
  publishersController.deletePublisher
);

module.exports = router;
