/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ClaimFileLogs = sequelize.define(
    models.CLAIM_FILE_LOGS,
    {
      fileName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      timestamps: true,
    }
  );

  paginate(ClaimFileLogs);
  return ClaimFileLogs;
};
