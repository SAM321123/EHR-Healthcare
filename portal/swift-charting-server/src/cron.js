const cron = require('node-cron');
const { cronService, dbService } = require('./services');
const logger = require('./config/logger');
const { getAllTenants, getModels } = require('./utils/connection');

/* -------------------- COMMON UTILS -------------------- */

const ensureTenant = (tenantId) => {
  if (!tenantId) throw new Error('tenantId is missing in cron execution');
};

const updateCronStatus = async (logData, timeTaken, { success = true, error, tenantId } = {}) => {
  ensureTenant(tenantId);
  const db = getModels(tenantId);

  const updateParams = {
    timeTaken,
    status: success ? 'success' : 'fail',
  };

  if (error) updateParams.error = error.message || error;

  try {
    await dbService.updateOne({
      model: db.CronLog,
      filter: { where: { id: logData.id } },
      updateParams,
    });
  } catch (err) {
    console.error('updateCronStatus error:', err);
  }
};

/* -------------------- CRONS -------------------- */

const sendAppointmentReminderMinutelyTask = (tenantId) =>
  cron.schedule('* * * * *', async () => {
    console.log('sendAppointmentReminderMinutelyTask....', tenantId);
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'sendAppointmentReminderMinutely',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.sendAppointmentReminderMinutely({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const getLabOrderResultTask = (tenantId) =>
  cron.schedule('0 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'getLabOrderResultTask',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.getLabOrderResult({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const deactivateSchedule = (tenantId) =>
  cron.schedule('2 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'deactivateCalendarSchedule',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.deactivateCalendarSchedule({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const markAppointmentMissed = (tenantId) =>
  cron.schedule('*/5 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'markAppointmentMissedTask',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.markAsAppointmentMissed({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const readOutboundFile = (tenantId) =>
  cron.schedule('4 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'readOutboundFile',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.parserOutboundFile({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const readClaimFile = (tenantId) =>
  cron.schedule('6 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'readClaimFile',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.readClaimFile({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const subscriptionUpdate = (tenantId) =>
  cron.schedule('10 * * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);

    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'subscriptionUpdate',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.subscriptionUpdate({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const trialExpiryReminder = (tenantId) =>
  cron.schedule('0 0 * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);
    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'trialExpiryReminder',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.trialExpiryReminder({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });

const subscriptionRenew = (tenantId) =>
  cron.schedule('30 0 * * *', async () => {
    ensureTenant(tenantId);
    const db = getModels(tenantId);
    const logData = await dbService.createOne({
      model: db.CronLog,
      reqParams: {
        method: 'subscriptionRenew',
        status: 'pending',
        tenantId,
      },
    });

    const start = Date.now();
    try {
      await cronService.subscriptionRenew({ tenantId });
      await updateCronStatus(logData, Date.now() - start, { tenantId });
    } catch (error) {
      await updateCronStatus(logData, Date.now() - start, {
        success: false,
        error,
        tenantId,
      });
    }
  });
/* -------------------- INIT PENDING CRONS -------------------- */

const initiatPenddingCrons = async (tenantId) => {
  ensureTenant(tenantId);
  const db = getModels(tenantId);
  const pendingCrons = await dbService.getAll({ model: db.CronLog, filter: { where: { status: 'pending' } } });
  for (const cronLog of pendingCrons) {
    const start = Date.now();
    if (typeof cronService[cronLog.method] === 'function') {
      try {
        await cronService[cronLog.method]({ tenantId });
        await updateCronStatus(cronLog, Date.now() - start, { tenantId });
      } catch (error) {
        await updateCronStatus(cronLog, Date.now() - start, {
          success: false,
          error,
          tenantId,
        });
      }
    } else {
      await updateCronStatus(cronLog, Date.now() - start, {
        success: false,
        error: `Function ${cronLog.method} not found at initiating cron on server restart`,
        tenantId,
      });

      logger.error(`Function ${cronLog.method} not found at initiating cron on server restart`);
    }
  }
};

/* -------------------- START ALL CRONS -------------------- */

const cronStart = async () => {
  const allTenants = await getAllTenants();
  console.log(`Starting crons for: ${allTenants.length} tenants.`);
  for (const tenant of allTenants) {
    const tenantId = tenant.uuid;
    initiatPenddingCrons(tenantId);
    sendAppointmentReminderMinutelyTask(tenantId).start();
    getLabOrderResultTask(tenantId).start();
    deactivateSchedule(tenantId).start();
    markAppointmentMissed(tenantId).start();
    readOutboundFile(tenantId).start();
    readClaimFile(tenantId).start();
    subscriptionUpdate(tenantId).start();
    trialExpiryReminder(tenantId).start();
    subscriptionRenew(tenantId).start();
  }
};

module.exports = cronStart;
