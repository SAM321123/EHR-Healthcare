/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplateIntervention = sequelize.define(
    models.TREATMENTPLANTEMPLATEINTERVENTION,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTemplateIntervention);
  return TreatmentPlanTemplateIntervention;
};
