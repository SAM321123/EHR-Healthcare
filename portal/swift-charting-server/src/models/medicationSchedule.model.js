/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const MedicationSchedule = sequelize.define(
    models.MEDICATION_SCHEDULE,
    {
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      timeSlots:{
        type: DataTypes.JSONB,
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      repeatType: {
        type: DataTypes.STRING,
      },
      repeatEvery: {
        type: DataTypes.STRING,
      },
      isOnDay: {
        type: DataTypes.BOOLEAN,
      },
      repeatWeek: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      monthOnDay: {
        type: DataTypes.STRING,
      },
      monthWeekDay: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
      monthWeek: {
        type: DataTypes.ARRAY(DataTypes.STRING),
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'medication_schedule_patient_id',
          fields: ['patientId']
        },
        {
          name: 'time_slots',
          fields: ['timeSlots']
        },
        {
          name: 'medication_schedule_start_date',
          fields: ['startDate']
        },
        {
          name: 'medication_schedule_end_date',
          fields: ['endDate']
        },
      ]
    }
  );
  paginate(MedicationSchedule);

  return MedicationSchedule;
};
