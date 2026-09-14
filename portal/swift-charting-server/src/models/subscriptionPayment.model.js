const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const SubscriptionPayment = sequelize.define(
    models.SUBSCRIPTION_PAYMENT,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        // allowNull: false,
        unque: true, // Assuming practiceId should be unique
      },
      stripeCustomerId: {
        type: DataTypes.STRING,
      },
      subscriptionId: {
        type: DataTypes.STRING,
      },
      invoiceId: {
        type: DataTypes.STRING,
      },
      amountPaid: {
        type: DataTypes.DECIMAL,
      },
      currency: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      attemptCount: {
        type: DataTypes.INTEGER,
      },
      paymentDate: {
        type: DataTypes.DATE,
      },
      rawEvent: {
        type: DataTypes.JSONB,
      }
    },
  );

  paginate(SubscriptionPayment);

  return SubscriptionPayment;
};
