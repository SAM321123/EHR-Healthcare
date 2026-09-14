// Worker entry point - initializes both email and appointment cancel workers
const emailProcessor = require('./email.worker');
const appointmentCancelProcessor = require('./appointmentCancel.worker');

console.log('✅ Email worker initialized');
console.log('✅ Appointment cancel worker initialized');

module.exports = { emailProcessor, appointmentCancelProcessor };
