/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Diagnosis = sequelize.define(
    models.DIAGNOSIS,
    {
      problemId: {
        type: DataTypes.INTEGER,
      },
      ICDId: {
        type: DataTypes.INTEGER,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      sexualOrientationCode: {
        type: DataTypes.STRING,
      },
      typeCode: {
        type: DataTypes.STRING,
      },
      patientEncounterId: {
        type: DataTypes.INTEGER,
      },  
      comments: {
        type: DataTypes.TEXT('long'),
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
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
      patientId: {
        type: DataTypes.INTEGER,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'diagnosis_problem_id',
          fields: ['problemId']
        },
        {
          name: 'diagnosis_icd_id',
          fields: ['ICDId']
        },
        {
          name: 'diagnosis_start_date',
          fields: ['startDate']
        },
        {
          name: 'diagnosis_end_date',
          fields: ['endDate']
        },
        {
          name: 'diagnosis_patient_id',
          fields: ['patientId']
        },
        {
          name: 'diagnosis_patient_encounter_id',
          fields: ['patientEncounterId']
        },
        {
          name: 'diagnosis_is_deleted',
          fields: ['isDeleted']
        },
      ]
      //   tableName: 'diagnosis',
    }
  );
  paginate(Diagnosis);
  watchChanges(Diagnosis);
  return Diagnosis;
};
