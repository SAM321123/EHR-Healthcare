/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const ZoomSession = sequelize.define(
    models.ZOOM_SESSION,
    {
      appointmentId: {
        type: DataTypes.INTEGER,
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
          name: 'appointment_id',
          fields: ['appointmentId']
        },
        {
          name: 'zoom_is_deleted',
          fields: ['isDeleted']
        },      
      ]
    }
  );

  paginate(ZoomSession);
  return ZoomSession;
};
