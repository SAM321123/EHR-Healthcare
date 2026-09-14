const express = require('express');
const appointmentController = require('../../controllers/appointment.controller');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');

const router = express.Router();


router
  .route('/')
  .post(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.create }),
    appointmentController.createAppointmentNotes
  )
router
  .route('/:appointmentId')
  .get(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.read }),
    appointmentController.getAppointmentNotes
  )

module.exports = router;
