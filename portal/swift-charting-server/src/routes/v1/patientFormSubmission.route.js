const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { patientFormSubmissionValidation } = require('../../validations');
const { faxContactController, patientFormSubmissionController } = require('../../controllers');
const { AUTH_ACTION, AUTH_MODULE } = require('../../config/constant');

const router = express.Router();

router
  .route('/public')
  .post(
    validate(patientFormSubmissionValidation.createPatientFormSubmission), 
    patientFormSubmissionController.createPublicPatientFormSubmission
  )

router
  .route('/')
  .post(
    auth(),
    validate(patientFormSubmissionValidation.createPatientFormSubmission), 
    patientFormSubmissionController.createPatientFormSubmission
  )

router
  .route('/:patientFormSubmissionId')
  .put(
    auth('managePatientFormSubmission'),
    validate(patientFormSubmissionValidation.updatePatientFormSubmission),
    patientFormSubmissionController.updatePatientFormSubmission
  )

  module.exports = router;
