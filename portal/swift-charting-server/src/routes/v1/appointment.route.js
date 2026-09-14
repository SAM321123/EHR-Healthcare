const express = require('express');
const appointmentController = require('../../controllers/appointment.controller');
const validate = require('../../middlewares/validate');
const auth = require('../../middlewares/auth');
const { AUTH_MODULE, AUTH_ACTION } = require('../../config/constant');
const { appointmentValidation } = require('../../validations');

const router = express.Router();

router
  .route('/')
  .post(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.create }),
    // validate(appointmentValidation.createAppointment),
    appointmentController.createAppointment
  )
  .get(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.read }),
    // validate(appointmentValidation.getAppointment),
    appointmentController.getAppointment
  );

  router
  .route('/createAppleCalanderEvent/:appointmentId')
  .get(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.read }),
    validate(appointmentValidation.createAppleCalanderEvent),
    appointmentController.createAppleCalanderEvent
  );
  router
  .route('/providersAppointment')
  .get(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.read }),
    appointmentController.getProvidersAppointment
  );
router
  .route('/:appointmentId')
  .put(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.update }),
    // validate(appointmentValidation.updateAppointment),
    appointmentController.updateAppointment
  )
  .get(
    auth(AUTH_MODULE.appointment, { action: AUTH_ACTION.read }),
    // validate(appointmentValidation.getAppointmentById),
    appointmentController.getAppointmentById
  );

module.exports = router;
