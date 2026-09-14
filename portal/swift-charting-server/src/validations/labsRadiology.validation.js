const Joi = require('joi');

const createLabsRadiology = {
  body: Joi.object().keys({
    providerId:  Joi.number().integer().required(),
    processingOrderProviderId: Joi.number().integer(),
    diagnosisIcdId: Joi.number().integer().required(),
    laboratoryTestIds: Joi.array(),
    otherLaboratoryTest:Joi.array().allow(''),
    priority: Joi.string(),
    patientId: Joi.number().integer().required(),
    sendingDetails: Joi.boolean().default(false),
    testingLabId: Joi.number().integer(),
    barCode: Joi.string(),
    sendToLab:Joi.boolean().default(false),
    hl7VersionCode: Joi.string(),
    sendingApplication: Joi.string(),
    sendingFacilityId: Joi.number().integer(),
    patientDiagnosisId:Joi.number().integer().allow(null),
    requiredTestingTime: Joi.string().allow(''),
    specimenTypeCode:Joi.array(),
    siteOfCollection:Joi.string().allow(''),
    collectionDateTime: Joi.date().iso().allow(null),
    specimenQuantity:Joi.number().integer(),
    specimenVolume:Joi.number().integer(),
    clinicalInfo:Joi.string().allow(''),
    suspectedCondition: Joi.array().allow(''),
    fasting:Joi.number().integer(),
    sensitiveInsTime:Joi.string().allow(''),
    patientPrepIns:Joi.string().allow(''),
    allergies:Joi.array().allow(''),
    medicalHistory:Joi.array().allow(''),
    payer: Joi.string(),
    patientEncounterId:Joi.number(),
    signature: Joi.string().allow(''),
    statusCode:Joi.string().allow(''),
  }),
};
const updateLabsRadiology = {
  params: Joi.object().keys({
    labsRadiologyId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      providerId:  Joi.number().integer(),
      processingOrderProviderId: Joi.number().integer(),
      diagnosisIcdId: Joi.number().integer(),
      laboratoryTestIds: Joi.array(),
      otherLaboratoryTest:Joi.array().allow(''),
      priority: Joi.string(),
      stat: Joi.string(),
      patientId: Joi.number().integer(),
      sendingDetails: Joi.boolean(),
      testingLabId: Joi.number().integer(),
      barCode: Joi.string(),
      sendToLab:Joi.boolean().default(false),
      hl7VersionCode: Joi.string(),
      sendingApplication: Joi.string().allow(''),
      sendingFacilityId: Joi.number().integer(),
      patientDiagnosisId:Joi.number().integer().allow(null),
      requiredTestingTime: Joi.string().allow(''),
      specimenTypeCode:Joi.array(),
      siteOfCollection:Joi.string().allow(''),
      collectionDateTime: Joi.date().iso().allow(null),
      specimenQuantity:Joi.number().integer().allow(''),
      specimenVolume:Joi.number().integer().allow(''),
      clinicalInfo:Joi.string(),
      suspectedCondition:Joi.array(),
      fasting:Joi.number().integer(),
      sensitiveInsTime:Joi.string().allow(''),
      patientPrepIns:Joi.string().allow(''),
      allergies:Joi.array().allow(''),
      medicalHistory:Joi.array().allow(''),
      statusCode:Joi.string().allow(''),
      isDeleted: Joi.boolean(),
      payer: Joi.string(),
      patientEncounterId:Joi.number(),
      signature: Joi.string().allow('')
    })
    .min(1),
};

const getLabsRadiology = {
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


module.exports = {
  createLabsRadiology,
  updateLabsRadiology,
  getLabsRadiology,
};