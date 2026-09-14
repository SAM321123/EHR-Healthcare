/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const StaffLocation = sequelize.define(
    models.STAFF_LOCATION,
    {
      staffId: {
        type: DataTypes.INTEGER,
      },
      locationId: {
        type: DataTypes.INTEGER,
      },
      isPrimaryLocation: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      leadDays: {
        type: DataTypes.STRING
      },
      appointmentConfirmation: {
        type: DataTypes.STRING
      },
      leadInterval: {
        type: DataTypes.STRING
      },
      appointmentInterval: {
        type: DataTypes.STRING
      },
      schedule: {
        type: DataTypes.JSONB,
      },
      preferredScheduleCode: {
        type: DataTypes.STRING,
      },
      autoConfirmOnlineAppointment: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '0 = manual confirmation required, 1 = auto confirmation',
      },
      hidePricesForOnlineAppointments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      hideDurationsForOnlineAppointments: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      showPractitionerSelector: {
        type: DataTypes.STRING,
        defaultValue: 'yes',
      },
      howFarInFuture: {
        type: DataTypes.STRING,
        defaultValue: '12_months',
      },
      sendAppointmentConfirmationThroughTextAlso: {
        type: DataTypes.STRING,
        defaultValue: 'to_both',
      },
      paymentForBooking: {
        type: DataTypes.STRING,
        defaultValue: 'not_required',
      },
      depositAmount: {
        type: DataTypes.DECIMAL(10, 2),
      },
      textTemplateForPatientConfirmation: {
        type: DataTypes.STRING,
        defaultValue: 'default_reminder_text',
      },
      gapInDays: {
        type: DataTypes.INTEGER,
        defaultValue: 2,
        comment: 'Minimum number of days before earliest booking slot is shown',
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
          name: 'location_staff_id',
          fields: ['staffId']
        },
        {
          name: 'staff_location_id',
          fields: ['locationId']
        },
        {
          name: 'is_primary_location',
          fields: ['isPrimaryLocation']
        },
        {
          name: 'lead_days',
          fields: ['leadDays']
        },
        {
          name: 'staff_location_schedule',
          fields: ['schedule']
        },
        {
          name: 'staff_location_is_deleted',
          fields: ['isDeleted']
        },
        {
          name: 'auto_confirm_online_appointment',
          fields: ['autoConfirmOnlineAppointment']
        },
      ]
    }
  );

  paginate(StaffLocation);
  return StaffLocation;
};
