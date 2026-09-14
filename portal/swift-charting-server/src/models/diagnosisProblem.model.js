/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const DiagnosisProblem = sequelize.define(
    models.DIAGNOSISPROBLEM,
    {
      name: {
        type: DataTypes.TEXT('long'),
      },
      description: {
        type: DataTypes.TEXT('long'),
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'problem_name',
          fields: ['name']
        },
        {
          name: 'problem_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(DiagnosisProblem);
  return DiagnosisProblem;
};
