/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const DiagnosisIcd = sequelize.define(
    models.DIAGNOSISICD,
    {
      name: {
        type: DataTypes.STRING,
      },

      description: {
        type: DataTypes.STRING,
      },

      diagnosisProblemId: {
        type: DataTypes.INTEGER,
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
          name: 'icd_name',
          fields: ['name']
        },
        {
          name: 'diagnosis_icd_problem_id',
          fields: ['diagnosisProblemId']
        },
        {
          name: 'icd_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(DiagnosisIcd);
  return DiagnosisIcd;
};
