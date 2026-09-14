/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
module.exports = (sequelize) => {
  const ProspectRegistration = sequelize.define(
    models.PROSPECTREGISTRATION,
    {
      templateId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      staffIds: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      serviceIds: {
        type: DataTypes.JSONB,
        allowNull: true,
      },

      questionnaireFormId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      paymentRequired: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },

      stripePaymentMode: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: 'test',
      },

      // Stripe keys are stored per-tenant for the prospect registration widget payments.
      // Secret/webhook values are stored encrypted by the API layer.
      stripeTestPublishableKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stripeTestSecretKey: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      stripeTestWebhookSecret: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      stripeLivePublishableKey: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      stripeLiveSecretKey: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      stripeLiveWebhookSecret: {
        type: DataTypes.TEXT,
        allowNull: true,
      },

      instructionText: {
        type: DataTypes.STRING(1000),
        allowNull: false,
      },

      codeLink: {
        type: DataTypes.TEXT,
        allowNull: false,
      },

      dateTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
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
        allowNull: true,
      },

      updatedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },

      deletedById: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      tableName: 'prospect_registration',
      indexes: [{ fields: ['isActive'] }, { fields: ['isDeleted'] }],
    }
  );

  paginate(ProspectRegistration);

  return ProspectRegistration;
};
