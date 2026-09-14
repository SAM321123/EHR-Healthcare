const express = require('express');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const {  treatmentPlanTemplateValidation } = require('../../validations');
const {treatmentPlanTemplateController} = require('../../controllers')
const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.create }),
    validate(treatmentPlanTemplateValidation.createTreatmentPlanTemplate),
    treatmentPlanTemplateController.createTreatmentPlanTemplate
  )
  .get(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.read }),
    validate(treatmentPlanTemplateValidation.getTreatmentPlanTemplate),
    treatmentPlanTemplateController.getTreatmentPlanTemplate
  );
  router
  .route('/:templateId')
  .put(
    auth(AUTH_MODULE.treatmentPlan, { action: AUTH_ACTION.update }),
    validate(treatmentPlanTemplateValidation.updateTreatmentPlanTemplate),
    treatmentPlanTemplateController.updateTreatmentPlanTemplate
  ) 

module.exports = router;
