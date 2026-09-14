const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { goalObjectiveValidation } = require('../../validations');
const { goalObjectiveController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.goalObjective, { action: AUTH_ACTION.read }),
    validate(goalObjectiveValidation.getGoalObjective),
    goalObjectiveController.getGoalObjective
  );

module.exports = router;
