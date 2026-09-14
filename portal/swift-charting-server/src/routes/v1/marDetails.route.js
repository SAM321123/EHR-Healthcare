const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { marController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
//   .post(
//     auth(AUTH_MODULE.medicationSchedule, { action: AUTH_ACTION.create }),
//     validate(medicationScheduleValidation.createMedicationSchedule),
//     medicationScheduleController.createMedicationSchedule
//   )
  .get(
    // auth(AUTH_MODULE.patientMAR, { action: AUTH_ACTION.read }),
    // validate(patientMedicationValidation.getPaitentMedication),
    marController.getMARData
  );

//   router
//   .route('/share/:patientMedicationId')
//   .post(
//     auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.share }),
//     validate(patientMedicationValidation.sharePatientMedication),
//     patientMedicationController.sharePatientMedication
//   )

// router
//   .route('/:scheduleId')
//   .put(
//     auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.update }),
//     validate(medicationScheduleValidation.updateMedicationSchedule),
//     medicationScheduleController.updatePatientMedicationSchedule
//   )
//   .get(
//     auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.read }),
//     validate(patientMedicationValidation.getPatientMedicationById),
//     patientMedicationController.getPatientMedicationById
//   );

module.exports = router;
