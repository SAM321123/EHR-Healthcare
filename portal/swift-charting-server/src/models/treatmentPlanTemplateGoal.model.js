/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplateGoal = sequelize.define(
    models.TREATMENTPLANTEMPLATEGOAL,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTemplateGoal);
  return TreatmentPlanTemplateGoal;
};
