const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { emailCampaignComposeMailValidation } = require('../../validations');
const { prospectRegistrationController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.create }),
    prospectRegistrationController.createProspectRegistration
  )
  .get(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }),
    prospectRegistrationController.getProspectRegistration
  );

// Public widget config (instruction text only)
router
  .route('/widget-config')
  .get(prospectRegistrationController.getProspectRegistrationWidgetConfig);

router
  .route('/stripe-keys')
  .get(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }),
    prospectRegistrationController.getProspectRegistrationStripeKeys
  )
  .put(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.update }),
    prospectRegistrationController.updateProspectRegistrationStripeKeys
  );

router
  .route('/:id')
  .get(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }),
    prospectRegistrationController.getEmailClinicById
  );

module.exports = router;
