/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const CalendarSchedule = sequelize.define(
    models.CALENDAR_SCHEDULE,
    {
      staffId: {
        type: DataTypes.INTEGER,
      },
      startDateTime: {
        type: DataTypes.DATE,
      },
      newPatient:{
        type: DataTypes.BOOLEAN,
      },
      existingPatient:{
        type: DataTypes.BOOLEAN,
      },
      endDateTime: {
        type: DataTypes.DATE,
      },
      shiftTitle: {
        type: DataTypes.STRING,
      },
      locationId: {
        type: DataTypes.INTEGER,
      },
      calendarScheduleRecurringSettingId: {
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
        type: DataTypes.BOOLEAN,
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
          name: 'schedule_staff_id',
          fields: ['staffId']
        },
        {
          name: 'start_date_time',
          fields: ['startDateTime']
        },
        {
          name: 'end_date_time',
          fields: ['endDateTime']
        },
        {
          name: 'schedule_location_id',
          fields: ['locationId']
        },
        {
          name: 'schedule_is_deleted',
          fields: ['isDeleted']
        },
      ]
    }
  );
//   Appointment.beforeBulkCreate(async (appointments) => {
//     for(let appointment of appointments){
//       if(!appointment.statusCode){
//       appointment.statusCode = 'pending';
//       }
//       if(!appointment.typeCode){
//         appointment.typeCode = 'individual'
//       }

//     }
//   });
  paginate(CalendarSchedule);
  return CalendarSchedule;
};
