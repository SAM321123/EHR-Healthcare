const Joi = require('joi');

const createEncounters = {
  body: Joi.object().keys({
    patientId: Joi.number().integer().required(),
    encounterTypeCode: Joi.string().required(),
    behavior: Joi.string().allow(null),
    intervention: Joi.string().allow(null),
    response: Joi.string().allow(null),
    birpPlan: Joi.string().allow(null),
    data: Joi.string().allow(null),
    assessment: Joi.string().allow(null),
    dapPlan: Joi.string().allow(null),
    assignedToId: Joi.number().integer().required(),
    duration: Joi.string(),
    startDate: Joi.date().iso().allow(null),
    billingTypeCode: Joi.string(),
    endDate: Joi.date().iso().allow(null),
    additionalFields: Joi.string(),
    dynamicForms: Joi.object(),
    allergies: Joi.array(),
    vitals: Joi.array(),
    medications: Joi.array(),
    labOrders: Joi.array(),
    diagnosis: Joi.array(),
    atDraft: Joi.bool(),
    soapForm: Joi.object().allow(null),
    selectedForms:Joi.object().allow(null),
    signature:Joi.string().allow(''),
  }),
};

const getEncounters = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    practitionerId: Joi.number().integer(),
    encounterTypeCode: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    atDraft:Joi.bool(),
  }),
};

const getEncounterById = {
  params: Joi.object().keys({
    encounterId: Joi.number().integer(),
  }),
};


const updateEncounter = {
  params: Joi.object().keys({
    encounterId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      patientId: Joi.number().integer(),
    encounterTypeCode: Joi.string(),
    assignedToId: Joi.number().integer(),
    behavior:Joi.string().allow(null),
    intervention:Joi.string().allow(null),
    response:Joi.string().allow(null),
    birpPlan:Joi.string().allow(null),
    data: Joi.string().allow(null),
    assessment:Joi.string().allow(null),
    dapPlan:Joi.string().allow(null),
    duration: Joi.string().allow(''),
    startDate: Joi.date().iso().allow(null),
    billingTypeCode: Joi.string().allow(null),
    endDate: Joi.date().iso().allow(null),
    additionalFields: Joi.string(),
    dynamicForms: Joi.object(),
    allergies: Joi.array(),
    vitals: Joi.array(),
    medications: Joi.array(),
    labOrders: Joi.array(),
    diagnosis: Joi.array(),
    atDraft: Joi.bool(),
    soapForm: Joi.object().allow(null),
    selectedForms:Joi.object().allow(null),
      isDeleted:Joi.bool(),
      signature:Joi.string().allow(''),
    })
    .min(1),
};

module.exports = {
  createEncounters,
  getEncounters,
  updateEncounter,
  getEncounterById,
};