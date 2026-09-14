const Joi = require('joi');

const createHomework = {
  body: Joi.object().keys({
    title: Joi.string().required(),
    patientId: Joi.number().integer().required(),
    ICDId: Joi.number().integer().required(),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(""),
    goalsOfExcercise: Joi.string().required(),
    suggestions: Joi.string().required(),
    isDeleted: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    statusCode: Joi.string().required(),
  }),
};

const getHomework = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateHomework = {
  params: Joi.object().keys({
    homeworkId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      title: Joi.string().allow(null),
      ICDId: Joi.number().integer().allow(null),
      statusCode: Joi.string().allow(null),
      startDate: Joi.date().iso().allow(""),
      endDate: Joi.date().iso().allow(""),
      goalsOfExcercise: Joi.string().allow(null),
      suggestions: Joi.string().allow(null),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
    createHomework,
    getHomework,
    updateHomework,
};
