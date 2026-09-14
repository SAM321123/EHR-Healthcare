/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const EligibilityCheckHistory = sequelize.define(
    models.ELIGIBILITY_CHECK_HISTORY,
    {
      patientId: {
        type: DataTypes.INTEGER,
      },
      insuranceId: {
        type: DataTypes.INTEGER,
      },
      providerId: {
        type: DataTypes.INTEGER,
      },
      ediRequest: {
        type:DataTypes.TEXT('long')
      },
      ediResponse: {
        type:DataTypes.TEXT('long')
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
      updatedById: {
        type: DataTypes.INTEGER,
      },
      statusCode: {
        type: DataTypes.STRING,
      }
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'patientId_index',  // Custom index name (optional)
          fields: ['patientId'],  // Field to index
        },
      ],
    }
  );
  paginate(EligibilityCheckHistory);
  watchChanges(EligibilityCheckHistory);

  return EligibilityCheckHistory;
};
