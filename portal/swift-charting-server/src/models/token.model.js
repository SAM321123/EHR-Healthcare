const { DataTypes } = require('sequelize');
const { tokenTypes } = require('../config/tokens');
const models = require('../config/models');

module.exports = (sequelize) => {
  const Token = sequelize.define(
    models.TOKEN,
    {
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(...Object.values(tokenTypes)),
        allowNull: false,
      },
      expires: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      blacklisted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'token',
          fields: ['token']
        },
        {
          name: 'token_user_id',
          fields: ['userId']
        },
        {
          name: 'token_expires',
          fields: ['expires']
        },
      ]
    }
  );

  return Token;
};
