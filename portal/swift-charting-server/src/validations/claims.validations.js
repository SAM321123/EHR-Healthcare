const Joi = require('joi');

const getClaims = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    patientId: Joi.number(),
    claimStatus: Joi.string(),
  }),
};

module.exports = { getClaims};