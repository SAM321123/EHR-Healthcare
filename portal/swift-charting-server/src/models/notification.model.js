/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Notification = sequelize.define(
    models.NOTIFICATION,
    {
      userId: {
        type: DataTypes.INTEGER,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.STRING,
      },
      date: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      data: {
        type: DataTypes.JSONB,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deviceInfo: {
        type: DataTypes.JSONB,
      },
      isRead: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      topic: {
        type: DataTypes.STRING,
      },
      isDeleted:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      }

    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'notification_user_id',
          fields: ['userId']
        },
        {
          name: 'notification_date',
          fields: ['date']
        },
        {
          name: 'notification_is_read',
          fields: ['isRead']
        },
        {
          name: 'notification_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(Notification);
  watchChanges(Notification);
  
  return Notification;
};
