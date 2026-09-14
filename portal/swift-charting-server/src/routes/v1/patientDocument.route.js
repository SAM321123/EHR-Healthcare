const express = require('express');
const patientDocumentController = require('../../controllers/patientDocument.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { patientDocumentValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.patientDocument, { action: AUTH_ACTION.create }),
    validate(patientDocumentValidation.createPatientDocument),
    patientDocumentController.createPatientDocument
  )
  .get(
    auth(AUTH_MODULE.patientDocument, { action: AUTH_ACTION.read }),
    validate(patientDocumentValidation.getPatientDocument),
    patientDocumentController.getPaitentDocument
  );

router
  .route('/:patientDocumentId')
  .put(
    auth(AUTH_MODULE.patientDocument, { action: AUTH_ACTION.update }),
    validate(patientDocumentValidation.updatePatientDocument),
    patientDocumentController.updatePatientDocument
  )
  .get(
    auth(AUTH_MODULE.patientDocument, { action: AUTH_ACTION.read }),
    validate(patientDocumentValidation.getPatientDocumentById),
    patientDocumentController.getPatientDocumentById
  );

module.exports = router;
