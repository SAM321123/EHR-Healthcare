/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanDiagnosis = sequelize.define(
    models.TREATMENTPLANDIAGNOSIS,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanDiagnosis);
  return TreatmentPlanDiagnosis;
};