const { initializeModels } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getModels } = require('../../utils/connection');
const { sequelize } = require('../../config/database');
const { Email_Templates, REMINDER_DAYS } = require('../../utils/constant');
const { isUserExist: isTemplateExist } = require('../user.service');
const { getDynamicTemplate } = require('../../utils');
const { sendEmail } = require('../email.service');
const { dbService } = require('../db.service');
const { getDaysLeft } = require('../../utils/dateUtility');

const trialExpiryReminder = async ({ tenantId }) => {
  const masterDb = initializeModels(sequelize, true);
  const db = getModels(tenantId);
  const emailTemplate = await isTemplateExist(db.EmailTemplate, {
    where: {
      emailTypeCode: Email_Templates.TRIAL_EXPIRY_REMINDER,
      isDeleted: false,
    },
  });
  const practice = await masterDb.Practice.findOne({
    where: { id: tenantId, isDeleted: false, isActive: true },
  });
  const practiceTrialDetails = await masterDb.TrialSubscription.findOne({
    where: { practiceId: tenantId },
  });

  if (!emailTemplate || !practice || !practiceTrialDetails) {
    console.log('❌ Missing data, skipping email');
    return;
  }
  const daysLeft = getDaysLeft(practiceTrialDetails.endDate);
  console.log('🕒 Trial days left:', daysLeft);
  if (!REMINDER_DAYS.includes(daysLeft)) {
    console.log('⏭️ Not a reminder day, skipping email');
    return;
  }
  // ✅ Prepare email
  let template = emailTemplate.template;
  const dynamicTemplate = getDynamicTemplate({
    text: template,
    params: {
      clinicName: practice.name,
      startDate: practiceTrialDetails.startDate.toDateString(),
      endDate: practiceTrialDetails.endDate.toDateString(),
      daysLeft,
      clinicAdminMessage: daysLeft === 1 ? '<p><strong>Your trial expires tomorrow.</strong></p>' : '',
    },
  });

  await sendEmail({
    to: practice.email,
    replyTo: emailTemplate.replyTo,
    subject: emailTemplate.subject.replace('[daysLeft]', daysLeft),
    html: dynamicTemplate,
  });
};

module.exports = {
  trialExpiryReminder,
};
