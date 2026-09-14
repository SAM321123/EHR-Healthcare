const Joi = require('joi');

const getComposeMail = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const createComposeMail = {
  body: Joi.object().keys({
    sendTo: Joi.string().required(),
    templateName: Joi.string().required(),
    patients: Joi.array().allow(''),
  }),
};

module.exports = { getComposeMail, createComposeMail};