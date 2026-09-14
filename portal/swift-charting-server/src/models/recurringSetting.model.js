/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const RecurringSetting = sequelize.define(
    models.RECURRING_SETTING,
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
          name: 'setting_start_recurring_date',
          fields: ['startRecurringDate']
        },
        {
          name: 'setting_end_recurring_date',
          fields: ['endRecurringDate']
        },
        {
          name: 'setting_repeate_type',
          fields: ['repeateType']
        },
      ]
    }
  );
  paginate(RecurringSetting);
  return RecurringSetting;
};
