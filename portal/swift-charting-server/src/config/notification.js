const { appointmentStatus, appointmentActions } = require('./appointment');

const notifications = {
  Clinic:{
  MEETING_INVITE: {
    title: 'Meeting Invite',
    message: `Hi,  You are invited by [name] to join a meeting.`,
    type: 'Meeting Invite',
  },
  [appointmentActions.APPOINTMENT_CREATED]: {
    title: 'Appointment Created',
    message: `Hi,  an appointment for [startDate] [startTime] with patient [patientName] has been created.`,
    type: appointmentActions.APPOINTMENT_CREATED
  },
  [appointmentActions.RECURRING_APPOINTMENT_CREATED]: {
    title: 'Appointment Created (Recurring)',
    message: `Hi,  an appointment for [recurringSummary] with patient [patientName] has been created.`,
    type: appointmentActions.APPOINTMENT_CREATED
  },
  [appointmentStatus.CONFIRMED]: {
    title: 'Appointment Confirmed',
    message: `Hi,  an appointment of patient [patientName] has been confirmed for [startDate] [startTime].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.ON_GOING]: {
    title: 'Appointment Started',
    message: `Hi [name], the patient started this appointment([title]). Please join the meeting.`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.COMPLETE]: {
    title: 'Appointment Complete',
    message: `Hi, [patientName] appointment([title]) has been completed.`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.CANCELED]: {
    title: 'Appointment Canceled',
    message: `Hi,  appointment for [startDate] [startTime] with patient [patientName] has been canceled`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_RESCHEDULED]: {
    title: 'Appointment Rescheduled',
    message: `Hi,  appointment with patient [patientName] rescheduled from [previousStartDate] [previousStartTime] to [startDate] [startTime].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.RECURRING_APPOINTMENT_RESCHUDLED]: {
    title: 'Appointment Rescheduled (Recurring)',
    message: `Hi,  appointment with patient [patientName] has been rescheduled from [previousRecurringSummary] to [recurringSummary].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_STATUS]: {
    title: 'Appointment [statusTitle]',
    message: `Hi,  appointment with patient [patientName] has been changed to [statusText]`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_UPDATED]: {
    title: 'Appointment [status_title]',
    message: `Hi,  appointment with patient [patientName] has been updated`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_REMINDER]: {
    title: 'Reminder for appointment',
    message: `Hi,  appointment with patient [patientName] is at [startDate] [startTime]`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
},
Patient:{
  [appointmentActions.APPOINTMENT_CREATED]: {
    title: 'Appointment Created',
    message: `Hi,  an appointment has been created with practitioner [practitionerName] for [startDate] [startTime].`,
    type: appointmentActions.APPOINTMENT_CREATED,
  },
  [appointmentActions.RECURRING_APPOINTMENT_CREATED]: {
    title: 'Appointment Created (Recurring)',
    message: `Hi,  an appointment for [recurringSummary] with practitioner [practitionerName] has been created.`,
    type: appointmentActions.APPOINTMENT_CREATED
  },
  [appointmentStatus.CONFIRMED]: {
    title: 'Appointment Confirmed',
    message: `Hi,  an appointment with practitioner [practitionerName] has been confirmed for [startDate] [startTime].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.ON_GOING]: {
    title: 'Appointment Started',
    message: `Hi, [patientName] appointment([title]) has been started. Please join the meeting.`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.COMPLETE]: {
    title: 'Appointment Complete',
    message: `Hi, [patientName] appointment([title]) has been completed.`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentStatus.CANCELED]: {
    title: 'Appointment Canceled',
    message: `Hi,  appointment for [startDate] [startTime] with practitioner [practitionerName] has been cancel.`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_RESCHEDULED]: {
    title: 'Appointment Rescheduled',
    message: `Hi,  appointment with practitioner [practitionerName] has been rescheduled from [previousStartDate] [previousStartTime] to [startDate] [startTime].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.RECURRING_APPOINTMENT_RESCHUDLED]: {
    title: 'Appointment Rescheduled (Recurring)',
    message: `Hi,  appointment with practitioner [practitionerName] has been rescheduled from [previousRecurringSummary] to [recurringSummary].`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_STATUS]: {
    title: 'Appointment [statusTitle]',
    message: `Hi,  appointment with practitioner [practitionerName] has been changed to [statusText]`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_UPDATED]: {
    title: 'Appointment Updated',
    message: `Hi,  appointment with practitioner [practitionerName] has been updated`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  [appointmentActions.APPOINTMENT_REMINDER]: {
    title: 'Reminder for appointment',
    message: `Hi,  appointment with practitioner [practitionerName] is at [startDate] [startTime]`,
    type: appointmentActions.APPOINTMENT_UPDATED,
  },
  MEDICATION_CREATED: {
    title: 'New Medication Prescribed',
    message: `Hi,  a new medication has been prescribed by [prescriberName]`,
    type: "MEDICATION_CREATED",
  },
  LAB_ORDER_CREATED: {
    title: 'New Lab Order Created',
    message: `Hi,  a new lab order has been created by [providerName]`,
    type: "LAB_ORDER_CREATED",
  },
},
Message:{
  ['NEW_MESSAGE']:({message,from})=>( {
    title: `New Message from ${from}`,
    message,
    type: 'NEW_MESSAGE',
  }),
},
ZoomInvite:{
  ['ZOOM_INVITE']:({sessionName,from})=>( {
    title: `Telehealth Video Invitation by ${from}`,
    message:sessionName 
    ? `You have been invited to join the session: ${sessionName}. Please join.` 
    : "You have been invited to join a Telehealth video session. Please join.",
    type: 'ZOOM_INVITE',
  }),
}
};

const getDynamicNotificationMessage = ({ text, params }) => {
  return text.replace(/\[([a-zA-Z]*)\]/g, (match, key) => {
    return params[key] || match;
  });
};

module.exports = { notifications, getDynamicNotificationMessage };
