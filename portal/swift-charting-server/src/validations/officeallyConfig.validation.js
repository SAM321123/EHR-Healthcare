const Joi = require('joi');

const createOfficeallyConfig = {
  body: Joi.object().keys({
    appName: Joi.string().required(),
    practiceId: Joi.number().integer().required(),
    officeallyKey: Joi.string().required(),
  }),
};
const getOfficeallyConfigs = {
  query: Joi.object().keys({
    appName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
  }),
};
const updateOfficeallyConfig = {
  params: Joi.object().keys({
    officeallyConfigId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      appName: Joi.string(),
      officeallyKey: Joi.string(),
      isDeleted: Joi.boolean(),
      practiceId: Joi.number().integer(),
    })
    .min(1),
};
const getOfficeallyConfig = {
  params: Joi.object().keys({
    officeallyConfigId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createOfficeallyConfig,
  getOfficeallyConfigs,
  updateOfficeallyConfig,
  getOfficeallyConfig,
};
