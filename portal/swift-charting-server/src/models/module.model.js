/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Module = sequelize.define(
    models.MODULE,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      route: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      apiRoute: {
        type: DataTypes.STRING,
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
          name: 'module_name',
          fields: ['name']
        },
        {
          name: 'module_code',
          fields: ['code']
        },
        {
          name: 'module_route',
          fields: ['route']
        },
        {
          name: 'api_route',
          fields: ['apiRoute']
        },
        {
          name: 'module_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(Module);
  
  return Module;
};
