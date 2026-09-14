const express = require('express');
const diagnosisController = require('../../controllers/diagnosis.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { diagnosisValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.create }),
    validate(diagnosisValidation.createDiagnosis),
    diagnosisController.createDiagnosis
  )
  .get(
    auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.read }),
    validate(diagnosisValidation.getDiagnosis),
    diagnosisController.getDiagnosis
  );

router
  .route('/:diagnosisId')
  .put(
    auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.update }),
    validate(diagnosisValidation.updateDiagnosis),
    diagnosisController.updateDiagnosis
  )
  .get(
    auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.read }),
    validate(diagnosisValidation.getDiagnosisById),
    diagnosisController.getDiagnosisById
  );

module.exports = router;
