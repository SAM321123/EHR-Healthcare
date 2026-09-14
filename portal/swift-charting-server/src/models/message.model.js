/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Message = sequelize.define(
    models.MESSAGE,
    {
      chatId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      senderId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      receiverId : {
        type: DataTypes.INTEGER,
      },
      messageText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      sentAt: {
        type: DataTypes.DATE,
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
      deletedById: {
        type: DataTypes.INTEGER,
      },
      isRead:{
        type:DataTypes.BOOLEAN,
        defaultValue:false,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'chat_id',
          fields: ['chatId']
        },
        {
          name: 'sender_id',
          fields: ['senderId']
        },
        {
          name: 'receiver_id',
          fields: ['receiverId']
        },
        {
          name: 'is_read',
          fields: ['isRead']
        },
        {
          name: 'message_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
  paginate(Message);
  watchChanges(Message);
  return Message;
};
