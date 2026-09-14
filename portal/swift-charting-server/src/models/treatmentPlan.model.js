/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlan = sequelize.define(
    models.TREATMENTPLAN,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate:{
        type: DataTypes.DATE,
      },
      endDate:{
        type: DataTypes.DATE,
      },
      treatmentDays:{
        type:DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'plan_patient_id',
          fields: ['patientId']
        },
        {
          name: 'plan_start_date',
          fields: ['startDate']
        },
        {
          name: 'plan_end_date',
          fields: ['endDate']
        },
        {
          name: 'plan_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(TreatmentPlan);
  return TreatmentPlan;
};
