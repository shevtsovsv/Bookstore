const { Model, DataTypes } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize) => {
  class User extends Model {
    /**
     * Проверка пароля пользователя
     * @param {string} password - пароль для проверки
     * @returns {Promise<boolean>}
     */
    async checkPassword(password) {
      return await bcrypt.compare(password, this.password_hash);
    }

    /**
     * Добавить заказ в историю пользователя
     * @param {Object} orderData - данные заказа
     * @returns {Promise<void>}
     */
    async addOrder(orderData) {
      const order = {
        order_id: require("crypto").randomUUID(),
        book_id: orderData.book_id,
        title: orderData.title,
        quantity: orderData.quantity,
        price: parseFloat(orderData.price),
        total: parseFloat(orderData.total),
        date: new Date().toISOString(),
      };

      const currentOrders = this.orders_history || [];
      currentOrders.push(order);

      this.orders_history = currentOrders;
      await this.save();
    }

    /**
     * Получить общую сумму покупок пользователя
     * @returns {number}
     */
    getTotalSpent() {
      if (!this.orders_history || !Array.isArray(this.orders_history)) {
        return 0;
      }

      return this.orders_history.reduce((sum, order) => {
        return sum + (parseFloat(order.total) || 0);
      }, 0);
    }

    /**
     * Получить количество покупок пользователя
     * @returns {number}
     */
    getOrdersCount() {
      return this.orders_history ? this.orders_history.length : 0;
    }

    static associate(models) {
      // Если нужны ассоциации, они будут добавлены здесь
      // В нашем случае связи через JSONB, поэтому ассоциации не нужны
    }
  }

  User.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: {
          name: "users_email_unique",
          msg: "Пользователь с таким email уже существует",
        },
        validate: {
          isEmail: {
            msg: "Некорректный формат email",
          },
          len: {
            args: [5, 255],
            msg: "Email должен содержать от 5 до 255 символов",
          },
        },
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      first_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [1, 100],
            msg: "Имя должно содержать от 1 до 100 символов",
          },
        },
      },
      last_name: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          len: {
            args: [1, 100],
            msg: "Фамилия должна содержать от 1 до 100 символов",
          },
        },
      },
      orders_history: {
        type: DataTypes.JSONB,
        allowNull: false,
        defaultValue: [],
        validate: {
          isValidOrdersHistory(value) {
            if (!Array.isArray(value)) {
              throw new Error("История заказов должна быть массивом");
            }

            // Проверяем структуру каждого заказа
            for (const order of value) {
              if (
                !order.order_id ||
                !order.book_id ||
                !order.title ||
                typeof order.quantity !== "number" ||
                typeof order.price !== "number" ||
                typeof order.total !== "number" ||
                !order.date
              ) {
                throw new Error("Неверная структура заказа в истории");
              }
            }
          },
        },
      },
      created_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      updated_at: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      hooks: {
        /**
         * Хеширование пароля перед созданием пользователя
         */
        beforeCreate: async (user) => {
          if (user.dataValues.password) {
            const saltRounds = 12;
            user.password_hash = await bcrypt.hash(
              user.dataValues.password,
              saltRounds
            );
            // Удаляем plain password из dataValues
            delete user.dataValues.password;
          }
        },

        /**
         * Хеширование пароля перед обновлением пользователя
         */
        beforeUpdate: async (user) => {
          if (user.changed("password") && user.dataValues.password) {
            const saltRounds = 12;
            user.password_hash = await bcrypt.hash(
              user.dataValues.password,
              saltRounds
            );
            // Удаляем plain password из dataValues
            delete user.dataValues.password;
          }
        },
      },
      indexes: [
        {
          unique: true,
          fields: ["email"],
          name: "users_email_unique_idx",
        },
        {
          fields: ["created_at"],
          name: "users_created_at_idx",
        },
      ],
    }
  );

  /**
   * Создать нового пользователя с валидацией пароля
   * @param {Object} userData - данные пользователя
   * @returns {Promise<User>}
   */
  User.createUser = async function (userData) {
    const { email, password, first_name, last_name } = userData;

    // Валидация пароля (замечание преподавателя 3)
    if (!password || password.length < 8) {
      throw new Error("Пароль должен содержать минимум 8 символов");
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      throw new Error(
        "Пароль должен содержать заглавные, строчные буквы и цифры"
      );
    }

    // Хешируем пароль перед созданием
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    return await User.create({
      email,
      password_hash,
      first_name,
      last_name,
      orders_history: [],
    });
  };

  /**
   * Найти пользователя по email
   * @param {string} email
   * @returns {Promise<User|null>}
   */
  User.findByEmail = async function (email) {
    return await User.findOne({
      where: { email: email.toLowerCase() },
    });
  };

  /**
   * Аутентификация пользователя
   * @param {string} email
   * @param {string} password
   * @returns {Promise<User|null>}
   */
  User.authenticate = async function (email, password) {
    const user = await User.findByEmail(email);
    if (user && (await user.checkPassword(password))) {
      return user;
    }
    return null;
  };

  return User;
};
