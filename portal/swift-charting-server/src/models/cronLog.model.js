/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const CronLog = sequelize.define(
    models.CRON_LOG,
    {
      method: {
        type: DataTypes.STRING,
      },
      timeTaken: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      error: {
        type: DataTypes.JSONB,
      },
      tenantId: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  paginate(CronLog);
  return CronLog;
};
