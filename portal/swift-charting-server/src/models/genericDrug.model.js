/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const GenericDrug = sequelize.define(
    models.GENERIC_DRUG,
    {
      name: {
        type: DataTypes.STRING,
      },
      substanceName: {
        type: DataTypes.STRING,
      },
      route	: {
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
          name: 'generic_name',
          fields: ['name']
        },
        {
          name: 'generic_route',
          fields: ['route']
        },
        {
          name: 'generic_is_delete',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(GenericDrug);
  return GenericDrug;
};
