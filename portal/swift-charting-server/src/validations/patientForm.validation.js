const Joi = require('joi');
const { models } = require('../config/models');
const { objectId } = require('./custom.validation');

const createPatientForm = {
  body: Joi.object().keys({
    patientId: Joi.number().integer().required(),
    formId: Joi.number().integer().required(),
    practitionerId: Joi.number().integer(),
    patientFormSubmissionId:Joi.number().integer(),
    sharedById: Joi.number().integer(),
  }),
};

const shareNoteTemplate = {
  body: Joi.object().keys({
    sharedWith: Joi.string(),
    faxContactId:Joi.number().integer() ,
    faxType: Joi.string(),
    shareOn: Joi.string(),
    faxEmail: Joi.string(),
  }),
};

const getPatientForms = {
  query: Joi.object().keys({
    patientId:Joi.number().integer(),
    formType: Joi.string(),
    practitionerId:Joi.number().integer(),
    patientFormSubmissionId:Joi.number().integer(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    subscribeSocket: Joi.boolean(),
  }),
};

const getPatientForm = {
  params: Joi.object().keys({
    patientFormId: Joi.number().integer().required(),
  }),
};

const updatePatientForm = {
  params: Joi.object().keys({
    patientFormId:Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      patientId: Joi.number().integer(),
      formId: Joi.number().integer(),
      practitionerId: Joi.number().integer(),
      patientFormSubmissionId: Joi.number().integer(),
      status: Joi.string(),
    })
    .min(1),
};


module.exports = {
  createPatientForm,
  getPatientForms,
  getPatientForm,
  updatePatientForm,
  shareNoteTemplate,
};
