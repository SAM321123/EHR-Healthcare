/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientEncounterBilling = sequelize.define(
    models.PATIENT_ENCOUNTER_BILLING,
    {
      encounterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientId: {
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
      subTotal: {
        type: DataTypes.DECIMAL,
      },
      total: {
        type: DataTypes.DECIMAL,
      },
      tip: {
        type: DataTypes.DECIMAL,
      },
      insuranceSubmittedAmount: {
        type: DataTypes.DECIMAL,
      },
      previousBalance: {
        type: DataTypes.DECIMAL,
      },
      coPay: {
        type: DataTypes.DECIMAL,
      },
      billingType: {
        type: DataTypes.STRING,
      },
      comment: {
        type: DataTypes.TEXT('long'),
      },
      prePaidCash: {
        type: DataTypes.DECIMAL,
      },
      prePaidType: {
        type: DataTypes.STRING,
      },
      note: {
        type: DataTypes.TEXT('long'),
      },
      insuranceType: {
        type: DataTypes.STRING,
      },
      cash: {
        type: DataTypes.DECIMAL,
      },
      balance: {
        type: DataTypes.DECIMAL,
      },
      paymentDate: {
        type: DataTypes.DATE,
      },
      cardAmount: {
        type: DataTypes.DECIMAL,
      },
      cardNo: {
        type: DataTypes.INTEGER,
      },
      cardType: {
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
          name: 'billing_encounter_id',
          fields: ['encounterId']
        },
        {
          name: 'billing_patient_id',
          fields: ['patientId']
        },
        {
          name: 'primary_provider_id',
          fields: ['primaryProviderId']
        },
        {
          name: 'reference_provider_id',
          fields: ['referenceProviderId']
        },
        {
          name: 'billing_insurance_id',
          fields: ['insuranceId']
        },
        {
          name: 'billing_location_id',
          fields: ['locationId']
        },
        {
          name: 'procedure_code_type',
          fields: ['procedureCodeType']
        },
        {
          name: 'billing_status_code',
          fields: ['statusCode']
        },
        {
          name: 'sub_total',
          fields: ['subTotal']
        },
        {
          name: 'billing_total',
          fields: ['total']
        },
        {
          name: 'tip',
          fields: ['tip']
        },
        {
          name: 'insurance_submitted_amount',
          fields: ['insuranceSubmittedAmount']
        },
        {
          name: 'previous_balance',
          fields: ['previousBalance']
        },
        {
          name: 'co_pay',
          fields: ['coPay']
        },
        {
          name: 'billing_type',
          fields: ['billingType']
        },
        {
          name: 'pre_paid_cash',
          fields: ['prePaidCash']
        },
        {
          name: 'billing_insurance_type',
          fields: ['insuranceType']
        },
        {
          name: 'cash',
          fields: ['cash']
        },
        {
          name: 'balance',
          fields: ['balance']
        },
        {
          name: 'payment_date',
          fields: ['paymentDate']
        },
        {
          name: 'card_amount',
          fields: ['cardAmount']
        },
        {
          name: 'card_no',
          fields: ['cardNo']
        },
        {
          name: 'card_type',
          fields: ['cardType']
        },
        {
          name: 'billing_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  
  paginate(PatientEncounterBilling);
  return PatientEncounterBilling;
};
