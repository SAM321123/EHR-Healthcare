/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const StaffBookingSetting = sequelize.define(
    models.STAFF_BOOKING_SETTING,
    {
      staffId: {
        type: DataTypes.INTEGER,
      },
      cancellationLeadTime:{
        type:DataTypes.STRING
      },
      cancellationRescheduleTime:{
        type:DataTypes.STRING
      },
      cancellationPolicyText:{
        type:DataTypes.STRING
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
          name: 'booking_staff_id',
          fields: ['staffId']
        },
        {
          name: 'booking_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );

  paginate(StaffBookingSetting);
  return StaffBookingSetting;
};
