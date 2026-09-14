const express = require('express');
const {officeAllyController } = require('../../controllers');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const auth = require('../../middlewares/auth');

const router = express.Router();

router
  .route('/eligibilityCheck')
  .post(auth(AUTH_MODULE.eligibilityCheckHistroy, { action: AUTH_ACTION.create }),officeAllyController.checkEligibility);
  router
  .route('/eligibilityCheck/history/:patientId')
  .get(
    auth(AUTH_MODULE.eligibilityCheckHistroy, { action: AUTH_ACTION.read }),
    //validate(globalTypeyValidation.getGlobalTypes),
    officeAllyController.getEligibiltyHistory
  );

  router
  .route('/claimStatusCheck')
  .post(officeAllyController.realTimeClaimStatus);

  router
  .route('/payerList')
  .get(
    //validate(globalTypeyValidation.getGlobalTypes),
    officeAllyController.getPayerList
  );
  router
  .route('/payerList/claim')
  .get(
    //validate(globalTypeyValidation.getGlobalTypes),
    officeAllyController.getClaimPayerList
  );
module.exports = router;
