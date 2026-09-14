/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const MeetConfig = sequelize.define(
    models.MEET_CONFIG,
    {
      clientId: {
        type: DataTypes.STRING,
      },
      clientSecret: {
        type: DataTypes.STRING,
      },
      tokens: {
        type: DataTypes.JSONB,
      },
      status:{
        type:DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      isDefault: {
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
      indexes: [
        {
          name: 'client_id',
          fields: ['clientId']
        },
        {
          name: 'client_secret',
          fields: ['clientSecret']
        },
        {
          name: 'config_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  return MeetConfig;
};
