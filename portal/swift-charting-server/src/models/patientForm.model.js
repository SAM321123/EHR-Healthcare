/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const { genralStatus } = require('../utils');

module.exports = (sequelize) => {
  const PatientForm = sequelize.define(
    models.PATIENT_FORM,
    {
      patientId: {
        type: DataTypes.INTEGER,
      },
      formId: {
        type: DataTypes.INTEGER,
      },
      formData: {
        type: DataTypes.JSONB,
      },
      practitionerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      patientFormSubmissionId: {
        type: DataTypes.INTEGER,
      },
      sharedById: {
        type: DataTypes.INTEGER,
      },
      sharedWith: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
        defaultValue:genralStatus.SENT,
      },
      hasPendingPractitionerSignature: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isLinkedForm:{
        type: DataTypes.BOOLEAN,
        defaultValue:false,
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
      indexs: [
        {
          name: 'form_patient_id',
          fields: ['patientId']
        },
        {
          name: 'form_id',
          fields: ['formId']
        },
        {
          name: 'form_practitioner_id',
          fields: ['practitionerId']
        },
        {
          name: 'patient_form_submission_id',
          fields: ['patientFormSubmissionId']
        },
        {
          name: 'shared_by_id',
          fields: ['sharedById']
        },
        {
          name: 'form_status',
          fields: ['status']
        },
        {
          name: 'form_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientForm);
  return PatientForm;
};
