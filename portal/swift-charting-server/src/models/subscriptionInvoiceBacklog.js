const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const SubscriptionInvoiceBacklog = sequelize.define(
    models.SUBSCRIPTION_INVOICE_BACKLOG,
    {
      practiceId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unque: true, // Assuming practiceId should be unique
      },
      paymentDate: {
        type: DataTypes.DATE,
      },
      status: {
        type: DataTypes.BOOLEAN,
      },
      cost: {
        type: DataTypes.INTEGER,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
    },
  );

  paginate(SubscriptionInvoiceBacklog);

  return SubscriptionInvoiceBacklog;
};