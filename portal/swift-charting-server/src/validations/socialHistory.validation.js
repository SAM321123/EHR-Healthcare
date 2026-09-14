const Joi = require('joi');

const createSocialHistory = {
  body: Joi.object().keys({
    socialHistoryCode: Joi.string().allow(null),
    statusCode: Joi.string().allow(null),
    date: Joi.string().isoDate(),
    description: Joi.string().allow(null),
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
    socialHistoryOther:Joi.string().allow('')
  }),
};

const getSocialHistory = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getSocialHistoryById = {
  params: Joi.object().keys({
    socialHistoryId: Joi.string().required(),
  }),
};

const updateSocialHistory = {
  params: Joi.object().keys({
    socialHistoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      socialHistoryCode: Joi.string().allow(null),
      date: Joi.string().isoDate(),
      description: Joi.string().allow(null),
      statusCode: Joi.string().allow(null),
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),
    socialHistoryOther:Joi.string().allow('')

    })
    .min(1),
};

module.exports = {
  createSocialHistory,
  getSocialHistory,
  getSocialHistoryById,
  updateSocialHistory,
};
