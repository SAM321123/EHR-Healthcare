const Joi = require('joi');

const createPatientDocument = {
  body: Joi.object().keys({
    fileId: Joi.number().integer().required(),
    date: Joi.date().iso().allow(null),
    title: Joi.string().required(),
    typeCode: Joi.string().required(),
    description: Joi.string().allow(null),
    isDeleted: Joi.boolean().default(false),
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
    providerId: Joi.number().integer().allow(null),
  }),
};

const getPatientDocument = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getPatientDocumentById = {
  params: Joi.object().keys({
    patientDocumentId: Joi.string().required(),
  }),
};

const updatePatientDocument = {
  params: Joi.object().keys({
    patientDocumentId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      fileId: Joi.number().integer(),
      date: Joi.date().iso(),
      title: Joi.string(),
      typeCode: Joi.string(),
      description: Joi.string(),
      isDeleted: Joi.boolean().default(false),
      isActive: Joi.boolean().default(true),
      patientId: Joi.number().integer(),
    })
    .min(1),
};

module.exports = {
  createPatientDocument,
  getPatientDocument,
  getPatientDocumentById,
  updatePatientDocument,
};
