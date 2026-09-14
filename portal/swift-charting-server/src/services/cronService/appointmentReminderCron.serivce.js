/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-await-in-loop */
const dbService = require('../db.service');
const moment = require('moment');
const logger = require('../../config/logger');
const { getModels } = require('../../utils/connection');
const { Op } = require('sequelize');
const { getCurrentMinuteRange } = require('../../utils/dateUtility');
const { getPracticeSettingsConfig } = require('../practiceSetting.service');
const { isUserExist: isTemplateExist } = require('../user.service');
const {Email_Templates} = require('../../utils/constant');
const { notifications } = require('../../config/notification');
const { appointmentActions } = require('../../config/appointment');
const { sendAppointmentNotificationAndMail } = require('../notification.service');

const sendAppointmentReminderMinutely = async ({ tenantId }) => {
  try {
    const currentDate = moment().utc();
    const extendedDate = currentDate.add(30, 'minutes');
    const {start:startOfMinute,end:endOfMinute} = getCurrentMinuteRange(extendedDate)
    const db = getModels(tenantId);
    const practiceSetting = await getPracticeSettingsConfig({ tenantId });
    const appointments = await dbService.getAll({
      model: db.Appointment,
      filter: {
        where: {
          startDateTime: {
            [Op.gte]: startOfMinute,
            [Op.lte]: endOfMinute,
          },
        },
      },
    });
    console.log("🚀 ~ sendAppointmentReminderMinutely ~ appointments:", appointments,startOfMinute)
    // eslint-disable-next-line no-restricted-syntax
    
    for (const appointment of appointments) {
      const emailTemplate = await isTemplateExist(db.EmailTemplate, {
        where: { emailTypeCode: Email_Templates.APPOINTMENT_REMINDER, typeCode:appointment.typeCode,  isDeleted: false}
      });
      if(emailTemplate){
        const clinicNotificationInfo = notifications.Clinic[appointmentActions.APPOINTMENT_REMINDER];
        const patientNotificationInfo = notifications.Patient[appointmentActions.APPOINTMENT_REMINDER];
        sendAppointmentNotificationAndMail({
          appointment:appointment,
          subject: emailTemplate?.subject,
          replyTo: emailTemplate?.replyTo,
          template: emailTemplate?.template,
          practiceSetting,
        },{tenantId,clinicNotificationInfo,patientNotificationInfo});

      }
    }
  } catch (err) {
    logger.error(`Error in cron sendAppointmentReminderMinutely`, err);
    throw new Error(err);
  }
};
module.exports = {
  sendAppointmentReminderMinutely,
};
