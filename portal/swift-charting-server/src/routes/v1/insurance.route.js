const express = require('express');
const insuranceController = require('../../controllers/insurance.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { insuranceValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.insurance, { action: AUTH_ACTION.create }),
    validate(insuranceValidation.createInsurance),
    insuranceController.createInsurance
  )
  .get(
    auth(AUTH_MODULE.insurance, { action: AUTH_ACTION.read }),
    validate(insuranceValidation.getInsurance),
    insuranceController.getInsurance
  );

  router
  .route('/markBillingSelf')
  .post(
    auth(AUTH_MODULE.insurance, { action: AUTH_ACTION.create }),
    insuranceController.markBillingSelf
  );

router
  .route('/:insuranceId')
  .get(
    auth(AUTH_MODULE.insurance, { action: AUTH_ACTION.read }),
    validate(insuranceValidation.getInsuranceById),
    insuranceController.getInsuranceById
  );

module.exports = router;
