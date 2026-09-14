const Joi = require('joi');

const createOutOfOfficeSchedule = {
  body: Joi.object().keys({
    staffId: Joi.number().required(),
    locationId: Joi.number().required(),
    startDateTime: Joi.date().iso().required(),
    endDateTime: Joi.date().iso().required(),
  }),
};
const getoooSchedule = {
  query: Joi.object().keys({
    staffId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    isActive: Joi.boolean().default(true),
  }),
};
const updateOooSchedule = {
  params: Joi.object().keys({
    id: Joi.required(),
  }),
  body: Joi.object()
    .keys({
      isDeleted: Joi.boolean(),
    })
};
module.exports = {
  createOutOfOfficeSchedule,
  getoooSchedule,
  updateOooSchedule,
};
