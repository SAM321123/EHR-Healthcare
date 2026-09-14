/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const Practice = sequelize.define(
    models.PRACTICE,
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        trim: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      contact: {
        type: DataTypes.STRING,
      },
      address: {
        type: DataTypes.JSONB,
      },
      logo: {
        type: DataTypes.STRING,
      },
      signature: {
        type: DataTypes.STRING,
      },
      domainName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      databaseConfigId: {
        type: DataTypes.INTEGER,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isTrialPractice: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      trialExpiresAt: {
        type: DataTypes.DATE,
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
          name: 'practice_name',
          fields: ['name']
        },
        {
          name: 'practice_email',
          fields: ['email']
        },
        {
          name: 'domain_name',
          fields: ['domainName']
        },
        {
          name: 'database_config_id',
          fields: ['databaseConfigId']
        },
        {
          name: 'practice_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'is_trial_practice',
          fields: ['isTrialPractice']
        },
        {
          name: 'trial_expires_at',
          fields: ['trialExpiresAt']
        },
      ],
    }
  );
  paginate(Practice);
  return Practice;
};
