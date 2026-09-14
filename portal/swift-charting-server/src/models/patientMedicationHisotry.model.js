/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientMedicationHistory = sequelize.define(
    models.PATIENTMEDICATIONHISTORY,
    {
      patientMedicationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prescriptionDate: {
        type: DataTypes.DATE,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      prescriberId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      signature: {
        type: DataTypes.TEXT('long'),
      },
      clinicalNotes: {
        type: DataTypes.TEXT('long'),
      },
      isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      },

      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      prescribedById:{
        type: DataTypes.INTEGER,
      },
      revisedById:{
        type: DataTypes.INTEGER,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'patient_medication_id',
          fields: ['patientMedicationId'],
        },
        {
          name: 'medication_is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'medication_patient_id',
          fields: ['patientId'],
        },
        {
          name: 'prescribed_by_id',
          fields: ['prescribedById'],
        },
      ],
    }
  );
  paginate(PatientMedicationHistory);
  return PatientMedicationHistory;
};
