const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { emailCampaignComposeMailValidation } = require('../../validations');
const { emailCampaignComposeMailController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.create }), validate(emailCampaignComposeMailValidation.createComposeMail), emailCampaignComposeMailController.createComposeMail)
  .get(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }), validate(emailCampaignComposeMailValidation.getComposeMail), emailCampaignComposeMailController.getComposeMail);
   
router
  .route('/:id')
  .get(auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }), emailCampaignComposeMailController.getEmailClinicById);

module.exports = router;
