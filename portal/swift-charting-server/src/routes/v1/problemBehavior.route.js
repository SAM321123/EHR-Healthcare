const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { problemBehaviorValidation } = require('../../validations');
const { problemBehaviorController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.problemBehavior, { action: AUTH_ACTION.read }),
    validate(problemBehaviorValidation.getProblemBehavior),
    problemBehaviorController.getProblemBehavior
  );

module.exports = router;
