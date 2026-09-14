const Joi = require('joi');

const createForm = {
  body: Joi.object().keys({
    socialHistoryCode: Joi.string().allow(null),
    statusCode: Joi.string().allow(null),
    date: Joi.string().isoDate(),
    description: Joi.string().allow(null),
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
  }),
};

const getForms = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFormById = {
  params: Joi.object().keys({
    socialHistoryId: Joi.string().required(),
  }),
};

const updateForm = {
  params: Joi.object().keys({
    formId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      socialHistoryCode: Joi.string().allow(null),
      date: Joi.string().isoDate(),
      description: Joi.string().allow(null),
      statusCode: Joi.string().allow(null),
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  createForm,
  getForms,
  getFormById,
  updateForm,
};
