const express = require('express');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { testingLabController } = require('../../controllers');
const validate = require('../../middlewares/validate');
const { testingLabValidation } = require('../../validations');
const router = express.Router();

router
  .route('/')
  .get(
    // auth(AUTH_MODULE.testingLab, { action: AUTH_ACTION.read }),
    validate(testingLabValidation.getTestingLabs),
    testingLabController.getTestingLabs
  );

router
  .route('/')
  .post(
    auth(AUTH_MODULE.testingLab, { action: AUTH_ACTION.create }),
    validate(testingLabValidation.createTestingLab),
    testingLabController.createTestingLab
  );  

router
  .route('/:testingLabId')
  .put(
    auth(AUTH_MODULE.testingLab, { action: AUTH_ACTION.update }),
    validate(testingLabValidation.updateTestingLab),
    testingLabController.updateTestingLab
  );   


module.exports = router;
