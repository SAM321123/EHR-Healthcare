/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Homework = sequelize.define(
    models.HOMEWORK,
    {
      patientId: {
        type: DataTypes.INTEGER,
      },
      ICDId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      goalsOfExcercise: {
        type: DataTypes.TEXT('long'),
      },
      suggestions: {
        type: DataTypes.TEXT('long'),
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
          name: 'homework_patient_id',
          fields: ['patientId']
        },
        {
          name: 'ICD_id',
          fields: ['ICDId']
        },
        {
          name: 'homework_start_date',
          fields: ['startDate']
        }, {
          name: 'homework_end_date',
          fields: ['endDate']
        },
        {
          name: 'homework_is_deleted',
          fields: ['isDeleted']
        }
      ]
    }
  );
  paginate(Homework);
  return Homework;
};
