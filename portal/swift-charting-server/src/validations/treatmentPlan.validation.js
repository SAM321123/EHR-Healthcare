const Joi = require('joi');

const createTreatmentPlan = {
  body: Joi.object({
    patientId: Joi.number().required(),
    diagnoses: Joi.array().required(),
    problemList: Joi.object().required(),
    behaviorList: Joi.object().required(),
    goalList: Joi.object().required(),
    objectiveList: Joi.object().required(),
    interventionList: Joi.object().required(),
    startDate: Joi.string().required(),
    endDate: Joi.string().required(),
    treatmentDays: Joi.string().allow(''),
    isActive: Joi.boolean(),
    treatmentDays: Joi.string().allow(''),
    isActive: Joi.boolean(),
    templateName: Joi.string().allow(null),
    templateDescription :Joi.string().allow(null),
    addTreatmentPlanTemplate :Joi.boolean(),
    templateId: Joi.number(),
    editTreatmentPlanTemplate:Joi.boolean(),


  }),
};
const getTreatmentPlans = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    patientId: Joi.number(),
  }),
};
const updateTreatmentPlan = {
  params: Joi.object().keys({
    treatmentPlanId: Joi.string().required(),
  }),
  body: Joi.object({
    patientId: Joi.number(),
    diagnoses: Joi.array(),
    problemList: Joi.object(),
    behaviorList: Joi.object(),
    goalList: Joi.object(),
    objectiveList: Joi.object(),
    interventionList: Joi.object(),
    startDate: Joi.string(),
    endDate: Joi.string(),
    treatmentDays: Joi.string(),
    isDeleted: Joi.boolean(),
    statusCode: Joi.string(),
    templateName: Joi.string().allow(null),
    templateDescription :Joi.string().allow(null),
    addTreatmentPlanTemplate :Joi.boolean(),
  }),
};

module.exports = {
  getTreatmentPlans,
  createTreatmentPlan,
  updateTreatmentPlan,
};
