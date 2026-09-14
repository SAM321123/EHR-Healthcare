const Joi = require('joi');

const createEmergencyContact = {
  body: Joi.object().keys({
    emergencyContactName: Joi.string().required(),
    emergencyContactNo: Joi.number().integer().required(),
    description: Joi.string(),
    patientRelationCode: Joi.string().required(),
    patientRelationOther: Joi.string().allow(''),
    isActive: Joi.boolean().default(true),
    isDeleted: Joi.boolean().default(false),
    patientId: Joi.number().integer().required(),
    address: Joi.object().allow(''),
  }),
};

const getEmergencyContact = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getEmergencyContactById = {
  params: Joi.object().keys({
    emergencyContactId: Joi.string().required(),
  }),
};

const updateEmergencyContact = {
  params: Joi.object().keys({
    emergencyContactId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      emergencyContactName: Joi.string(),
      emergencyContactNo: Joi.number().integer(),
      description: Joi.string(),
      patientRelationCode: Joi.string(),
    patientRelationOther: Joi.string().allow(''),
      patientId: Joi.number().integer(),
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),
      address: Joi.object().allow(''),
    })
    .min(1),
};

module.exports = {
  createEmergencyContact,
  getEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
};
