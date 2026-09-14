/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanGoal = sequelize.define(
    models.TREATMENTPLANGOAL,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanGoal);
  return TreatmentPlanGoal;
};
