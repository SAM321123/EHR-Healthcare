/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const EmailCampaignComposeMail = sequelize.define(
    models.EMAIL_CAMPAIGN_COMPOSE_MAIL,
    {
      sendTo: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      templateName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
       patients: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
       status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive:{
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
    }
  );
  paginate(EmailCampaignComposeMail);
  return EmailCampaignComposeMail;
};
