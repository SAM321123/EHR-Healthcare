const Joi = require('joi');

const createFaxHistory = {
  body: Joi.object().keys({
    faxContactId: Joi.number().integer(),
    faxType: Joi.string().required(),
    patientMedicationId: Joi.number().integer(),
    patientFormId: Joi.number().integer(),
  }),
};

const getFaxHistories = {
  query: Joi.object().keys({
    faxContact: Joi.number().integer(),
    faxType: Joi.string(),
    status: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
    isActive: Joi.boolean(),
  }),
};

const getFaxHistory = {
  params: Joi.object().keys({
    faxHistoryId: Joi.number().integer().required(),
  }),
};

const updateFaxHistory = {
  params: Joi.object().keys({
    faxHistoryId: Joi.number().integer().required(),
  }),
  body: Joi.object().keys({
    status: Joi.string(),
  }),
};

module.exports = {
  createFaxHistory,
  getFaxHistories,
  getFaxHistory,
  updateFaxHistory,
};
