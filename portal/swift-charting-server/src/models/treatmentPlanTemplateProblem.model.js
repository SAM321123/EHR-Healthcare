/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTreatmentProblem = sequelize.define(
    models.TREATMENTPLANTEMPLATEPROBLEM,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTreatmentProblem);
  return TreatmentPlanTreatmentProblem;
};
