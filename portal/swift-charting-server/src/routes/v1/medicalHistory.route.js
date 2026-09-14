const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { medicalHistoryValidation } = require('../../validations');
const { medicalHistoryController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.medicalHistory, { action: AUTH_ACTION.create }),
    validate(medicalHistoryValidation.createMedicalHistory),
    medicalHistoryController.createMedicalHistroy
  )
  .get(
    auth(AUTH_MODULE.medicalHistory, { action: AUTH_ACTION.read }),
    validate(medicalHistoryValidation.getMedicalHistory),
    medicalHistoryController.getMedicalHistory
  );

router
  .route('/:medicalHistoryId')
  .put(
    auth(AUTH_MODULE.medicalHistory, { action: AUTH_ACTION.update }),
    validate(medicalHistoryValidation.updateMedicalHistory),
    medicalHistoryController.updateMedicalHistory
  )
  .get(
    auth(AUTH_MODULE.medicalHistory, { action: AUTH_ACTION.read }),
    validate(medicalHistoryValidation.getMedicalHistoryById),
    medicalHistoryController.getMedicalHistoryById
  );

module.exports = router;
