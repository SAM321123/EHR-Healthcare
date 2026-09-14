const { Worker } = require('bullmq');
const { bootstrap } = require('../utils/connection');
const emailService = require('../services/email.service');
const { sequelize } = require('../config/database');

(async () => {
  await bootstrap();
  console.log('✅ Tenant connections initialized in worker');
})();
const emailProcessor = new Worker(
  'email-queue',
  async (job) => {
    const {
      composeId,
      auditId,
      email,
      replyTo,
      clinicUuid,
      subject,
      text,
      html,
      firstName,
      middleName,
      lastName,
      clinicName,
      templateParams,
      UserRole,
    } = job.data;
    //  console.log('Processing email job:', { email, subject, clinicUuid, composeId, auditId });

    try {
      if (UserRole === 1) {
        await emailService.sendEmailToCompose({
          uuid: clinicUuid,
          to: email,
          replyTo,
          subject,
          text,
          html,
          firstName,
          middleName,
          lastName,
          clinicName,
          templateParams,
          composeId,
          auditId,
        });
      } else {
        await emailService.sendEmailToClinicToCompose({
          clinicId: clinicUuid,
          to: email,
          replyTo,
          subject,
          text,
          html,
          firstName,
          middleName,
          lastName,
          clinicName,
          templateParams,
          composeId,
          auditId,
        });
      }

      console.log('Email sent:', email);
    } catch (error) {
      console.error('Email failed:', error.message);

      throw error;
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST || 'localhost',
      port: process.env.REDIS_PORT || 6379,
      // tls: true
    },
    concurrency: 5,
  }
);

module.exports = emailProcessor;
