const express = require('express');
const patientMedicationController = require('../../controllers/patientMedication.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { patientMedicationValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.create }),
    validate(patientMedicationValidation.createPatientMedication),
    patientMedicationController.createPatientMedication
  )
  .get(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.read }),
    validate(patientMedicationValidation.getPaitentMedication),
    patientMedicationController.getPaitentMedication
  );

  router
  .route('/share/:patientMedicationId')
  .post(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.share }),
    validate(patientMedicationValidation.sharePatientMedication),
    patientMedicationController.sharePatientMedication
  )



router
  .route('/:patientMedicationId')
  .put(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.update }),
    validate(patientMedicationValidation.updatePatientMedication),
    patientMedicationController.updatePatientMedication
  )
  .get(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.read }),
    validate(patientMedicationValidation.getPatientMedicationById),
    patientMedicationController.getPatientMedicationById
  );



module.exports = router;
