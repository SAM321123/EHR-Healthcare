const Joi = require('joi');

const getIcdProblem = {
  query: Joi.object().keys({
    icdId: Joi.number().integer().required(),
    limit: Joi.number().integer(),
  }),
};

module.exports = {
    getIcdProblem,
};
