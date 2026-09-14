/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');

module.exports = (sequelize) => {
  const PracticeSetting = sequelize.define(
    models.PRACTICE_SETTING,
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
        trim: true,
      },
      address: {
        type: DataTypes.JSONB,
      },
      contact: {
        type: DataTypes.STRING,
      },
      primaryContactName: {
        type: DataTypes.STRING,
      },
      primaryContactPhone: {
        type: DataTypes.STRING,
      },
      logoId: {
        type: DataTypes.INTEGER,
      },
      signature: {
        type:DataTypes.TEXT('long'),
        defaultValue:'',
        // type: DataTypes.STRING,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
      timezone:{
        type: DataTypes.STRING,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'practice_setting_name',
          fields: ['name']
        },
        {
          name: 'practice_setting_email',
          fields: ['email']
        },
        {
          name: 'practice_setting_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'contact',
          fields: ['contact']
        },
      ]
    }
  );

  return PracticeSetting;
};
