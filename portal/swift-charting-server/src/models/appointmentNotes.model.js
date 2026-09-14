/* eslint-disable no-param-reassign */
const { DataTypes } = require('sequelize');
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');
const watchChanges = require('./plugins/socket.plugin');

module.exports = (sequelize) => {
  const AppointmentNotes = sequelize.define(
    models.APPOINTMENT_NOTES,
    {
      appointmentId: {
        type: DataTypes.INTEGER,
      },
      note: {
        type: DataTypes.TEXT('long'),
      },
      createdById: {
        type: DataTypes.INTEGER,
      },
    },
    {
      timestamps: true,
      indexes: [
        {
          name: 'notes_appointment_id',
          fields: ['appointmentId']
        }
      ]
    }
  );
  paginate(AppointmentNotes);
  watchChanges(AppointmentNotes);
  return AppointmentNotes;
};
