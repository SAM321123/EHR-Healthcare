const express = require('express');
const auth = require('../../middlewares/auth');
const { formLinkProspectController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(
    formLinkProspectController.createFormLinkProspect
  )
  .get(
    auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }),
    formLinkProspectController.getFormLinkProspect
  );

router
  .route('/payment-intent')
  .post(formLinkProspectController.createProspectPaymentIntent);

// router
//   .route('/:id')
//   .get(
//     auth(AUTH_MODULE.emailCampaignTemplate, { action: AUTH_ACTION.read }),
//     prospectRegistrationController.getEmailClinicById
//   );

module.exports = router;
