const Joi = require('joi');

const createAppointment = {
  body: Joi.object().keys({
    reasonForAppointment: Joi.string().allow(''),
    ICDId: Joi.number().integer().required(),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(''),
    sexualOrientationCode: Joi.string().allow(null),
    typeCode: Joi.string().required(),
    comments: Joi.string().allow(null),
    isDeleted: Joi.boolean().default(false),
    isActive: Joi.number().integer(),
    patientId: Joi.number().integer().required(),
    statusCode: Joi.string().allow(null),
    confirmOnIntake: Joi.boolean().default(false),
    formId: Joi.number().integer(),
    isVirtual: Joi.boolean().default(false),
  }),
};

const getAppointment = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const getAppointmentById = {
  params: Joi.object().keys({
    diagnosisId: Joi.string().required(),
  }),
};

const createAppleCalanderEvent = {
  params: Joi.object().keys({
    appointmentId: Joi.string().required(),
  }),
};

const updateAppointment = {
  params: Joi.object().keys({
    diagnosisId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      reasonForAppointment: Joi.string().allow(''),
      ICDId: Joi.number().integer().allow(null),
      startDate: Joi.date().iso().allow(''),
      endDate: Joi.date().iso().allow(''),
      sexualOrientationCode: Joi.string().allow(null),
      comments: Joi.string().allow(null),
      typeCode: Joi.string().allow(null),
      isActive: Joi.number().integer(),
      statusCode: Joi.string().allow(null),
      isDeleted: Joi.boolean(),
      confirmOnIntake: Joi.boolean(),
      formId: Joi.number().integer(),
      isVirtual: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  createAppointment,
  getAppointment,
  getAppointmentById,
  updateAppointment,
  createAppleCalanderEvent,
};
