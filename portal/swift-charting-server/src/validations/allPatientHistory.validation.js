const { response } = require('express');
const Joi = require('joi');

const createAllPatientHistory = {
  body: Joi.object().keys({
    isActive: Joi.boolean().default(true),
    patientId: Joi.number().integer().required(),
    response:Joi.string(),
    questions:Joi.string(),
    rules:Joi.string(),
    typeCode:Joi.string().required(),
  }),
};

const getAllPatientHistory = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    typeCode:Joi.string(),
  }),
};

const getAllPatientHistoryById = {
  params: Joi.object().keys({
    medicalHistoryId: Joi.string().required(),
  }),
};

const updateAllPatientHistory = {
  params: Joi.object().keys({
    medicalHistoryId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      isActive: Joi.boolean(),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  createAllPatientHistory,
  getAllPatientHistory,
  getAllPatientHistoryById,
  updateAllPatientHistory,
};
