const Joi = require('joi');

const createMdTollboxConfig = {
  body: Joi.object().keys({
    appName: Joi.string().required(),
    practiceId: Joi.number().integer().required(),
    mdToolboxKey: Joi.string().required(),
  }),
};
const getMdToolboxConfigs = {
  query: Joi.object().keys({
    appName: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
  }),
};
const updateMdToolboxConfig = {
  params: Joi.object().keys({
    mdToolboxConfigId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      appName: Joi.string(),
      mdToolboxKey: Joi.string(),
      isDeleted: Joi.boolean(),
      practiceId: Joi.number().integer(),
    })
    .min(1),
};
const getMdToolboxConfig = {
  params: Joi.object().keys({
    mdToolboxConfigId: Joi.number().integer().required(),
  }),
};

module.exports = {
  createMdTollboxConfig,
  getMdToolboxConfigs,
  updateMdToolboxConfig,
  getMdToolboxConfig,
};
