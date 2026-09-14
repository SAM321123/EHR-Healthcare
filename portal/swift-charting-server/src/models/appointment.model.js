/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const Appointment = sequelize.define(
    models.APPOINTMENT,
    {
      practitionerId: {
        type: DataTypes.INTEGER,
      },
      startDateTime: {
        type: DataTypes.DATE,
      },
      endDateTime: {
        type: DataTypes.DATE,
      },
      title: {
        type: DataTypes.STRING,
      },
      typeCode: {
        type: DataTypes.STRING,
      },
      locationId: {
        type: DataTypes.INTEGER,
      },
      roomId: {
        type: DataTypes.INTEGER,
      },
      statusCode: {
        type: DataTypes.STRING,
      },
      copayCode: {
        type: DataTypes.STRING,
      },
      problemId: {
        type: DataTypes.INTEGER,
      },
      reasonForAppointment: {
        type: DataTypes.TEXT('long'),
      },
      note: {
        type: DataTypes.TEXT('long'),
      },
      recurringSettingId: {
        type: DataTypes.INTEGER,
      },
      isRecurring: {
        type: DataTypes.BOOLEAN,
      },
      isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isActive: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
      },
      confirmOnIntake: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      patientFormId: {
        type: DataTypes.INTEGER,
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
      googleMeetLink: {
        type: DataTypes.STRING,
      },
      calendarEventId: {
        type: DataTypes.STRING,
      },
      appleCalendarEventId: {
        type: DataTypes.STRING,
      },
      isVirtual: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      isOnlineBookingStatus: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '0 = manual confirmation required, 1 = auto confirmation',
      },
    },
    {
      timestamps: true,
      indexes: [
        { 
          name: 'appointment_practitioner_id',
          fields: ['practitionerId']
        },
        {
          name: 'appointment_location_id',
          fields: ['locationId'] 
        },
        {
          name: 'appointment_status_code',
          fields: ['statusCode'] 
        },
        {
          name: 'appointment_problem_id',
          fields: ['problemId'] 
        },
        {
          name: 'is_recurring',
          fields: ['isRecurring'] 
        },
        {
          name: 'appointment_patient_form_id',
          fields: ['patientFormId'] 
        },
        {
          name: 'is_virtual',
          fields: ['isVirtual'] 
        },
        {
          name: 'confirm_on_intake',
          fields: ['confirmOnIntake'] 
        },
        {
          name: 'appointment_start_date_time',
          fields: ['startDateTime'] 
        },
        {
          name: 'appointment_end_date_time',
          fields: ['endDateTime'] 
        },
        {
          name: 'room_id',
          fields: ['roomId'] 
        },
        {
          name: 'appointment_is_deleted',
          fields: ['isDeleted'],
        },
        {
          name: 'is_online_booking_status',
          fields: ['isOnlineBookingStatus'],
        },
      ]
      //   tableName: 'diagnosis',
    }
  );
  Appointment.beforeBulkCreate(async (appointments) => {
    for(let appointment of appointments){
      if(!appointment.statusCode){
      appointment.statusCode = 'pending';
      }
      if(!appointment.typeCode){
        appointment.typeCode = 'individual'
      }

    }
  });
  paginate(Appointment);
  watchChanges(Appointment);
  return Appointment;
};
