/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const dbService = require('../db.service');
const logger = require('../../config/logger');
const { getModels } = require('../../utils/connection');
const { Op } = require('sequelize');

const deactivateCalendarSchedule = async ({ tenantId }) => {
  try {
    const db = getModels(tenantId);
    const calendarSchedules = await dbService.getAll({
      model: db.CalendarSchedule,
      filter: {
        where: {
          isActive: true,
          endDateTime: { [Op.lt]: new Date() }, // endDate is less than today's date
        },
      },
    });
    // eslint-disable-next-line no-restricted-syntax

    await Promise.all(
        calendarSchedules.map(schedule =>
          dbService.updateById({
            model: db.CalendarSchedule,
            reqParams: { id: schedule?.id, isActive: false },
          })
        )
      );
  } catch (err) {
    logger.error(`Error in cron deactivateCalendarSchedule`, err);
    throw new Error(err);
  }
};
module.exports = {
  deactivateCalendarSchedule,
};
