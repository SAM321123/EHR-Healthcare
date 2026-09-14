const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PatientEncounterBillingIcdCode = sequelize.define(
    models.PATIENT_ENCOUNTER_BILLING_ICD_CODE,
    {

    },
    {
      timestamps: true,
    }
  );

  return PatientEncounterBillingIcdCode;
};
