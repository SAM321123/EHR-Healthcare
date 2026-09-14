/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const OutOfOfficeSchedule = sequelize.define(
    models.OUT_OF_OFFICE_SCHEDULE,
    {
      staffId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      locationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      startDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      endDateTime: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      deletedById: {
        type: DataTypes.INTEGER,
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
    },

    {
      timestamps: true,
      indexes: [
        {
          name: 'oof_staffId',
          fields: ['staffId'],
        },
        {
          name: 'oof_locationId',
          fields: ['locationId'],
        },
        {
          name: 'oof_start_datetime',
          fields: ['startDateTime'],
        },
        {
          name: 'oof_end_datetime',
          fields: ['endDateTime'],
        },
        {
          name: 'oof_is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'oof_is_active',
          fields: ['isActive'],
        },
      ],
    }
  );
  paginate(OutOfOfficeSchedule);
  return OutOfOfficeSchedule;
};
