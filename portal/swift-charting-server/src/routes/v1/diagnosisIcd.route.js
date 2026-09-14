const express = require('express');
const diagnosisIcdController = require('../../controllers/diagnosisIcd.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { diagnosisValidation } = require('../../validations');
const router = express.Router();

// router
//   .route('/')
//   .post(
//     auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.create }),
//     validate(diagnosisValidation.createDiagnosis),
//     diagnosisIcdController.createDiagnosis
//   )
//   .get(auth(AUTH_MODULE.diagnosis, { action: AUTH_ACTION.read }),validate(diagnosisValidation.getDiagnosis), diagnosisIcdController.getDiagnosis);

router
  .route('/')
  // .put(auth(AUTH_MODULE.diagnosis,{action:AUTH_ACTION.update}), validate(diagnosisValidation.updateDiagnosis), diagnosisIcdController.updateDiagnosis)
  .get(
    // auth(AUTH_MODULE.diagnosisicd, { action: AUTH_ACTION.read }),
    // validate(diagnosisValidation.getDiagnosisById),
    diagnosisIcdController.getDiagnosisIcd
  );


module.exports = router;
