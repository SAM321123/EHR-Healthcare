const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { vitalsController } = require('../../controllers');
const { vitalsValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.vitals, { action: AUTH_ACTION.create }),
    validate(vitalsValidation.createVitals),
    vitalsController.createVitals
  )
  .get(
    auth(AUTH_MODULE.vitals, { action: AUTH_ACTION.read }),
    validate(vitalsValidation.getVitals),
    vitalsController.getVitals
  );

router
  .route('/:vitalsId')
  .put(
    auth(AUTH_MODULE.vitals, { action: AUTH_ACTION.update }),
    validate(vitalsValidation.updateVitals),
    vitalsController.updateVitals
  )
  .get(
    auth(AUTH_MODULE.vitals, { action: AUTH_ACTION.read }),
    validate(vitalsValidation.getVitalsById),
    vitalsController.getVitalsById
  );

module.exports = router;
