const express = require('express');
const medicationScheduleController = require('../../controllers/medicationScheduling.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { medicationScheduleValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.medicationSchedule, { action: AUTH_ACTION.create }),
    validate(medicationScheduleValidation.createMedicationSchedule),
    medicationScheduleController.createMedicationSchedule
  )
  .get(
    auth(AUTH_MODULE.medicationSchedule, { action: AUTH_ACTION.read }),
    // validate(medicationScheduleValidation.getMedicationSchedule),
    medicationScheduleController.getPatientMedicationSchedule
  );

//   router
//   .route('/share/:patientMedicationId')
//   .post(
//     auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.share }),
//     validate(patientMedicationValidation.sharePatientMedication),
//     patientMedicationController.sharePatientMedication
//   )

router
  .route('/:scheduleId')
  .put(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.update }),
    validate(medicationScheduleValidation.updateMedicationSchedule),
    medicationScheduleController.updatePatientMedicationSchedule
  )
//   .get(
//     auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.read }),
//     validate(patientMedicationValidation.getPatientMedicationById),
//     patientMedicationController.getPatientMedicationById
//   );

module.exports = router;
