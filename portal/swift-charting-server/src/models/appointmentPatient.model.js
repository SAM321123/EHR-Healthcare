// models/appointmentPatient.model.js
const models = require('../config/models');

module.exports = (sequelize) => {
  const AppointmentPatient = sequelize.define(
    models.APPOINTMENT_PATIENT,
    {

    },
    {
      timestamps: true,
    }
  );
  return AppointmentPatient;
};
