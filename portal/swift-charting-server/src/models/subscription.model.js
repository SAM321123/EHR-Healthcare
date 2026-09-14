const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const Subscription = sequelize.define(
    models.SUBSCRIPTION,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // Assuming practiceId should be unique
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
        type: DataTypes.INTEGER,
      },
      cardNo: {
        type: DataTypes.INTEGER,
      },
      cardExpire: {
        type: DataTypes.DATE,
      },
      cvc: {
        type: DataTypes.INTEGER,
      },
      customerZip: {
        type: DataTypes.INTEGER,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      cost: {
        type: DataTypes.DECIMAL,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isCancel: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      subscriptionId: {
        type: DataTypes.STRING,
        unique: true,
      },
      customerId: {
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

  paginate(Subscription);

  return Subscription;
};
