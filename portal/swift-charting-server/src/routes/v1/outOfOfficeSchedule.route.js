const express = require('express');
const outOfOfficeScheduleController = require('../../controllers/outOfOfficeSchedule.controller')
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const validate = require('../../middlewares/validate');
const { outOfOfficeScheduleValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.create }),
    validate(outOfOfficeScheduleValidation.createOutOfOfficeSchedule),
    outOfOfficeScheduleController.createOutOfOfficeSchedule
  )
  .get(auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }),validate(outOfOfficeScheduleValidation.getoooSchedule), outOfOfficeScheduleController.getOooSchedule);

  router
  .route('/slot-check')
  .get(outOfOfficeScheduleController.getOooSchedulesForSlotCheck);

  router
  .route('/:id')
  .put(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.update }),
    validate(outOfOfficeScheduleValidation.updateOooSchedule),
    outOfOfficeScheduleController.updateOooSchedule
  )

module.exports = router;
