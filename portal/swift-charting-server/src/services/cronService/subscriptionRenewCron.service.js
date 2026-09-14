const { initializeModels } = require('../../models');
const ApiError = require('../../utils/ApiError');
const { getModels } = require('../../utils/connection');
const { sequelize } = require('../../config/database');
const { Email_Templates, RENEW_REMINDER_DAYS } = require('../../utils/constant');
const { isUserExist: isTemplateExist } = require('../user.service');
const { getDynamicTemplate } = require('../../utils');
const { sendEmail } = require('../email.service');
const { dbService } = require('../db.service');
const { getDaysLeft } = require('../../utils/dateUtility');

const subscriptionRenew = async ({ tenantId }) => {
  const masterDb = initializeModels(sequelize, true);
  const db = getModels(tenantId);
  const emailTemplate = await isTemplateExist(db.EmailTemplate, {
    where: {
      emailTypeCode: Email_Templates.SUBSCRIPTION_RENEWAL,
      isDeleted: false,
    },
  });
  const practice = await masterDb.Practice.findOne({
    where: { id: tenantId, isDeleted: false, isActive: true },
  });
  const practiceSubscriptionDetails = await masterDb.Subscription.findOne({
    where: { practiceId: tenantId ,isActive: true, isCancel: false},
  });

  if (!emailTemplate || !practice || !practiceSubscriptionDetails) {
    console.log('❌ Missing data, skipping email');
    return;
  }
  const daysLeft = getDaysLeft(practiceSubscriptionDetails.endDate);
  if (!RENEW_REMINDER_DAYS.includes(daysLeft)) {
    console.log('⏭️ Not a reminder day, skipping email');
    return;
  }
  // ✅ Prepare email
  let template = emailTemplate.template;
  const dynamicTemplate = getDynamicTemplate({
    text: template,
    params: {
      clinicName: practice.name,
    },
  });

  await sendEmail({
    to: practice.email,
    replyTo: emailTemplate.replyTo,
    subject: emailTemplate.subject,
    html: dynamicTemplate,
  });
};

module.exports = {
  subscriptionRenew,
};
