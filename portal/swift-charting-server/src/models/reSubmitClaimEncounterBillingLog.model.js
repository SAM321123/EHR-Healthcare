/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ReSubmitClaimEncounterBillingLog = sequelize.define(
    models.RE_SUBMIT_CLAIM_ENCOUNTER_BILLING_LOG,
    {
      encounterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      encounterBillingId:{
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      primaryProviderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      referenceProviderId: {
        type: DataTypes.INTEGER,
      },
      insuranceId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      visitDate:{
        type: DataTypes.DATE,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
      },
      procedureCodeType: {
        type: DataTypes.STRING,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
      subTotal:{
        type:DataTypes.INTEGER
      },
      total:{
        type:DataTypes.INTEGER
      },
      tip:{
        type:DataTypes.INTEGER
      },
      insuranceSubmittedAmount:{
        type:DataTypes.INTEGER
      },
      previousBalance:{
        type:DataTypes.INTEGER
      },
      coPay:{
        type:DataTypes.INTEGER
      },
      billingType: {
        type: DataTypes.STRING,
      },
      comment: {
        type: DataTypes.TEXT('long'),
      },
      encounterDiagnosis:{
        type: DataTypes.JSONB
      },
      encounterDiagnosisSnomeds: {
        type: DataTypes.JSONB
      },
      encounterProcedureCodes: {
        type: DataTypes.JSONB
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 're_submit_claim_encounter_id',
          fields: ['encounterId']
        },
        {
          name: 're_submit_claim_patient_id',
          fields: ['patientId']
        },
        {
          name: 're_submit_encounter_billing_id',
          fields: ['encounterBillingId']
        },
        {
          name: 're_submit_primary_provider_id',
          fields: ['primaryProviderId']
        },
        {
          name: 're_submit_reference_provider_id',
          fields: ['referenceProviderId']
        },
        {
          name: 're_submit_claim_insurance_id',
          fields: ['insuranceId']
        },
        {
          name: 're_submit_claim_location_id',
          fields: ['locationId']
        },
        {
          name: 're_submit_claim_status_code',
          fields: ['statusCode']
        },
        {
          name: 're_submit_claim_billing_type',
          fields: ['billingType']
        },
      ]
    }
  );
  paginate(ReSubmitClaimEncounterBillingLog);
  return ReSubmitClaimEncounterBillingLog;
};



