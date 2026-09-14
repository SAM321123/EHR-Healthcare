const { response } = require('express');
const Joi = require('joi');

const createMedicalHistory = {
  body: Joi.object().keys({
    underPhysician: Joi.number().integer().default(0),
    underPhysicianComment: Joi.string().allow(''),
    everUnderPhysician: Joi.number().integer().default(0),
    everUnderPhysicianComment: Joi.string().allow(''),
    injury: Joi.number().integer().default(0),
    injuryComment: Joi.string().allow(''),
    takingDrugs: Joi.number().integer().default(0),
    takingDrugsComment: Joi.string().allow(''),
    takenRedux: Joi.number().integer().default(0),
    takenReduxComment: Joi.string().allow(''),
    takenFosamax: Joi.number().integer().default(0),
    takenFosamaxComment: Joi.string().allow(''),
    onDiet: Joi.number().integer().default(0),
    onDietComment: Joi.string().allow(''),
    useTobacco: Joi.number().integer().default(0),
    useTobaccoComment: Joi.string().allow(''),
    useSubstances: Joi.number().integer().default(0),
    useSubstancesComment: Joi.string().allow(''),
    condition: Joi.string().allow(''),
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
    response:Joi.string(),
    questions:Joi.string(),

  }),
};

const getMedicalHistory = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getMedicalHistoryById = {
  params: Joi.object().keys({
    medicalHistoryId: Joi.string().required(),
  }),
};

const updateMedicalHistory = {
  params: Joi.object().keys({
    medicalHistoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      underPhysician: Joi.number().integer(),
      underPhysicianComment: Joi.string().allow(''),
      everUnderPhysician: Joi.number().integer(),
      everUnderPhysicianComment: Joi.string().allow(''),
      injury: Joi.number().integer(),
      injuryComment: Joi.string().allow(''),
      takingDrugs: Joi.number().integer(),
      takingDrugsComment: Joi.string().allow(''),
      takenRedux: Joi.number().integer(),
      takenReduxComment: Joi.string().allow(''),
      takenFosamax: Joi.number().integer(),
      takenFosamaxComment: Joi.string().allow(''),
      onDiet: Joi.number().integer(),
      onDietComment: Joi.string().allow(''),
      useTobacco: Joi.number().integer(),
      useTobaccoComment: Joi.string().allow(''),
      useSubstances: Joi.number().integer(),
      useSubstancesComment: Joi.string().allow(''),
      condition: Joi.string().allow(''),
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  createMedicalHistory,
  getMedicalHistory,
  getMedicalHistoryById,
  updateMedicalHistory,
};
