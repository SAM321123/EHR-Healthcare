const Joi = require('joi');

const uploadPatient = {
    params: Joi.object().keys({
      patientId: Joi.string(),
    }),
  };
  const getPatientEPrescription = {
    params: Joi.object().keys({
      patientId: Joi.string(),
    }),
  };
  module.exports = {
    uploadPatient,
    getPatientEPrescription,
  };
  