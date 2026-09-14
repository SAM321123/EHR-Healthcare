const express = require('express');
const emergencyContactController = require('../../controllers/emergencyContact.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { emergencyContactValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.emergencyContact, { action: AUTH_ACTION.create }),
    validate(emergencyContactValidation.createEmergencyContact),
    emergencyContactController.createEmergencyContact
  )
  .get(
    auth(AUTH_MODULE.emergencyContact, { action: AUTH_ACTION.read }),
    validate(emergencyContactValidation.getEmergencyContact),
    emergencyContactController.getEmergencyContact
  );

router
  .route('/:emergencyContactId')
  .put(
    auth(AUTH_MODULE.emergencyContact, { action: AUTH_ACTION.update }),
    validate(emergencyContactValidation.updateEmergencyContact),
    emergencyContactController.updateEmergencyContact
  )
  .get(
    auth(AUTH_MODULE.emergencyContact, { action: AUTH_ACTION.read }),
    validate(emergencyContactValidation.getEmergencyContactById),
    emergencyContactController.getEmergencyContactById
  );

module.exports = router;
