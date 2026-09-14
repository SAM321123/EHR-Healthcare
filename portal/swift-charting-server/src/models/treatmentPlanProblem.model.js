/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanProblem = sequelize.define(
    models.TREATMENTPLANPROBLEM,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanProblem);
  return TreatmentPlanProblem;
};
