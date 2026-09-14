const Joi = require('joi');

const getForms = {
    query: Joi.object().keys({
      name: Joi.string(),
      sortBy: Joi.string(),
      limit: Joi.number().integer(),
      page: Joi.number().integer(),
      searchText: Joi.string(),
    }),
  };

  const createForm = {
    body: Joi.object().keys({
      id: Joi.number().integer().required(),
      name: Joi.string().required(),
      formCategory: Joi.object().required(),
    }),
  };
  module.exports = {
    getForms,
    createForm,
  };