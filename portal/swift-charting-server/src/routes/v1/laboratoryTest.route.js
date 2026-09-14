const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { laboratoryTestController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { laboratoryTestValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .get(
    // auth(AUTH_MODULE.laboratoryTest, { action: AUTH_ACTION.read }),
    validate(laboratoryTestValidation.getLaboratoryTests),
    laboratoryTestController.getLaboratoryTests
  );

router
  .route('/')
  .post(
    auth(AUTH_MODULE.laboratoryTest, { action: AUTH_ACTION.create }),
    validate(laboratoryTestValidation.createLaboratoryTests),
    laboratoryTestController.createLaboratoryTests
  ); 
 
router
  .route('/:laboratoryTestId')
  .put(
    auth(AUTH_MODULE.laboratoryTest, { action: AUTH_ACTION.update }),
    validate(laboratoryTestValidation.updateLaboratoryTest),
    laboratoryTestController.updateLaboratoryTest
  );   

module.exports = router;
