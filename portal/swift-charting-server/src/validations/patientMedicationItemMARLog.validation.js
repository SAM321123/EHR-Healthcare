const Joi = require('joi');

const createPatientMedicationItemMARLog = {
  body: Joi.object().keys({
    patientMedicationItemId: Joi.number().integer(),
    actionCode: Joi.string().required(),
    date:Joi.date(),
    slotDate:Joi.date(),
    clinicianId:Joi.number().integer(),
    comment:Joi.string(),
    refusedReason:Joi.string(),
    overrideReason: Joi.string(),
    clinicianInitial:Joi.string(),
    givenByCaregiver:Joi.bool(),
  }),
};

const updatePatientMedicationItemMARLog = {
  params: Joi.object().keys({
    patientMARId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      patientMedicationItemId: Joi.number().integer(),
      actionCode: Joi.string().allow(''),
      date:Joi.date(),
      clinicianId:Joi.number().integer(),
      comment:Joi.string().allow(''),
      refusedReason:Joi.string().allow(''),
      clinicianInitial:Joi.string().allow(''),
      givenByCaregiver:Joi.bool(),  
      overrideReason: Joi.string().allow(''),
    })
    .min(1),
};

module.exports = {
  createPatientMedicationItemMARLog,
  updatePatientMedicationItemMARLog,
};
