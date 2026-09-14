const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PatientEncounterBillingSnomedCtCode = sequelize.define(
    models.PATIENT_ENCOUNTER_BILLING_SNOMEDCT_CODE,
    {

    },
    {
      timestamps: true,
    }
  );

  return PatientEncounterBillingSnomedCtCode;
};