/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Insurance = sequelize.define(
    models.INSURANCE,
    {
      insurancePolicyCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      insurancePolicyOther:{
        type:DataTypes.STRING
      },
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
      },
      insuranceId: {
        type: DataTypes.STRING,
      },
      insuranceCompanyName: {
        type: DataTypes.STRING,
      },
      groupName: {
        type: DataTypes.STRING,
      },
      groupNumber: {
        type: DataTypes.STRING,
      },
      birthDate: {
        type: DataTypes.DATE,
      },
      insuredRelationship: {
        type: DataTypes.STRING,
      },
      insuranceFrontFileId: {
        type: DataTypes.INTEGER,
      },
      insuranceBackFileId: {
        type: DataTypes.INTEGER,
      },
      insuranceType: {
        type: DataTypes.ENUM('1', '2', '3'),
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
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
      patientId: {
        type: DataTypes.INTEGER,
      },
      payerId: {
        type: DataTypes.INTEGER,
      },
      eligibilityCheckPayerId: {
        type: DataTypes.INTEGER,
      },
      claimStatusCheckPayerId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'insurance_first_name',
          fields: ['firstName']
        },
        {
          name: 'insurance_last_name',
          fields: ['lastName']
        },
        {
          name: 'insurance_id',
          fields: ['insuranceId']
        },
        {
          name: 'insurance_company_name',
          fields: ['insuranceCompanyName']
        },
        {
          name: 'insurance_type',
          fields: ['insuranceType']
        },
        {
          name: 'insurance_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'insurance_patient_id',
          fields: ['patientId']
        },
        {
          name: 'payer_id',
          fields: ['payerId']
        },
        {
          name: 'eligibility_check_payer_id',
          fields: ['eligibilityCheckPayerId']
        },
        {
          name: 'claim_status_check_payer_id',
          fields: ['claimStatusCheckPayerId']
        },
      ]
    }
  );
  paginate(Insurance);
  return Insurance;
};
