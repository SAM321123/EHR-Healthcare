/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const UserDevice = sequelize.define(
    models.USERDEVICE,
    {
      device: {
        type: DataTypes.STRING,
      },
      apn: {
        type: DataTypes.STRING,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
          name: 'device',
          fields: ['device']
        },
        {
          name: 'user_device_user_id',
          fields: ['userId']
        },
        {
          name: 'user_device_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(UserDevice);
  return UserDevice;
};
