const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const {  treatmentPlanValidation } = require('../../validations');
const {treatmentPlanController} = require('../../controllers')
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.create }),
    validate(treatmentPlanValidation.createTreatmentPlan),
    treatmentPlanController.createTreatmentPlan
  )
  .get(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.read }),
    validate(treatmentPlanValidation.getTreatmentPlans),
    treatmentPlanController.getPaitentTreatmentPlans
  );
  router
  .route('/:treatmentPlanId')
  .put(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.update }),
    validate(treatmentPlanValidation.updateTreatmentPlan),
    treatmentPlanController.updateTreatmentPlan
  ) 

module.exports = router;
