/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const DiagnosisSnomedCt = sequelize.define(
    models.DIAGNOSIS_SNOMEDCT,
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
    }
  );
  paginate(DiagnosisSnomedCt);
  return DiagnosisSnomedCt;
};
