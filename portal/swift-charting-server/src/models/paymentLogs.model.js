/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PaymentLogs = sequelize.define(
    models.PAYMENT_LOGS,
    {
      paymentIntentId: {
        type: DataTypes.STRING,
      },
      response: {
        type: DataTypes.TEXT('long'),
      },
      error: {
        type: DataTypes.STRING,
      },
      status:{
        type:DataTypes.STRING,
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
          name: 'payment_intent_id',
          fields: ['paymentIntentId']
        },
        {
          name: 'payment_log_status',
          fields: ['status']
        },
        {
          name: 'payment_log_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  return PaymentLogs;
};
