const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const SubscriptionHistory = sequelize.define(
    models.SUBSCRIPTION_HISTORY,
    {
      subscriptionId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATE,
      },
      endDate: {
        type: DataTypes.DATE,
      },
      practitionerCount: {
        type: DataTypes.INTEGER,
        allowNull: false, 
      },
      rnCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      prescriberCount: {
        type: DataTypes.INTEGER
      },
      cardNo: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      signature: {
        type: DataTypes.TEXT('long'),
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isCancel: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      cost: {
        type: DataTypes.DECIMAL,
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
      paymentIntentId: {
        type: DataTypes.STRING,
      },
      response: {
        type: DataTypes.TEXT('long'),
      },
      error: {
        type: DataTypes.STRING,
      },
      cancelReason: {
        type: DataTypes.STRING,
      },
      otherCancelReason: {
        type: DataTypes.STRING,
      }
    },
  );

  paginate(SubscriptionHistory);

  return SubscriptionHistory;
};
