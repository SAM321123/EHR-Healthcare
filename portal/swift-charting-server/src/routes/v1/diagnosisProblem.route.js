const express = require('express');
const diagnosisProblemController = require('../../controllers/diagnosisProblem.controller');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const router = express.Router();

router
  .route('/')
  .get(
    // auth(AUTH_MODULE.diagnosisproblem, { action: AUTH_ACTION.read }),
    diagnosisProblemController.getDiagnosisProblems
  );


module.exports = router;
