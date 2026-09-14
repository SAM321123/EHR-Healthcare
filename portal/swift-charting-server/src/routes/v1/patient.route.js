const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { patientValidation } = require('../../validations');
const { patientController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.patient, { action: AUTH_ACTION.create }),
    validate(patientValidation.createPatient),
    patientController.createPatient
  )
  .get(auth(AUTH_MODULE.patient, { action: AUTH_ACTION.read }),validate(patientValidation.getPatients), patientController.getPaitents);

  router
  .route('/patient-count')
  .get(
    auth(AUTH_MODULE.patient, { action: AUTH_ACTION.read }),
    validate(patientValidation.getPatientsCount),
    patientController.getPatientsCount
  );

router
  .route('/:patientId')
  .put(auth(AUTH_MODULE.patient,{action:AUTH_ACTION.update}), validate(patientValidation.updatePatient), patientController.updatePatient)
  .get(
    // auth(AUTH_MODULE.patient, { action: AUTH_ACTION.read }),
    validate(patientValidation.getPatientById),
    patientController.getPatientById
  );

module.exports = router;
