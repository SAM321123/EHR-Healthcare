/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const PatientDocument = sequelize.define(
    models.PATIENTDOCUMENT,
    {
      fileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      typeCode: {
        type: DataTypes.STRING,
      },
      date: {
        type: DataTypes.DATE,
      },
      description: {
        type: DataTypes.TEXT('long'),
      },
      patientId: {
        type: DataTypes.INTEGER,
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
      providerId: {
        type: DataTypes.INTEGER,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'file_id',
          fields: ['fileId']
        },
        {
          name: 'doc_patient_id',
          fields: ['patientId']
        },
        {
          name: 'doc_provider_id',
          fields: ['providerId']
        },
        {
          name: 'doc_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(PatientDocument);
  return PatientDocument;
};
