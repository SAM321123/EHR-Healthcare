/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanIntervention = sequelize.define(
    models.TREATMENTPLANINTERVENTION,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanIntervention);
  return TreatmentPlanIntervention;
};
