const Joi = require('joi');

const createFamilyHistory = {
  body: Joi.object().keys({
    relationshipCode: Joi.string().required(),
    conditionCode: Joi.string().required(),
    conditionOther: Joi.string().allow(''),
    statusCode: Joi.string().required(),
    description: Joi.string().allow(""),
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
  }),
};

const getFamilyHistory = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getFamilyHistoryById = {
  params: Joi.object().keys({
    familyHistoryId: Joi.string().required(),
  }),
};

const updateFamilyHistory = {
  params: Joi.object().keys({
    familyHistoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
    relationshipCode: Joi.string().allow(null),
    conditionCode: Joi.string().allow(null),
    statusCode: Joi.string().allow(null),
    conditionOther: Joi.string().allow(''),
    description: Joi.string().allow(""),
    isActive: Joi.boolean(),
    isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  createFamilyHistory,
  getFamilyHistory,
  getFamilyHistoryById,
  updateFamilyHistory,
};
