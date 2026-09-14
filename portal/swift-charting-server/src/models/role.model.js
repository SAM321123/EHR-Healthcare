/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Role = sequelize.define(
    models.ROLE,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      description: {
        type: DataTypes.STRING,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDefault: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'role_name',
          fields: ['name']
        },
        {
          name: 'role_code',
          fields: ['code']
        },
        {
          name: 'role_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(Role);
  
  return Role;
};
