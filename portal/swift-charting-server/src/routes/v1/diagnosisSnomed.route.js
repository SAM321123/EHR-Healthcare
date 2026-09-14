const express = require('express');
const diagnosisSnomedController = require('../../controllers/diagnosisSnomed.controller');
const router = express.Router();

router
  .route('/')
  .get(diagnosisSnomedController.getDiagnosisSnomed);


module.exports = router;
