const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const {  encounterBillingValidation } = require('../../validations');
const {  encountersBillingController, encountersClaimBillingController } = require('../../controllers')

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.create }),
    validate(encounterBillingValidation.createEncountersBilling),
    encountersClaimBillingController.createEncounterClaimBilling
  ) .get(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.read }),
    validate(encounterBillingValidation.getEncountersBilling),
    encountersClaimBillingController.getEncounterClaimBilling
  )

  router.route('/encounter/:encounterId').get(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.read }),
    validate(encounterBillingValidation.getEncounterBillingByEncounterId),
    encountersBillingController.getEncounterBillingByEncounterId
  );
  
  router
  .route('/:encounterBillingId')
  .put(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.update }),
    validate(encounterBillingValidation.updateEncounterBilling),
    encountersClaimBillingController.updateEncounterClaimBilling
  )  .get(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.read }),
    validate(encounterBillingValidation.getEncounterBillingById),
    encountersBillingController.getEncounterBillingById
  )




module.exports = router;

