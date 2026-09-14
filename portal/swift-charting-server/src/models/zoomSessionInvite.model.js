/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ZoomSessionInvite = sequelize.define(
    models.ZOOM_SESSION_INVITE,
    {
      zoomSessionId: {
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
      },
roleType:{
    type:DataTypes.INTEGER,
    defaultValue:0
},
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
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
          name: 'zoom_session_id',
          fields: ['zoomSessionId']
        },
        {
          name: 'invite_user_id',
          fields: ['userId']
        },
        {
          name: 'invite_is_deleted',
          fields: ['isDeleted']
        },           
      ]
    }
  );

  paginate(ZoomSessionInvite);
  return ZoomSessionInvite;
};
