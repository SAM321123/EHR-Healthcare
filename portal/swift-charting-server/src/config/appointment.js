const appointmentStatus = {
    CONFIRMED: 'confirmed',
    PENDING_CONFIRMATION: 'Pending Confirmation',
    DECLINED: 'Declined',
    CANCELED: 'canceled',
    MISSED: 'appointment_missed',
    COMPLETED: 'Completed',
    CHECKIN: 'Check In',
    READY_FOR_PRACTITIONER: 'Ready For Practitioner',
    WAITING_ROOM: 'Waiting Room',
    ON_GOING:'On-Going',
    COMPLETE:'Complete',
    PENDING:'pending',
  };

const appointmentActions = {
  APPOINTMENT_CREATED:"APPOINTMENT_CREATED",
  RECURRING_APPOINTMENT_CREATED:"RECURRING_APPOINTMENT_CREATED",
  APPOINTMENT_RESCHEDULED:'APPOINTMENT_RESCHEDULED',
  RECURRING_APPOINTMENT_RESCHUDLED:"RECURRING_APPOINTMENT_RESCHUDLED",
  APPOINTMENT_UPDATED:"APPOINTMENT_UPDATED",
  APPOINTMENT_STATUS:'APPOINTMENT_STATUS',
  APPOINTMENT_REMINDER:'APPOINTMENT_REMINDER',

}

  module.exports ={
    appointmentStatus,
    appointmentActions,
  }