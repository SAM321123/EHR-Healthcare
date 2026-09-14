const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { encountersValidation, encounterBillingValidation } = require('../../validations');
const { encountersController } = require('../../controllers')

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.create }),
    validate(encountersValidation.createEncounters),
    encountersController.createEncounters
  ) .get(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.read }),
    validate(encountersValidation.getEncounters),
    encountersController.getEncounters
  )

  router
  .route('/:encounterId')
  .put(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.update }),
    validate(encountersValidation.updateEncounter),
    encountersController.updateEncounter
  )  .get(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.read }),
    validate(encountersValidation.getEncounterById),
    encountersController.getEncounterById
  )

  router
  .route('/:encounterId/billing/:billingId')
  // .put(
  //   auth(AUTH_MODULE.encounterBilling, { action: AUTH_ACTION.create }),
  //   validate(encounterBillingValidation.createEncounterBilling),
  // )
  .get(
    auth(AUTH_MODULE.encounterBilling, { action: AUTH_ACTION.read }),
    // validate(encountersValidation.getEncounterBilling),
    encountersController.getEncounterBilling
  )

  router
  .route('/info/:encounterId')
  .get(
    auth(AUTH_MODULE.encounters, { action: AUTH_ACTION.read }),
    validate(encountersValidation.getEncounterById),
    encountersController.getEncounterInfoById
  )


module.exports = router;

