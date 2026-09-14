const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { encountersValidation, encounterBillingValidation } = require('../../validations');
const { encountersController, encountersBillingController } = require('../../controllers')

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.create }),
    validate(encounterBillingValidation.createEncountersBilling),
    encountersBillingController.createEncounterBilling
  ) .get(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.read }),
    validate(encounterBillingValidation.getEncountersBilling),
    encountersBillingController.getEncounterBilling
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
    encountersBillingController.updateEncounterBilling
  )  .get(
    auth(AUTH_MODULE.encountersBilling, { action: AUTH_ACTION.read }),
    validate(encounterBillingValidation.getEncounterBillingById),
    encountersBillingController.getEncounterBillingById
  )




module.exports = router;

