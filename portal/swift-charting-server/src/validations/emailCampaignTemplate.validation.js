const Joi = require('joi');

const getEmailCampaignTemplates = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
  }),
};

const createEmailCampaignTemplate = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    subject: Joi.string().required(),
    replyTo: Joi.string().email(),
    template: Joi.string().required(),
  }),
};

const updateEmailCampaignTemplate = {
  params: Joi.object().keys({
    templateId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().allow(''),
      subject: Joi.string().allow(''),
      replyTo: Joi.string().email(),
      template: Joi.string().allow(''),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

module.exports = {
  getEmailCampaignTemplates,
  createEmailCampaignTemplate,
  updateEmailCampaignTemplate,
};