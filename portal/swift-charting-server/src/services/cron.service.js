const appointmentReminderCronService = require('./cronService/appointmentReminderCron.serivce');

const labOrderResultCheckCronService = require('./cronService/labOrderResultCron.service');
const calendarScheduleCron = require('./cronService/calendarScheduleCron.service');
const markAppointmentMissed = require('./cronService/markAppointmentMissed.service');
const parserOutboundFile = require('./cronService/parserOutboundFileCron.service');
const readClaimFile = require('./cronService/readClaimFileCron.service');
const subscriptionUpdateCronService = require('./cronService/subscriptionUpdateCron.service');
const trialExpiryReminderCronService = require('./cronService/trialExpiryReminderCron.service');
const subscriptionRenewCronService = require('./cronService/subscriptionRenewCron.service');


module.exports = {
  ...appointmentReminderCronService,
  ...labOrderResultCheckCronService,
  ...calendarScheduleCron,
  ...markAppointmentMissed,
  ...parserOutboundFile,
  ...readClaimFile,
  ...subscriptionUpdateCronService,
  ...trialExpiryReminderCronService,
  ...subscriptionRenewCronService,
};
