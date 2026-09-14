const express = require('express');
const { patientMedicationItemMARLogController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { patientMedicationItemMARLogValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(auth(AUTH_MODULE.patientMedicationItemMARLog, { action: AUTH_ACTION.create }), validate(patientMedicationItemMARLogValidation.createPatientMedicationItemMARLog),
    patientMedicationItemMARLogController.createPatientMedicationItemMARLog
  )
  .get(
    patientMedicationItemMARLogController.getPatientMedicationItemMARLogs
  );

router
  .route('/:patientMARId')
  .put(
    auth(AUTH_MODULE.patientMedicationItemMARLog, { action: AUTH_ACTION.update }),
    validate(patientMedicationItemMARLogValidation.updatePatientMedicationItemMARLog),
    patientMedicationItemMARLogController.updatePatientMedicationItemMARLog
  )
  module.exports = router;