const Joi = require('joi');

const getStaffBookingSetting = {
  query: Joi.object().keys({
    staffId: Joi.number().integer(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isActive: Joi.boolean().default(true),
  }),
};

const createStaffBookingSetting = {
  body: Joi.object().keys({
    staffId: Joi.number().integer().required(),
    cancellationLeadTime: Joi.string(),
    cancellationRescheduleTime: Joi.string(),
    cancellationPolicyText: Joi.string(),
  }),
};
const updateStaffBookingSetting = {
  params: Joi.object().keys({
    id: Joi.required(),
  }),
  body: Joi.object().keys({
    staffId: Joi.number().integer(),
    cancellationLeadTime: Joi.string().allow(''),
    cancellationRescheduleTime: Joi.string().allow(''),
    cancellationPolicyText: Joi.string().allow(''),
  }),
};
module.exports = {
  getStaffBookingSetting,
  createStaffBookingSetting,
  updateStaffBookingSetting,
};
