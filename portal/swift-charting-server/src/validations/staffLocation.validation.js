const Joi = require('joi');

const getLocation = {
  query: Joi.object().keys({
    staffId: Joi.number().integer(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isActive: Joi.boolean().default(true),
    isActiveSchedule: Joi.boolean(),
  }),
};

const createLocation = {
  body: Joi.object().keys({
    staffId: Joi.number().integer().required(),
    locationId: Joi.number().integer().required(),
    leadDays: Joi.string().required(),
    appointmentConfirmation: Joi.string().required(),
    leadInterval: Joi.string(),
    appointmentInterval: Joi.string().required(),
    preferredScheduleCode: Joi.string().required(),
    schedule: Joi.array().items(
      Joi.object({
        day: Joi.string().required(),
        endHrs: Joi.string().required(),
        isClosed: Joi.boolean(),
        startHrs: Joi.string().required(),
      }).required()
    ),
    hidePricesForOnlineAppointments: Joi.boolean().allow(null, ''),
    hideDurationsForOnlineAppointments: Joi.boolean().allow(null, ''),
    showPractitionerSelector: Joi.string().allow(null, ''),
    howFarInFuture: Joi.string().allow(null, ''),
    sendAppointmentConfirmationThroughTextAlso: Joi.string().allow(null, ''),
    paymentForBooking: Joi.string().allow(null, ''),
    depositAmount: Joi.number().allow(null, ''),
    textTemplateForPatientConfirmation: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null, ''),
  }),
};
const updateLocation = {
  params: Joi.object().keys({
    id: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      locationId: Joi.number().integer(),
      staffId: Joi.number().integer(),
      isDeleted: Joi.boolean(),
      leadDays: Joi.string(),
      appointmentConfirmation: Joi.string(),
      leadInterval: Joi.string().allow(null),
      appointmentInterval: Joi.string(),
      preferredScheduleCode: Joi.string(),
      schedule: Joi.array().items(
        Joi.object({
          day: Joi.string().required(),
          endHrs: Joi.string().required(),
          isClosed: Joi.boolean(),
          startHrs: Joi.string().required(),
        }).required()
      ),
      hidePricesForOnlineAppointments: Joi.boolean().allow(null, ''),
      hideDurationsForOnlineAppointments: Joi.boolean().allow(null, ''),
      showPractitionerSelector: Joi.string().allow(null, ''),
      howFarInFuture: Joi.string().allow(null, ''),
      sendAppointmentConfirmationThroughTextAlso: Joi.string().allow(null, ''),
      paymentForBooking: Joi.string().allow(null, ''),
      depositAmount: Joi.number().allow(null, ''),
      textTemplateForPatientConfirmation: Joi.alternatives().try(Joi.string(), Joi.number()).allow(null, ''),
    })
    .min(1),
};
const setPrimaryLocation = {
  params: Joi.object().keys({
    id: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      isPrimaryLocation: Joi.boolean().required(),
      staffId: Joi.number().integer().required(),
    })
    .min(1),
};
module.exports = {
  getLocation,
  createLocation,
  updateLocation,
  setPrimaryLocation,
};
