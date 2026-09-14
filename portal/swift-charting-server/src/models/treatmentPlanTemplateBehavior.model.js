/* eslint-disable no-param-reassign */
const models = require('../config/models');
const paginate = require('./plugins/paginate.plugin');

module.exports = (sequelize) => {
  const TreatmentPlanTemplateBehavior = sequelize.define(
    models.TREATMENTPLANTEMPLATEBEHAVIOR,
    {
     
    },
    {
      timestamps: true,
    }
  );
  paginate(TreatmentPlanTemplateBehavior);
  return TreatmentPlanTemplateBehavior;
};
