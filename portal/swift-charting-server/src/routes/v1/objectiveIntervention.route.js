const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { objectiveInterventionValidation } = require('../../validations');
const { objectiveInterventionController } = require('../../controllers');
const router = express.Router();

router
  .route('/')
  .get(
    auth(AUTH_MODULE.objectiveIntervention, { action: AUTH_ACTION.read }),
    validate(objectiveInterventionValidation.getObjectiveIntervention),
    objectiveInterventionController.getObjectiveIntervention
  );

module.exports = router;
