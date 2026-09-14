/* eslint-disable no-param-reassign */
const { DataTypes, JSONB } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientFormSubmission = sequelize.define(
    models.PATIENT_FORM_SUBMISSION,
    {
      patientFormId: {
        type: DataTypes.INTEGER,
      },
      response: {
        type:  DataTypes.TEXT('long'),
      },
      partialResponse: {
        type:  DataTypes.TEXT('long'),
      },
      status: {
        type: DataTypes.STRING,
      },
      practitionerSignature: {
        type: DataTypes.JSONB,
      },
      patientSignature: {
        type: DataTypes.JSONB,
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
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'patient_form_id',
          fields: ['patientFormId']
        },
        {
          name: 'partial_response',
          fields: ['partialResponse']
        },
        {
          name: 'from_sub_status',
          fields: ['status']
        },
        {
          name: 'form_sub_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientFormSubmission);
  return PatientFormSubmission;
};
