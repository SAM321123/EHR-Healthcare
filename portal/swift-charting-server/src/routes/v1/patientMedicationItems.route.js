const express = require('express');
const patientMedicationController = require('../../controllers/patientMedication.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const router = express.Router();


router
  .route('/')
  .get(
    auth(AUTH_MODULE.patientMedication, { action: AUTH_ACTION.read }),
    patientMedicationController.getPatientMedicationItems
  )

module.exports = router;
