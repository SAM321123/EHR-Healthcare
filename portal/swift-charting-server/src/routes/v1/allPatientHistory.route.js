const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { allPatientHistoryValidation } = require('../../validations');
const { allPatientHistoryController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.allPatientHistory, { action: AUTH_ACTION.create }),
    validate(allPatientHistoryValidation.createAllPatientHistory),
    allPatientHistoryController.createAllPatientHistroy
  )
  .get(
    auth(AUTH_MODULE.allPatientHistory, { action: AUTH_ACTION.read }),
    validate(allPatientHistoryValidation.getAllPatientHistory),
    allPatientHistoryController.getAllPatientHistory
  );

module.exports = router;
