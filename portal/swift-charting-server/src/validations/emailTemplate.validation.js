const Joi = require('joi');

const getEmailTemplates = {
  query: Joi.object().keys({
    name: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    searchText: Joi.string(),
  }),
};

const createEmailTemplate = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    emailTypeCode: Joi.string().required(),
    subject: Joi.string().required(),
    replyTo: Joi.string().email(),
    typeCode: Joi.string().allow(null),
    template: Joi.string().required(),
  }),
};
const sendBirthdayMail = {
  body: Joi.object().keys({
    patientId: Joi.number().integer().required(),
  }),
};

const updateEmailTemplate = {
  params: Joi.object().keys({
    templateId: Joi.number().integer().required(),
  }),
  body: Joi.object()
    .keys({
      name: Joi.string().allow(''),
      emailTypeCode: Joi.string().allow(''),
      subject: Joi.string().allow(''),
      typeCode: Joi.string().allow(null),
      replyTo: Joi.string().email(),
      template: Joi.string().allow(''),
      isDeleted: Joi.boolean(),
    })
    .min(1),
};

const createAdminEmailTemplate = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    subject: Joi.string().required(),
    replyTo: Joi.string().email(),
    template: Joi.string().required(),
  }),
};

const updateAdminEmailTemplate = {
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
  getEmailTemplates,
  createEmailTemplate,
  updateEmailTemplate,
  sendBirthdayMail,
  createAdminEmailTemplate,
  updateAdminEmailTemplate,
};
