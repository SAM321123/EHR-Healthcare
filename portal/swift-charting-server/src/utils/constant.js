const { serverURL } = require('../config/config');

const GOOGLE_MEET_SCOPES = ['https://www.googleapis.com/auth/calendar.events'];
const GOOGLE_MEET_AUTH_URL = `${serverURL}meet-config/verifyCalendarAccess`;
const CALENDAR_ACCESS_REVOKE_URL = `https://accounts.google.com/o/oauth2/revoke`;
const UI_URLS = {
  patientForm: 'forms',
  prescription: 'prescription',
  zoomSession: 'zoom-session',
};
const Email_Templates = {
  CREATE_APPOINTMENT: 'appointment_create',
  CREATE_RECURRING_APPOINTMENT: 'appointment_recurring',
  RESCHEDULE_RECURRING_APPOINTMENT: 'recurring_appointment_reschedule',
  RESCHEDULE_APPOINTMENT: 'appointment_reschedule',
  APPROVED_APPOINTMENT: 'appointment_approved',
  REJECTED_APPOINTMENT: 'appointment_rejected',
  APPOINTMENT_REMINDER: 'appointment_reminder',
  PATIENT_CREATE: 'patient_create',
  STAFF_CREATE: 'staff_create',
  RESET_PASSWORD: 'reset_password',
  FORGET_PASSWORD: 'forget_password',
  BIRTHDAY: 'birthday',
  GENERATE_PASSWORD: 'generate_password',
  SUBSCRIPTION_CANCELLED: 'subscription_cancelled',
  SUBSCRIPTION_DEACTIVATED: 'subscription_deactivated',
  FAILED_LOGIN: 'failed_login',
  TRIAL_EXPIRY_REMINDER: 'trial_expiry_reminder',
  SUBSCRIPTION_RENEWAL: 'subscription_renewal',
};

const routeCodeType = {
  OTHER: 'other_route_type',
};
const frequencyCodeType = {
  OTHER: 'other_frequency_type',
};
const directionCodeType = {
  OTHER: 'Other_direction_type',
};

const REMINDER_DAYS = [1, 3, 7, 14];
const RENEW_REMINDER_DAYS = [7];


module.exports = {
  Email_Templates,
  GOOGLE_MEET_SCOPES,
  GOOGLE_MEET_AUTH_URL,
  CALENDAR_ACCESS_REVOKE_URL,
  UI_URLS,
  routeCodeType,
  frequencyCodeType,
  directionCodeType,
  REMINDER_DAYS,
  RENEW_REMINDER_DAYS
};
