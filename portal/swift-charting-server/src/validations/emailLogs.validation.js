const Joi = require('joi');

const getEmailLogs = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    timezone: Joi.string(),
    from: Joi.string(),
    to: Joi.string(),
  }),
};

module.exports = { getEmailLogs};