const Joi = require('joi');


const downloadPatientFormPDF = {
  params: Joi.object().keys({
    patientFormId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

const downloadPatientMedicationPDF = {
  params: Joi.object().keys({
    patientMedicationId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

const downloadPatientMedicationMARLogPdf = {
  params: Joi.object().keys({
    patientMedicationItemId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

const downloadPatientEncounterPDF = {
  params: Joi.object().keys({
    patientEncounterId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

const downloadPatientMedicationsMARLogPdf = {
  params: Joi.object().keys({
    patientId: Joi.number().integer(),
    medicationId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

const downloadPatientInvoicePDF = {
  params: Joi.object().keys({
    patientInvoiceId: Joi.number().integer(),
  }),
  query: Joi.object().keys({
    stringBuffer: Joi.boolean(),
  }),
};

module.exports = {
  downloadPatientFormPDF,
  downloadPatientMedicationPDF,
  downloadPatientMedicationMARLogPdf,
  downloadPatientEncounterPDF,
  downloadPatientMedicationsMARLogPdf,
  downloadPatientInvoicePDF,
};
