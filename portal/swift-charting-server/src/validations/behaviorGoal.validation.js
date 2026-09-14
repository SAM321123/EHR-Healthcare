const Joi = require('joi');

const getBehaviorGoal = {
  query: Joi.object().keys({
    behaviorId: Joi.number().integer(),
    limit: Joi.number().integer(),
  }),
};
module.exports = {
  getBehaviorGoal,
};
