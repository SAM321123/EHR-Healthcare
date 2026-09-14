/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientEncounterClaims = sequelize.define(
    models.PATIENT_ENCOUNTER_CLAIMS,
    {
      encounterBillingId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      claimId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      fileId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      encounterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      claimFileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      claim837EDI: {
        type: DataTypes.TEXT,
      },
      acknowledgmentStatus: {
        type: DataTypes.STRING,
      },
      errors: {
        type: DataTypes.JSONB,
      },
      claimStatus: {
        type: DataTypes.STRING,
      }, 
      traceNumber: {
        type: DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      }, 

    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'claim_encounter_billing_id',
          fields: ['encounterBillingId']
        },
        {
          name: 'claim_id',
          fields: ['claimId']
        },
        {
          name: 'claim_file_id',
          fields: ['fileId']
        },
        {
          name: 'claim_encounter_id',
          fields: ['encounterId']
        },
        {
          name: 'claim_patient_id',
          fields: ['patientId']
        },
        {
          name: 'claim837_edi',
          fields: ['claim837EDI']
        },
        {
          name: 'acknowledgment_status',
          fields: ['acknowledgmentStatus']
        },
        {
          name: 'claim_status',
          fields: ['claimStatus']
        },
        {
          name: 'claim_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientEncounterClaims);
  return PatientEncounterClaims;
};



