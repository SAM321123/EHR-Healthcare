const Joi = require('joi');

const getGoalObjective = {
  query: Joi.object().keys({
    goalId: Joi.number().integer().required(),
    limit: Joi.number().integer(),
  }),
};
module.exports = {
  getGoalObjective,
};
