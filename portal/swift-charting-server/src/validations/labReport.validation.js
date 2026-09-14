const Joi = require('joi');

const getLabReport = {
  query: Joi.object().keys({
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
  }),
};

const updateLabReport = {
  params: Joi.object().keys({
    labReportId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      notes: Joi.string(),
    })
}

module.exports = {
  getLabReport,
  updateLabReport,
};