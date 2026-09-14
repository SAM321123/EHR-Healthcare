/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplateObjective = sequelize.define(
    models.TREATMENTPLANTEMPLATEOBJECTIVE,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTemplateObjective);
  return TreatmentPlanTemplateObjective;
};
