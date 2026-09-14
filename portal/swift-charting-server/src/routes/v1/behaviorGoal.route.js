const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { behaviorGoalValidation } = require('../../validations');
const { behaviorGoalController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.behaviorGoal, { action: AUTH_ACTION.read }),
    validate(behaviorGoalValidation.getBehaviorGoal),
    behaviorGoalController.getBehaviorGoal
  );

module.exports = router;
