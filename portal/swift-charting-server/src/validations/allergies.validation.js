const Joi = require('joi');

const createAllergies = {
  body: Joi.object().keys({
    allergy: Joi.string().required(),
    patientId: Joi.number().integer().required(),
    reactionCode: Joi.array().required(),
    severitiesCode: Joi.string().allow(null),
    dateOfOnSet: Joi.string().required(),
    comment: Joi.string().allow(null),
    isActive: Joi.bool(),
    patientEncounterId:Joi.number(),
  }),
};

const getAllergies = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    patientId: Joi.number(),
  }),
};

const getAllergiesById = {
  params: Joi.object().keys({
    allergiesId: Joi.string(),
  }),
  query: Joi.object().keys({
    subscribeSocket: Joi.boolean(),
    patientId: Joi.number(),
  }),
};

const updateAllergies = {
  params: Joi.object().keys({
    allergiesId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      allergy: Joi.string(),
      reactionCode: Joi.array(),
      severitiesCode: Joi.string().allow(null),
      dateOfOnSet: Joi.string(),
      comment: Joi.string().allow(null),
      isActive: Joi.bool(),
      isDeleted: Joi.bool(),
    patientEncounterId:Joi.number(),

    })
    .min(1),
};

module.exports = {
  createAllergies,
  getAllergies,
  getAllergiesById,
  updateAllergies,
};
