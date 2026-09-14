/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const GlobalCategoryType = sequelize.define(
    models.GLOBAL_CATEGORY_TYPE,
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
        trim: true,
      },
      description: {
        type: DataTypes.STRING,
      },
      metaData: {
        type: DataTypes.JSONB,
      },
      isColorCode: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'category_name',
          fields: ['name']
        },
        {
          name: 'category_code',
          fields: ['code']
        },
        {
          name: 'category_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(GlobalCategoryType);
  return GlobalCategoryType;
};
