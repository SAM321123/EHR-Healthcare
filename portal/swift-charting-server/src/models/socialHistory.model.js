2/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const SocialHistory = sequelize.define(
    models.SOCIAL_HISTORY,
    {
      socialHistoryCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      socialHistoryOther: {
        type: DataTypes.STRING,
      },
      statusCode: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      patientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      date: {
        type: DataTypes.DATE,
      },
      description: {
        type: DataTypes.STRING,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'social_history_code',
          fields: ['socialHistoryCode']
        },
        {
          name: 'social_history_status_code',
          fields: ['statusCode']
        },
        {
          name: 'social_history_patient_id',
          fields: ['patientId']
        },
        {
          name: 'social_history_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(SocialHistory)

  return SocialHistory;
};
