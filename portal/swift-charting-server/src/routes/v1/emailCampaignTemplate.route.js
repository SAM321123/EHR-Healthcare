const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { emailCampaignTemplateValidation } = require('../../validations');
const { emailCampaignTemplateController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.create }), validate(emailCampaignTemplateValidation.createEmailCampaignTemplate), emailCampaignTemplateController.createEmailCampaignTemplate)
  .get(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }), validate(emailCampaignTemplateValidation.getEmailCampaignTemplates), emailCampaignTemplateController.getEmailCampaignTemplates);

  router
  .route('/:templateId')
  .put(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.update }), validate(emailCampaignTemplateValidation.updateEmailCampaignTemplate), emailCampaignTemplateController.updateEmailCampaignTemplate)

module.exports = router;
