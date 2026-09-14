const Joi = require('joi');

const createMedicationSchedule = {
  body: Joi.object({
    patientId: Joi.number().required(),
    patientMedicationItemId: Joi.number().required(),
    endDate: Joi.date().required(),
    isOnDay: Joi.boolean().allow(''),
    monthOnDay: Joi.string().allow(''),
    monthWeek: Joi.array(),
    monthWeekDay: Joi.array(),
    repeatEvery:Joi.string().allow(''),
    repeatType: Joi.string().allow(''),
    repeatWeek: Joi.array().allow(''),
    startDate: Joi.date().required(),
    timeSlots: Joi.array(),
  }),
};

// const getPaitentMedication = {
//   query: Joi.object().keys({
//     patientId: Joi.number().integer(),
//     doseCode: Joi.string(),
//     searchText: Joi.string(),
//     dose: Joi.string(),
//     unit: Joi.string(),
//     route: Joi.string(),
//     frequency: Joi.string(),
//     duration: Joi.string(),
//     direction: Joi.string(),
//     subscribeSocket: Joi.bool(),
//     sortBy: Joi.string(),
//     limit: Joi.number().integer(),
//     page: Joi.number().integer(),
//     patientEncounterId: Joi.number(),
//   }),
// };

const updateMedicationSchedule = {
  params: Joi.object().keys({
    scheduleId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      endDate: Joi.date().allow(null),
      isOnDay: Joi.boolean().allow(''),
      monthOnDay: Joi.string().allow(null), 
      monthWeek: Joi.array().allow(null),
      monthWeekDay: Joi.array().allow(null),
      repeatEvery:Joi.string().allow(null),
      repeatType: Joi.string().allow(null),
      repeatWeek: Joi.array().allow(null),
      timeSlots: Joi.array(),
    })
}

module.exports = {
    createMedicationSchedule,
    updateMedicationSchedule
//   getPaitentMedication,
};
