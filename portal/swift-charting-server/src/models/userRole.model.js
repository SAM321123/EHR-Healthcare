// models/userRole.js

const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const UserRole = sequelize.define(
    models.USER_ROLE,
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      roleId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'user_role_user_id',
          fields: ['userId']
        },
        {
          name: 'role_id',
          fields: ['roleId']
        },
      ]
    }
  );

  return UserRole;
};
