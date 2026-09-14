/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanObjective = sequelize.define(
    models.TREATMENTPLANOBJECTIVE,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanObjective);
  return TreatmentPlanObjective;
};
