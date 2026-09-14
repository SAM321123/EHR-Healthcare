const moment = require('moment');
const { appointmentStatus } = require('../../config/appointment');
const logger = require('../../config/logger');
// const { models } = require('../../config/models');
const Appointment = require('../../models/appointment.model');
// const { getSchemaPaths } = require('../../utils');
// const { notifyGroup } = require('../../utils/socketApi');
const dbService = require('../db.service');
const { getCurrentMinuteRange } = require('../../utils/dateUtility');
// const { upsertClinicMonthlyAppointmentStats } = require('../clinicMonthlyAppointmentStats.service');
// const { sendMailOnAppointmentStatus } = require('../emailTemplate.service');
const { getModels } = require('../../utils/connection');
const { statusCode } = require('../../../seed-script/mastersData/statusCodes');
const { Op } = require('sequelize');
 
const MISSED_DIFFERENCE = 30;
const CRON_DIFFERENCE = 5;
 
const markAsAppointmentMissed = async ({tenantId}) => {
  try {
    const db = getModels(tenantId);
    const { start, end } = getCurrentMinuteRange();
    const leadDateTimeStart = start.clone().subtract(MISSED_DIFFERENCE, 'minutes');
    const leadDateTimeEnd = end
      .clone()
      .add(CRON_DIFFERENCE - 1, 'minutes')
      .subtract(MISSED_DIFFERENCE, 'minutes');
    console.log('leadDateTimeStart-->',leadDateTimeStart);
    console.log('leadDateTimeEnd-->',leadDateTimeEnd);

      const filter = { where: {
        endDateTime: {
            [Op.between]: [leadDateTimeStart, leadDateTimeEnd],
        },
        statusCode: {
          [Op.in]: [appointmentStatus.CONFIRMED,appointmentStatus.PENDING],
        },
      }};
      
    const getAllConfirmedAppoint = await dbService.getAll({ model: db.Appointment, filter });
    console.log('getAllConfirmedAppoint-->',getAllConfirmedAppoint);
    for (const appointment of getAllConfirmedAppoint) {
        console.log('appointment.id',appointment.id);
        await dbService.updateOne({
            model: db.Appointment,
            updateParams: { statusCode: appointmentStatus.MISSED},
            filter: { where: { id: appointment?.id } },
        });
    }
  } catch (err) {
    logger.error('error in cron markAppointmentMissed', err);
    throw new Error(err);
  }
};
 
module.exports = {
    markAsAppointmentMissed,
};