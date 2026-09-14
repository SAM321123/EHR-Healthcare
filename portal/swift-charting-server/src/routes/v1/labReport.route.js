const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { labReportValidation} = require('../../validations');
const { labReportController} = require('../../controllers');

const router = express.Router();

router
  .route('/:labRadiologyId')
  .get(
    auth(AUTH_MODULE.labReport, { action: AUTH_ACTION.read }),
    validate(labReportValidation.getLabReport),
    labReportController.getLabReport,
  )

router
  .route('/:labReportId')  
  .put(
    auth(AUTH_MODULE.labReport, { action: AUTH_ACTION.update}),
    validate(labReportValidation.updateLabReport),
    labReportController.updateLabReport,
  )

module.exports  = router;  