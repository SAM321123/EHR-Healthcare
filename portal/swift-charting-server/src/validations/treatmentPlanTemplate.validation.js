const Joi = require('joi');

const createTreatmentPlanTemplate = {
  body: Joi.object({
    diagnoses: Joi.array().required(),
    problemList: Joi.object().required(),
    behaviorList: Joi.object().required(),
    goalList: Joi.object().required(),
    objectiveList: Joi.object().required(),
    interventionList: Joi.object().required(),
    templateName:  Joi.string().required(),
    templateDescription: Joi.string(),
    isActive: Joi.boolean(),
  }),
};
const getTreatmentPlanTemplate = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isActive: Joi.boolean(),
  }),
};
const updateTreatmentPlanTemplate = {
  params: Joi.object().keys({
    templateId: Joi.string().required(),
  }),
  body: Joi.object({
    diagnoses: Joi.array(),
    problemList: Joi.object(),
    behaviorList: Joi.object(),
    goalList: Joi.object(),
    objectiveList: Joi.object(),
    interventionList: Joi.object(),
    isDeleted: Joi.boolean(),
    templateName: Joi.string().allow(''),
    templateDescription :Joi.string().allow(''),
  }),
};


module.exports = {
  createTreatmentPlanTemplate,
  getTreatmentPlanTemplate,
  updateTreatmentPlanTemplate,
};
