const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Хеширование пароля
 */
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

/**
 * Проверка пароля
 */
const comparePassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

/**
 * Создание JWT токена
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
};

/**
 * Проверка силы пароля согласно требованиям преподавателя:
 * - английские символы
 * - несколько цифр
 * - 1 заглавная буква
 * - минимум 8 символов
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (password.length < 8) {
    errors.push('Пароль должен содержать минимум 8 символов');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Пароль должен содержать минимум 1 заглавную букву');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Пароль должен содержать строчные английские буквы');
  }

  if (!/\d.*\d/.test(password)) {
    errors.push('Пароль должен содержать минимум 2 цифры');
  }

  if (!/^[A-Za-z\d@$!%*?&]+$/.test(password)) {
    errors.push('Пароль может содержать только английские буквы, цифры и символы @$!%*?&');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Генерация случайного пароля (для демо)
 */
const generateRandomPassword = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&';
  let password = '';
  
  // Обязательные символы
  password += 'A'; // заглавная
  password += 'a'; // строчная
  password += '1'; // цифра
  password += '2'; // ещё цифра
  
  // Дополняем до 8 символов
  for (let i = 4; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Перемешиваем символы
  return password.split('').sort(() => 0.5 - Math.random()).join('');
};

module.exports = {
  hashPassword,
  comparePassword,
  generateToken,
  validatePasswordStrength,
  generateRandomPassword,
  JWT_SECRET,
  JWT_EXPIRES_IN
};