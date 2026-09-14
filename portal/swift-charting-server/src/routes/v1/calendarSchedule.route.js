const express = require('express');
const calendarScheduleController = require('../../controllers/calendarSchedule.controller');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.create }),
    calendarScheduleController.createCalendarSchedule
  )
  .get(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.read }),
    calendarScheduleController.getCalendarSchedule
  );
  router
  .route('/:calendarScheduleId')
  .put(
    auth(AUTH_MODULE.staff, { action: AUTH_ACTION.update }),
    calendarScheduleController.updateCalendarSchedule
  )

module.exports = router;
