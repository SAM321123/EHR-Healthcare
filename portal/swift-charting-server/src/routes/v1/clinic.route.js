const express = require('express');
const adminPortalController = require('../../controllers/adminPortal.controller');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { practiceValidation } = require('../../validations');
const auth = require('../../middlewares/auth');
const { clinicController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    validate(practiceValidation.createPractice),
    clinicController.clinicCreateRequest
  )
  .get(
    clinicController.getPractices
  );

router
  .route('/verify-code')
  .post(
    clinicController.verifyCode
  )

router
  .route('/temp-practice')
  .get(
    clinicController.getTempPractice
  )

router
  .route('/subscription-data')
  .get(clinicController.getSubscriptionData)  

router
  .route('/subscription')
  .post(
    validate(practiceValidation.createSubscription),
    clinicController.createSubscription
  )
  .get(auth(),clinicController.getSubscription)
  .put(auth(), clinicController.updateSubscription);

router
.route('/subscription/:id')
.put(auth(), clinicController.updateSubscriptionStatus);

router
  .route('/new-subscription')
  .post(
    auth(),
    clinicController.createSubscriptionAfterCancel
  )

router
  .route('/invoices')
  .get(
    auth(),
    clinicController.getSubscriptionInvoices
  )

router
  .route('/invoices/:id')
  .get(
    auth(),
    clinicController.getSubscriptionInvoices
  )  

module.exports = router;
