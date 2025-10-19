const { CartItem, Book, User } = require("../../models");
const { validationResult } = require("express-validator");
const { sequelize } = require("../../models");

/**
 * Получение корзины текущего пользователя
 */
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await CartItem.findAll({
      where: { userId: userId },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "price", "stock", "image"],
          include: [
            {
              model: require("../../models").Publisher,
              as: "publisher",
              attributes: ["name"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    // Подсчёт общей стоимости
    const totalAmount = cartItems.reduce((sum, item) => {
      return sum + parseFloat(item.book.price) * item.quantity;
    }, 0);

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: {
        items: cartItems.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          addedAt: item.createdAt,
          book: {
            id: item.book.id,
            title: item.book.title,
            price: parseFloat(item.book.price),
            stock: item.book.stock,
            image: item.book.image,
            publisher: item.book.publisher?.name,
            totalPrice: parseFloat(item.book.price) * item.quantity,
          },
        })),
        summary: {
          totalItems,
          totalAmount: parseFloat(totalAmount.toFixed(2)),
          itemCount: cartItems.length,
        },
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка получения корзины",
    });
  }
};

/**
 * Добавление книги в корзину
 */
const addToCart = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Ошибки валидации",
        errors: errors.array(),
      });
    }

    const { bookId, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Проверяем существование книги и её наличие
    const book = await Book.findByPk(bookId);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Книга не найдена",
      });
    }

    if (book.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Доступно: ${book.stock}`,
      });
    }

    // Используем транзакцию для атомарности операции
    const result = await sequelize.transaction(async (t) => {
      // Проверяем, есть ли уже эта книга в корзине
      let cartItem = await CartItem.findOne({
        where: {
          userId: userId,
          bookId: bookId,
        },
        transaction: t,
      });

      if (cartItem) {
        // Увеличиваем количество
        const newQuantity = cartItem.quantity + quantity;

        if (newQuantity > book.stock) {
          throw new Error(
            `Недостаточно товара на складе. Доступно: ${book.stock}, в корзине: ${cartItem.quantity}`
          );
        }

        cartItem.quantity = newQuantity;
        await cartItem.save({ transaction: t });
      } else {
        // Создаём новую позицию в корзине
        cartItem = await CartItem.create(
          {
            userId: userId,
            bookId: bookId,
            quantity,
          },
          { transaction: t }
        );
      }

      // Загружаем данные с книгой для ответа
      return await CartItem.findByPk(cartItem.id, {
        include: [
          {
            model: Book,
            as: "book",
            attributes: ["id", "title", "price", "stock"],
          },
        ],
        transaction: t,
      });
    });

    res.json({
      success: true,
      message: "Товар добавлен в корзину",
      data: {
        cartItem: {
          id: result.id,
          quantity: result.quantity,
          book: {
            id: result.book.id,
            title: result.book.title,
            price: parseFloat(result.book.price),
            totalPrice: parseFloat(result.book.price) * result.quantity,
          },
        },
      },
    });
  } catch (error) {
    console.error("Add to cart error:", error);

    if (error.message.includes("Недостаточно товара")) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    res.status(500).json({
      success: false,
      message: "Ошибка добавления в корзину",
    });
  }
};

/**
 * Обновление количества товара в корзине
 */
const updateCartItem = async (req, res) => {
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
    const { quantity } = req.body;
    const userId = req.user.id;

    const cartItem = await CartItem.findOne({
      where: {
        id,
        userId: userId,
      },
      include: [
        {
          model: Book,
          as: "book",
          attributes: ["id", "title", "price", "stock"],
        },
      ],
    });

    if (!cartItem) {
      return res.status(404).json({
        success: false,
        message: "Позиция в корзине не найдена",
      });
    }

    if (quantity > cartItem.book.stock) {
      return res.status(400).json({
        success: false,
        message: `Недостаточно товара на складе. Доступно: ${cartItem.book.stock}`,
      });
    }

    cartItem.quantity = quantity;
    await cartItem.save();

    res.json({
      success: true,
      message: "Количество обновлено",
      data: {
        cartItem: {
          id: cartItem.id,
          quantity: cartItem.quantity,
          book: {
            id: cartItem.book.id,
            title: cartItem.book.title,
            price: parseFloat(cartItem.book.price),
            totalPrice: parseFloat(cartItem.book.price) * cartItem.quantity,
          },
        },
      },
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка обновления корзины",
    });
  }
};

/**
 * Удаление товара из корзины
 */
const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = await CartItem.destroy({
      where: {
        id,
        userId: userId,
      },
    });

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Позиция в корзине не найдена",
      });
    }

    res.json({
      success: true,
      message: "Товар удалён из корзины",
    });
  } catch (error) {
    console.error("Remove from cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка удаления из корзины",
    });
  }
};

/**
 * Очистка корзины
 */
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    await CartItem.destroy({
      where: { userId: userId },
    });

    res.json({
      success: true,
      message: "Корзина очищена",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    res.status(500).json({
      success: false,
      message: "Ошибка очистки корзины",
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
};
