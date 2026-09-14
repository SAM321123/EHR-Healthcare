const Joi = require('joi');

const getProblemBehavior = {
  query: Joi.object().keys({
    problemId: Joi.number().integer().required(),
    limit: Joi.number().integer(),
  }),
};

module.exports = {
    getProblemBehavior,
};
