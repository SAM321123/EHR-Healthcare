/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientMedicationDiagnosisHistory = sequelize.define(
    models.PATIENTMEDICATIONDIAGNOSISHISTORY,
    {
      diagnosisIcdId: {
        type: DataTypes.INTEGER,
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'history_diagnosis_icd_id',
          fields: ['diagnosisIcdId'],
        },
      ],
    }
  );
  paginate(PatientMedicationDiagnosisHistory);
  return PatientMedicationDiagnosisHistory;
};
