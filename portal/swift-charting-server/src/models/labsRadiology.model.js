2; /* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const LabsRadiology = sequelize.define(
    models.LABS_RADIOLOGY,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      providerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      priority: {
        type: DataTypes.STRING,
      },
      requiredTestingTime: {
        type: DataTypes.STRING,
      },
      diagnosisIcdId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientDiagnosisId: {
        type: DataTypes.INTEGER,
      },
      sendingDetails: {
        type: DataTypes.BOOLEAN,
      },
      testingLabId: {
        type: DataTypes.INTEGER,
      },
      barCode: {
        type: DataTypes.STRING,
      },
      hl7VersionCode: {
        type: DataTypes.STRING,
      },
      specimenTypeCode: {
        type: DataTypes.JSONB,
      },
      siteOfCollection: {
        type: DataTypes.STRING,
      },
      payer:{
        type: DataTypes.STRING,
      },
      collectionDateTime: {
        type: DataTypes.DATE,
      },
      sendingApplication: {
        type: DataTypes.STRING,
      },
      specimenQuantity: {
        type: DataTypes.STRING,
      },
      specimenVolume: {
        type: DataTypes.STRING,
      },
      clinicalInfo: {
        type: DataTypes.TEXT('long'),
      },
      suspectedCondition: {
        type: DataTypes.JSONB,
      },
      fasting: {
        type: DataTypes.INTEGER,
      },
      sensitiveInsTime: {
        type: DataTypes.STRING,
      },
      patientPrepIns: {
        type: DataTypes.STRING,
      },
      sendingFacilityId: {
        type: DataTypes.INTEGER,
      },
      allergies: {
        type: DataTypes.JSONB,
      },
      medicalHistory: {
        type: DataTypes.JSONB,
      },
      patientEncounterId: {
        type: DataTypes.INTEGER,
      },
      otherLaboratoryTest: {
        type: DataTypes.JSONB,
      },
      signature: {
        type: DataTypes.TEXT('long'),
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
      hl7Data: {
        type:DataTypes.TEXT('long')
      },
      isLabResult: {
        type:DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hl7Message: {
        type: DataTypes.JSONB
      },
      sendToLab: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'lab_patient_id',
          fields: ['patientId']
        },
        {
          name: 'lab_provider_id',
          fields: ['providerId']
        },
        {
          name: 'labs_diagnosis_icd_id',
          fields: ['diagnosisIcdId']
        },
        {
          name: 'patient_diagnosis_id',
          fields: ['patientDiagnosisId']
        },
        {
          name: 'testing_lab_id',
          fields: ['testingLabId']
        },
        {
          name: 'payer',
          fields: ['payer']
        },
        {
          name: 'sending_facility_id',
          fields: ['sendingFacilityId']
        },
        {
          name: 'labs_patient_encounter_id',
          fields: ['patientEncounterId']
        },
        {
          name: 'labs_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'is_lab_result',
          fields: ['isLabResult']
        },
        {
          name: 'send_to_lab',
          fields: ['sendToLab']
        },
      ]
    }
  );
  paginate(LabsRadiology);

  return LabsRadiology;
};
