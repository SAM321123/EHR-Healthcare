/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const LoginLogs = sequelize.define(
    models.LOGIN_LOGS,
    {
      email: {
        type: DataTypes.STRING,
      },
      userIp: {
        type: DataTypes.STRING,
      },
      country: {
        type: DataTypes.STRING,
      },
      state: {
        type: DataTypes.STRING,
      },
      city: {
        type: DataTypes.STRING,
      },
      deviceDetail: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.STRING,
      },
      deviceId: {
        type: DataTypes.STRING,
      },
      loginTime: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'login_email',
          fields: ['email'],
        },
        {
          name: 'user_ip',
          fields: ['userIp'],
        },
        {
          name: 'device_detail',
          fields: ['deviceDetail'],
        },
        {
          name: 'login_status',
          fields: ['status'],
        },
      ],
    }
  );
  paginate(LoginLogs);
  return LoginLogs;
};
