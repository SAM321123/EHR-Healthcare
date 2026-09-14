// emailQueue.js
const { Queue } = require('bullmq');

const emailQueue = new Queue('email-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

const appointmentCancelQueue = new Queue('appointment-cancel-queue', {
  connection: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
  },
});

module.exports = { emailQueue, appointmentCancelQueue };