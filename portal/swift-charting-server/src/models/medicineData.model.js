/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const MedicineData = sequelize.define(
    models.MEDICINEDATA,
    {
      name: {
        type: DataTypes.STRING,
      },

      brand: {
        type: DataTypes.INTEGER,
      },

      description: {
        type: DataTypes.STRING,
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
          name: 'medicine_name',
          fields: ['name']
        },
        {
          name: 'brand',
          fields: ['brand']
        },
        {
          name: 'data_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(MedicineData);
  return MedicineData;
};
