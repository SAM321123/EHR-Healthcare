/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplateDiagnosis = sequelize.define(
    models.TREATMENTPLANTEMPLATEDIAGNOSIS,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTemplateDiagnosis);
  return TreatmentPlanTemplateDiagnosis;
};