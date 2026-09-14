/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const CalendarScheduleRecurringSetting = sequelize.define(
    models.CALENDAR_SCHEDULE_RECURRING_SETTING,
    {
      startRecurringDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endRecurringDate: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      repeateType: {
        type: DataTypes.STRING,
      },
      repeateEvery: {
        type: DataTypes.STRING,
      },
      isOnDay: {
        type: DataTypes.BOOLEAN,
      },
      repeateWeek: {
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
          name: 'start_recurring_date',
          fields: ['startRecurringDate']
        },
        {
          name: 'end_recurring_date',
          fields: ['endRecurringDate']
        },
        {
          name: 'repeate_type',
          fields: ['repeateType']
        },
      ]
    }
  );
  paginate(CalendarScheduleRecurringSetting);
  return CalendarScheduleRecurringSetting;
};
