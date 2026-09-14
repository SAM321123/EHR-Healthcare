const models = require('../config/models');

module.exports = (sequelize) => {
  const AppointmentForm = sequelize.define(
    models.APPOINTMENTFORM,
    {

    },
    {
      timestamps: true,
    }
  );
  return AppointmentForm;
};
