/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanBehavior = sequelize.define(
    models.TREATMENTPLANBEHAVIOR,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanBehavior);
  return TreatmentPlanBehavior;
};
