/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const GlobalType = sequelize.define(
    models.GLOBAL_TYPE,
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
      parentCode: {
        type: DataTypes.STRING,
      },
      globalCategoryTypeCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      metaData: {
        type: DataTypes.JSONB,
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
      colorCode: {
        type: DataTypes.STRING,
      },
      sortOrder:{
        type: DataTypes.INTEGER,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'type_name',
          fields: ['name']
        },
        {
          name: 'type_code',
          fields: ['code']
        },
        {
          name: 'global_category_type_code',
          fields: ['globalCategoryTypeCode']
        },
        {
          name: 'type_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );
  paginate(GlobalType);

  return GlobalType;
};
