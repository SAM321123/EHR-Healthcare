const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { emailTemplateValidation } = require('../../validations');
const { emailTemplateController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');


const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.create }), validate(emailTemplateValidation.createEmailTemplate), emailTemplateController.createEmailTemplate)
  .get(auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.read }), validate(emailTemplateValidation.getEmailTemplates), emailTemplateController.getEmailTemplates);
  router.route('/all')
   .get(auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.read }), validate(emailTemplateValidation.getEmailTemplates), emailTemplateController.getAllEmailTemplates);
  router
  .route('/:templateId')
  .put(auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.update }), validate(emailTemplateValidation.updateEmailTemplate), emailTemplateController.updateEmailTemplate)

  router
  .route('/send-birthday-mail')
  .post(auth(AUTH_MODULE.emailTemplate, { action: AUTH_ACTION.read }), validate(emailTemplateValidation.sendBirthdayMail), emailTemplateController.sendBirthdayMail)
module.exports = router;
