const Joi = require('joi');

const createDiagnosis = {
  body: Joi.object().keys({
    problemId: Joi.number().integer().required(),
    ICDId: Joi.number().integer().required(),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(""),
    sexualOrientationCode: Joi.string().allow(null),
    typeCode: Joi.string().allow(null),
    comments: Joi.string().allow(null),
    isDeleted: Joi.boolean().default(false),
    isActive: Joi.number().integer(),
    patientId: Joi.number().integer().required(),
    statusCode: Joi.string().allow(null),
    patientEncounterId:Joi.number(),
  }),
};

const getDiagnosis = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    patientEncounterId:Joi.number(),
  }),
};

const getDiagnosisById = {
  params: Joi.object().keys({
    diagnosisId: Joi.string().required(),
  }),
};

const updateDiagnosis = {
  params: Joi.object().keys({
    diagnosisId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      problemId: Joi.number().integer().allow(null),
      ICDId: Joi.number().integer().allow(null),
      startDate: Joi.date().iso().allow(""),
      endDate: Joi.date().iso().allow(""),
      sexualOrientationCode: Joi.string().allow(null),
      comments: Joi.string().allow(null),
      typeCode: Joi.string().allow(null),
      isActive: Joi.number().integer(),
      statusCode: Joi.string().allow(null),
      isDeleted: Joi.boolean(),
      patientEncounterId:Joi.number(),
    })
    .min(1),
};

module.exports = {
  createDiagnosis,
  getDiagnosis,
  getDiagnosisById,
  updateDiagnosis,
};
