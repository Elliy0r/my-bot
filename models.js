const { DataTypes } = require('sequelize');
const sequelize = require('./db'); // Подключение к базе данных, если используется

const TelegramRequest = sequelize.define('TelegramRequest', {
  message_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  is_bot: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
  },
  first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  language_code: {
    type: DataTypes.STRING(10),
    allowNull: true,
  },
  is_premium: {
    type: DataTypes.BOOLEAN,
    allowNull: true,
  },
  chat_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  chat_first_name: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chat_username: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  chat_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  request_date: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  text: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  location: {
    type: DataTypes.STRING, allowNull: true,
  },
  entities: {
    type: DataTypes.JSONB,
    allowNull: true,
  },
  repeat_count: { // Новое поле для хранения количества повторов
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false,
  },
}, {
  tableName: 'telegram_requests',
  timestamps: false, // Убирает автоматические поля createdAt и updatedAt
});

module.exports = TelegramRequest;