const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const LabRadiologyLaboratoryTest = sequelize.define(
    models.LABS_RADIOLOGY_LABORATORY_TEST,
    {

    },
    {
      timestamps: true,
    }
  );

  return LabRadiologyLaboratoryTest;
};
