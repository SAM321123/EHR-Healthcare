const Joi = require("joi");
const { roles } = require("../config/roles");


const createPatientFormSubmission = {
    body: Joi.object().keys({
      patientFormId: Joi.number().integer().required(),
      signature: Joi.string().allow(''),
      response: Joi.string(),
      submittedBy: Joi.number().integer().required(),
      submittedByRole: Joi.string().valid(roles.PATIENT, roles.PRACTITIONER, roles.ASSISTANT, roles.CLINIC_ADMIN).required(),
      tags: Joi.array(),
      isPosted: Joi.boolean(),
    }),
  };
  
  const updatePatientFormSubmission = {
    params: Joi.object().keys({
      patientFormSubmissionId: Joi.number().integer().required(),
    }),
    body: Joi.object().keys({
      submittedBy: Joi.number().integer().required(),
      submittedByRole: Joi.string().valid(roles.PRACTITIONER).required(),
      signature: Joi.string(),
    }),
  };  
  
  module.exports={
    createPatientFormSubmission,
    updatePatientFormSubmission,
  }