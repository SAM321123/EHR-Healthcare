const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { patientFormController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { patientFormValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.patientForm, { action: AUTH_ACTION.create }),
    patientFormController.createPatientForm
  )
  .get(
    auth(AUTH_MODULE.patientForm, { action: AUTH_ACTION.read }),
    patientFormController.getPatientForms
  );

  router
  .route('/share-note-template/:patientFormId')
  .post(
    auth('managePatientForm'),
    validate(patientFormValidation.shareNoteTemplate),
    patientFormController.shareNoteTemplate
  );

router
  .route('/public/:patientFormId')
  .get(
    validate(patientFormValidation.getPatientForm),
    patientFormController.getPublicPatientFormById
  );

router
  .route('/:patientFormId')
  .put(
    auth(AUTH_MODULE.patientForm, { action: AUTH_ACTION.update }),
    validate(patientFormValidation.updatePatientForm),
    patientFormController.updatePatientForm
  )
  .get(
    auth(AUTH_MODULE.patientForm, { action: AUTH_ACTION.read }),
    validate(patientFormValidation.getPatientForm),
    patientFormController.getPatientFormById
  );

module.exports = router;
