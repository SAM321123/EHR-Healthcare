/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientEncounters = sequelize.define(
    models.PATIENT_ENCOUNTERS,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      encounterTypeCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       behavior: {
        type: DataTypes.STRING,
      },
       intervention: {
        type: DataTypes.STRING,
      },
       response: {
        type: DataTypes.STRING,
      },
       birpPlan: {
        type: DataTypes.STRING,
      },
       data: {
        type: DataTypes.STRING,
      },
       assessment: {
        type: DataTypes.STRING,
      },
       dapPlan: {
        type: DataTypes.STRING,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      assignedToId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      }, 
      billingTypeCode: {
        type: DataTypes.STRING,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      duration: {
        type: DataTypes.STRING,
      },
      additionalFields: {
        type: DataTypes.JSONB,
      },
      soapForm: {
        type: DataTypes.JSONB,
      },
      selectedForms: {
        type: DataTypes.JSONB,
      },
      billingId:{
        type:DataTypes.INTEGER,
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
      atDraft: {
        type: DataTypes.BOOLEAN,
        defaultValue:true,
      },
      signature:{
        type:DataTypes.TEXT('long'),
        defaultValue:'',
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'encounter_patient_id',
          fields: ['patientId']
        },
        {
          name: 'encounter_type_code',
          fields: ['encounterTypeCode']
        },
        {
          name: 'encounter_start_date',
          fields: ['startDate']
        },
        {
          name: 'assigned_to_id',
          fields: ['assignedToId']
        },
        {
          name: 'billing_type_code',
          fields: ['billingTypeCode']
        },
        {
          name: 'encounter_end_date',
          fields: ['endDate']
        },
        {
          name: 'billing_id',
          fields: ['billingId']
        },
        {
          name: 'encounter_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientEncounters);
  return PatientEncounters;
};
