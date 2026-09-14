const { Worker } = require('bullmq');
const { bootstrap } = require('../utils/connection');
const emailService = require('../services/email.service');

(async () => {
  await bootstrap();
  console.log('✅ Tenant connections initialized in appointment cancel worker');
})();

const appointmentCancelProcessor = new Worker(
  'appointment-cancel-queue',
  async (job) => {
    const {
      auditId,
      email,
      clinicUuid,
    } = job.data;
    
    console.log("🚀 ~ job:", job)
    try {
      await emailService.sendOofAppointmentCancelMail({
        clinicId: clinicUuid,
        to: email,
        auditId,
      });

      console.log('Appointment cancellation email sent:', email);
    } catch (error) {
      console.error('Appointment cancellation email failed:', error.message);
      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
    },
    concurrency: 5,
  }
);

module.exports = appointmentCancelProcessor;
