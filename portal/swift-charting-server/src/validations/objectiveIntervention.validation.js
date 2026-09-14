const Joi = require('joi');

const getObjectiveIntervention = {
  query: Joi.object().keys({
    objectiveId: Joi.number().integer().required(),
    limit: Joi.number().integer(),
  }),
};

module.exports = {
  getObjectiveIntervention,
};
