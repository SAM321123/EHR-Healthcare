/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const BrandNameDrug = sequelize.define(
    models.BRAND_NAME_DRUG,
    {
      name: {
        type: DataTypes.STRING,
      },
      manufacturerName: {
        type: DataTypes.STRING,
      },
      productNDC: {
        type: DataTypes.STRING,
      },
      genericDrugId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          name: 'generic_drug_id',
          fields: ['genericDrugId']
        },
        {
          name: 'brand_name_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'brand_name_is_active',
          fields: ['isActive']
        }
      ]
    }
  );
  paginate(BrandNameDrug);
  return BrandNameDrug;
};
