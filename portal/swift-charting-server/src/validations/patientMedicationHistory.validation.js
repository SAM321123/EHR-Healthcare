const Joi = require('joi');


const getPaitentMedicationHistory = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    doseCode: Joi.string(),
    searchText: Joi.string(),
    dose: Joi.string(),
    unit: Joi.string(),
    route: Joi.string(),
    frequency: Joi.string(),
    duration: Joi.string(),
    direction: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};


module.exports = {
  getPaitentMedicationHistory,

};
