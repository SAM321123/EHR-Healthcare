const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { mdToolboxValidation} = require('../../validations');
const { mdToolboxController} = require('../../controllers');

const router = express.Router();

router
  .route('/:patientId')
  .get(
    auth(AUTH_MODULE.mdToolbox, { action: AUTH_ACTION.read }),
    validate(mdToolboxValidation.uploadPatient),
    mdToolboxController.uploadPatient,
  )
  router
  .route('/:patientId/e-prescription')
  .get(
    auth(AUTH_MODULE.mdToolbox, { action: AUTH_ACTION.read }),
    validate(mdToolboxValidation.getPatientEPrescription),
    mdToolboxController.patientsEPrescription,
  )


module.exports  = router;  