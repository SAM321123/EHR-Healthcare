const express = require('express');
const onlineBookingRegistrationController = require('../../controllers/onlineBookingRegistration.controller');

const router = express.Router();

// All routes below are public (no auth middleware).
// Clinic context is resolved from the request domain by the clinicContext middleware.
router
  .route('/staff/:staffId')
  .get(onlineBookingRegistrationController.getStaffForBooking);

router
  .route('/available-slots')
  .get(onlineBookingRegistrationController.getAvailableSlots);

// Public: fetch appointment_approved templates for the staff location confirmation dropdown
router
  .route('/appointment-confirmed-templates')
  .get(onlineBookingRegistrationController.getAppointmentConfirmedTemplates);

// Public: fetch procedure codes (services) for online booking
router
  .route('/procedure-codes')
  .get(onlineBookingRegistrationController.getPublicProcedureCodes);

// Public: fetch all practitioners for the practitioner selector
router
  .route('/all-staff')
  .get(onlineBookingRegistrationController.getPublicAllStaff);

// Public: fetch booked appointment slots for a given date/practitioner/location
router
  .route('/appointments')
  .get(onlineBookingRegistrationController.getPublicAppointments);

// Public: fetch out-of-office schedules for a given date/practitioner/location
router
  .route('/oof-schedules')
  .get(onlineBookingRegistrationController.getPublicOofSchedules);

// Public: create a guest patient
router
  .route('/patient')
  .post(onlineBookingRegistrationController.createPublicPatient);

// Public: create an appointment for a guest patient
router
  .route('/appointment')
  .post(onlineBookingRegistrationController.createPublicAppointment);

router
  .route('/payment-intent')
  .post(onlineBookingRegistrationController.createBookingPaymentIntent);

router
  .route('/setup-intent')
  .post(onlineBookingRegistrationController.createBookingSetupIntent);

module.exports = router;
