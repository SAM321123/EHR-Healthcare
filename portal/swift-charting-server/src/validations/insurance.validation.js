const Joi = require('joi');

const createInsurance = {
  body: Joi.object().keys({
    haveSecondary:Joi.boolean().required(),
    primary:Joi.array().allow(null),
    secondary:Joi.array().allow(null),
    patientId: Joi.number().integer().required(),
  }),
};

const getInsurance = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getInsuranceById = {
  params: Joi.object().keys({
    insuranceId: Joi.string().required(),
  }),
};

const updateInsurance = {
  params: Joi.object().keys({
    insuranceId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      billingType:Joi.string().required(),
    haveSecondary:Joi.boolean().required(),
    primary:Joi.array().allow(null),
    secondary:Joi.array().allow(null),
    })
    .min(1),
};

module.exports = {
  createInsurance,
  getInsurance,
  getInsuranceById,
  updateInsurance,
};
