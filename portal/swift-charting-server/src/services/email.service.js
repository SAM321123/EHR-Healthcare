const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const sgMail = require('@sendgrid/mail');
const config = require('../config/config');
const logger = require('../config/logger');
const { decodeHtml, getDynamicTemplate } = require('../utils');
const { renderEmailCampaignTemplate } = require('../utils/emailCampaignMergeTags');
const { Email_Templates } = require('../utils/constant');
const { isUserExist: isTemplateExist } = require('./user.service');
const { getModels, getModelsInClinicToConnectRedis, getModelsForWorker } = require('../utils/connection');
const dbService = require('./db.service');
const { isEmpty } = require('lodash');
const { roles } = require('../config/roles');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');

const MAIL_SERVERS = {
  SMTP: 'SMTP',
  SENDGRID: 'SENDGRID',
};

const activeMailServer = config.email.mailServer || MAIL_SERVERS.SENDGRID;
const isSendGridMailServer = activeMailServer === MAIL_SERVERS.SENDGRID;

if (isSendGridMailServer && config.email.sendgridKey) {
  sgMail.setApiKey(config.email.sendgridKey);
}

const EMAIL_REJECTED_MESSAGE = `Email not accepted by ${
  isSendGridMailServer ? 'SendGrid' : 'SMTP server'
}`;
const MAX_AUDIT_STRING_LENGTH = 250;

const maskEmailAddress = (email) => {
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return 'not-configured';
  }

  const [localPart, domain] = email.split('@');
  const visibleLocalPart = localPart.slice(0, 2);
  const maskedLocalPart = `${visibleLocalPart}${'*'.repeat(Math.max(localPart.length - visibleLocalPart.length, 0))}`;

  return `${maskedLocalPart}@${domain}`;
};

const extractEmailAddresses = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.flatMap(extractEmailAddresses);
  }

  if (typeof value === 'string') {
    return [value];
  }

  if (typeof value === 'object' && value.email) {
    return [value.email];
  }

  return [];
};

const serializeRecipients = (value) => {
  const recipients = extractEmailAddresses(value);

  if (!recipients.length) {
    if (Array.isArray(value)) {
      return JSON.stringify(value);
    }

    if (value && typeof value === 'object') {
      return value.email || JSON.stringify(value);
    }

    return value;
  }

  return recipients.length === 1 ? recipients[0] : JSON.stringify(recipients);
};

const truncateAuditValue = (value, maxLength = MAX_AUDIT_STRING_LENGTH) => {
  if (typeof value !== 'string') {
    return value;
  }

  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, Math.max(maxLength - 3, 0))}...`;
};

const createEmailAuditSafely = async (db, values) => {
  if (!db?.EmailAudit) {
    return;
  }

  try {
    await db.EmailAudit.create({
      ...values,
      email: truncateAuditValue(values.email),
      subject: truncateAuditValue(values.subject),
      errorMessage: truncateAuditValue(values.errorMessage),
    });
  } catch (auditError) {
    logger.error(`EmailAudit create failed: ${auditError.message}`);
  }
};

const updateEmailAuditSafely = async (db, values, where) => {
  if (!db?.EmailAudit) {
    return;
  }

  try {
    await db.EmailAudit.update(
      {
        ...values,
        errorMessage: truncateAuditValue(values.errorMessage),
      },
      { where }
    );
  } catch (auditError) {
    logger.error(`EmailAudit update failed: ${auditError.message}`);
  }
};

const normalizeAttachmentContent = (attachment = {}) => {
  const { content, encoding, path: attachmentPath, filePath } = attachment;
  const resolvedPath = attachmentPath || filePath;

  if (Buffer.isBuffer(content)) {
    return content.toString('base64');
  }

  if (content instanceof Uint8Array) {
    return Buffer.from(content).toString('base64');
  }

  if (typeof content === 'string') {
    const normalizedContent = content.startsWith('data:') ? content.split(',').pop() : content;

    if (encoding === 'base64' || content.startsWith('data:')) {
      return normalizedContent;
    }

    return Buffer.from(normalizedContent, 'utf8').toString('base64');
  }

  if (resolvedPath) {
    return fs.readFileSync(resolvedPath).toString('base64');
  }

  return null;
};

const normalizeAttachments = (attachments = []) => {
  const attachmentList = Array.isArray(attachments) ? attachments : [attachments];
  const normalizedAttachments = attachmentList
    .map((attachment) => {
      if (!attachment) {
        return null;
      }

      const base64Content = normalizeAttachmentContent(attachment);
      const attachmentPath = attachment.path || attachment.filePath;

      if (!base64Content) {
        return null;
      }

      const normalizedAttachment = {
        content: base64Content,
        filename: attachment.filename || attachment.name || (attachmentPath ? path.basename(attachmentPath) : 'attachment'),
        disposition: attachment.disposition || attachment.contentDisposition || (attachment.cid || attachment.contentId ? 'inline' : 'attachment'),
      };

      const attachmentType = attachment.type || attachment.contentType || attachment.mimetype || attachment.mimeType;
      if (attachmentType) {
        normalizedAttachment.type = attachmentType;
      }

      const contentId = attachment.contentId || attachment.cid;
      if (contentId) {
        normalizedAttachment.contentId = contentId;
        normalizedAttachment.content_id = contentId;
      }

      return normalizedAttachment;
    })
    .filter(Boolean);

  return normalizedAttachments.length ? normalizedAttachments : undefined;
};

const getConfiguredFromAddress = () => {
  if (isSendGridMailServer) {
    if (!config.email.sendgrid?.from) {
      return undefined;
    }

    if (config.email.sendgrid?.fromName) {
      return {
        email: config.email.sendgrid.from,
        name: config.email.sendgrid.fromName,
      };
    }

    return config.email.sendgrid.from;
  }

  if (!config.email.smtp?.from) {
    return undefined;
  }

  return config.email.smtp.from;
};

const getNonEmptyString = (value) => {
  if (typeof value !== 'string') {
    return undefined;
  }

  return value.trim() ? value : undefined;
};

const isEmptySendGridValue = (value) => {
  if (value === undefined || value === null) {
    return true;
  }

  if (typeof value === 'string') {
    return !value.trim();
  }

  if (Array.isArray(value)) {
    return value.length === 0;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length === 0;
  }

  return false;
};

const stripEmptySendGridFields = (payload) =>
  Object.fromEntries(Object.entries(payload).filter(([, value]) => !isEmptySendGridValue(value)));

const summarizeSendGridMessage = (message) => ({
  from: maskEmailAddress(message?.from?.email || message?.from),
  to: extractEmailAddresses(message?.to).map(maskEmailAddress),
  replyTo: maskEmailAddress(message?.replyTo?.email || message?.replyTo),
  subjectLength: message?.subject?.length || 0,
  textLength: message?.text?.length || 0,
  htmlLength: message?.html?.length || 0,
  attachmentCount: Array.isArray(message?.attachments) ? message.attachments.length : 0,
});

const buildSendGridEmailMessage = ({ attachments, from, text, html, subject, content, ...message }) => {
  const normalizedAttachments = normalizeAttachments(attachments);
  const sanitizedText = getNonEmptyString(text);
  const sanitizedHtml = getNonEmptyString(html);
  const fallbackText = sanitizedText || sanitizedHtml || getNonEmptyString(subject) || 'No content provided.';

  return stripEmptySendGridFields({
    from: from || getConfiguredFromAddress(),
    ...(sanitizedText ? { text: sanitizedText } : {}),
    ...(sanitizedHtml ? { html: sanitizedHtml } : {}),
    ...(!sanitizedText && !sanitizedHtml ? { text: fallbackText } : {}),
    ...(subject ? { subject } : {}),
    ...message,
    ...(normalizedAttachments ? { attachments: normalizedAttachments } : {}),
  });
};

const buildSmtpEmailMessage = ({ attachments, from, ...message }) => ({
  from: from || getConfiguredFromAddress(),
  ...message,
  ...(attachments ? { attachments } : {}),
});

const buildEmailMessage = (message) =>
  (isSendGridMailServer ? buildSendGridEmailMessage(message) : buildSmtpEmailMessage(message));

const getSendGridErrorMessage = (error) => {
  const providerErrors = error?.response?.body?.errors;

  if (Array.isArray(providerErrors) && providerErrors.length) {
    return providerErrors
      .map(({ message, field, help }) => [message, field ? `field: ${field}` : '', help].filter(Boolean).join(' '))
      .join('; ');
  }

  return error?.message || 'Failed to send email through SendGrid';
};

const verifySendGridConfig = async () => {
  if (!config.email.sendgridKey) {
    throw new Error('SendGrid API key is not configured');
  }

  if (!config.email.sendgrid?.from) {
    throw new Error('Email sender address is not configured');
  }

  return true;
};

const verifySmtpConfig = async () => {
  if (!config.email.smtp?.host) {
    throw new Error('SMTP host is not configured');
  }

  if (!config.email.smtp?.port) {
    throw new Error('SMTP port is not configured');
  }

  if (!config.email.smtp?.from) {
    throw new Error('Email sender address is not configured');
  }

  return true;
};

const sendgridTransport = {
  verify: verifySendGridConfig,
  sendMail: async (message) => {
    await verifySendGridConfig();

    const formattedMessage = buildEmailMessage(message);

    try {
      const response = await sgMail.send(formattedMessage);
      const [clientResponse] = Array.isArray(response) ? response : [response];
      const accepted = clientResponse?.statusCode >= 200 && clientResponse?.statusCode < 300
        ? extractEmailAddresses(formattedMessage.to)
        : [];

      return {
        accepted,
        rejected: accepted.length ? [] : extractEmailAddresses(formattedMessage.to),
        statusCode: clientResponse?.statusCode,
        headers: clientResponse?.headers,
      };
    } catch (error) {
      const errorMessage = getSendGridErrorMessage(error);

      logger.error(`SendGrid response body: ${JSON.stringify(error?.response?.body || {})}`);
      logger.error(`SendGrid payload summary: ${JSON.stringify(summarizeSendGridMessage(formattedMessage))}`);

      throw new Error(errorMessage);
    }
  },
};

const smtpClient = nodemailer.createTransport(config.email.smtp);

const smtpTransport = {
  verify: async () => {
    await verifySmtpConfig();
    return smtpClient.verify();
  },
  sendMail: async (message) => {
    await verifySmtpConfig();
    return smtpClient.sendMail(buildEmailMessage(message));
  },
};

const transport = isSendGridMailServer ? sendgridTransport : smtpTransport;
/* istanbul ignore next */
if (config.env !== 'test') {
  logger.info(
    `Mail service starting with provider=${activeMailServer} from=${maskEmailAddress(getConfiguredFromAddress()?.email || getConfiguredFromAddress())}`
  );
  transport
    .verify()
    .then(() => logger.info(`${activeMailServer} mail service configured`))
    .catch((err) => {
      logger.error(err);
      logger.warn(`Unable to configure ${activeMailServer} mail service...`);
    });
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async ({ uuid, to, replyTo, subject, text, html, ...rest }) => {
  const db = uuid ? getModels(uuid) : initializeModels(sequelize, true);

  const msg = {
    to,
    replyTo,
    subject,
    text,
    html,
    ...rest,
  };

  try {
    const result = await transport.sendMail(msg);

    let status = 'Failed';

    if (result?.accepted?.length > 0) {
      status = 'Sent';
    } else if (result?.rejected?.length > 0) {
      status = 'Rejected';
    }

    await createEmailAuditSafely(db, {
      email: serializeRecipients(to),
      subject,
      status,
    });
  } catch (error) {
    logger.error(error);
    await createEmailAuditSafely(db, {
      email: serializeRecipients(to),
      subject,
      status: 'Failed',
      errorMessage: error.message,
    });
  }
};
const sendEmailToCompose = async ({
  uuid,
  to,
  replyTo,
  subject,
  text,
  html,
  firstName,
  middleName,
  lastName,
  clinicName,
  templateParams = {},
  auditId,
  composeId,
  ...rest
}) => {
  const masterDb = initializeModels(sequelize, true);
  try {
    const params = {
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      clinicName: clinicName || '',
      ...templateParams,
    };
    const dynamicSubject = renderEmailCampaignTemplate({
      text: subject,
      params,
    });
    const dynamicText = renderEmailCampaignTemplate({
      text,
      params,
    });
    const dynamicHtml = renderEmailCampaignTemplate({
      text: html,
      params,
    });

    const msg = {
      to,
      replyTo,
      subject: dynamicSubject,
      text: dynamicText,
      html: dynamicHtml,
      ...rest,
    };

    const result = await transport.sendMail(msg);

    if (!result?.accepted?.length) {
      throw new Error(EMAIL_REJECTED_MESSAGE);
    }

    // ✅ SUCCESS STATUS UPDATE

    await updateEmailAuditSafely(masterDb, { status: 'SENT' }, { id: auditId });

    await masterDb.AdminEmailComposed.update({ status: 'SENT' }, { where: { id: composeId } });

    return result;
  } catch (error) {
    // ❌ FAILURE STATUS UPDATE

    await updateEmailAuditSafely(masterDb, { status: 'FAILED', errorMessage: error.message }, { id: auditId });

    await masterDb.AdminEmailComposed.update(
      { status: 'FAILED', errorMessage: error.message },
      { where: { id: composeId } }
    );

    throw error; // important for queue retry
  }
};
// For sending email from compose email option in clinic panel
const sendEmailToClinicToCompose = async ({
  clinicId,
  to,
  replyTo,
  subject,
  text,
  html,
  firstName,
  middleName,
  lastName,
  clinicName,
  templateParams = {},
  auditId,
  composeId,
  ...rest
}) => {
  console.log(
    '------------------------sendEmailToClinicToCompose------------------------',
    clinicId,
    to,
    replyTo,
    subject,
    html,
    firstName,
    middleName,
    lastName,
    clinicName,

    auditId,
    composeId
  );
  const masterDb = initializeModels(sequelize, true);
  const clinic = await masterDb.Practice.findByPk(clinicId);

  const db = getModels(clinic.id);

  try {
    const params = {
      firstName: firstName || '',
      middleName: middleName || '',
      lastName: lastName || '',
      clinicName: clinicName || '',
      ...templateParams,
    };
    const dynamicSubject = renderEmailCampaignTemplate({
      text: subject,
      params,
    });
    const dynamicText = renderEmailCampaignTemplate({
      text,
      params,
    });
    const dynamicHtml = renderEmailCampaignTemplate({
      text: html,
      params,
    });

    const msg = {
      to,
      replyTo,
      subject: dynamicSubject,
      text: dynamicText,
      html: dynamicHtml,
      ...rest,
    };


    const result = await transport.sendMail(msg);

    if (!result?.accepted?.length) {
      throw new Error(EMAIL_REJECTED_MESSAGE);
    }

    // ✅ SUCCESS STATUS UPDATE

    await updateEmailAuditSafely(db, { status: 'SENT' }, { id: auditId });

    await db.EmailCampaignComposeMail.update({ status: 'SENT' }, { where: { id: composeId } });

    return result;
  } catch (error) {
    // ❌ FAILURE STATUS UPDATE

    await updateEmailAuditSafely(db, { status: 'FAILED', errorMessage: error.message }, { id: auditId });

    await db.EmailCampaignComposeMail.update({ status: 'FAILED', errorMessage: error.message }, { where: { id: composeId } });

    throw error; // important for queue retry
  }
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (uuid, practiceSetting, { to, reqParams = {} }) => {
  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.FORGET_PASSWORD, isDeleted: false },
    });
    const { clientURL } = config;
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { practice, role, practiceName, ...rest } = reqParams;
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    // replace this url with the link to the reset password page of your front-end app
    const resetURL = `${clientURLForPractice}/reset-password?token=${reqParams.token}`;
    if (emailTemplate) {
      let template = emailTemplate.template;
      template = decodeHtml(template);
      const dynamicTemplate = getDynamicTemplate({
        text: template,
        params: { ...rest, logo, resetURL, clientURL: clientURLForPractice },
      });
      await sendEmail({
        uuid,
        to,
        replyTo: emailTemplate.replyTo,
        subject: emailTemplate.subject,
        html: dynamicTemplate,
        attachments: [practiceLogoAttechment],
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

const sendPasswordUpdateEmail = async (uuid, practiceSetting, { to, firstName }) => {
  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.RESET_PASSWORD, isDeleted: false },
    });
    const { clientURL } = config;
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    if (emailTemplate) {
      let template = emailTemplate.template;
      template = decodeHtml(template);
      const dynamicTemplate = getDynamicTemplate({
        text: template,
        params: { logo, clientURL: clientURLForPractice, patientFirstName: firstName },
      });
      await sendEmail({
        uuid,
        to,
        replyTo: emailTemplate.replyTo,
        subject: emailTemplate.subject,
        html: dynamicTemplate,
        attachments: [practiceLogoAttechment],
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

const sendPasswordGeneratedEmail = async (uuid, practiceSetting, { to, firstName }) => {
  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.GENERATE_PASSWORD, isDeleted: false },
    });
    const { clientURL } = config;
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    if (emailTemplate) {
      let template = emailTemplate.template;
      template = decodeHtml(template);
      const dynamicTemplate = getDynamicTemplate({
        text: template,
        params: { logo, clientURL: clientURLForPractice, patientFirstName: firstName },
      });
      await sendEmail({
        uuid,
        to,
        replyTo: emailTemplate.replyTo,
        subject: emailTemplate.subject,
        html: dynamicTemplate,
        attachments: [practiceLogoAttechment],
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

const sendFailedLoginAttemptEmail = async (uuid, practiceSetting, { to }) => {
  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.FAILED_LOGIN, isDeleted: false },
    });
    if (!emailTemplate) {
      const templateErrorMessage = 'Failed login email template not found';
      logger.warn(templateErrorMessage);
      await createEmailAuditSafely(db, {
        email: serializeRecipients(to),
        subject: 'Failed Login',
        status: 'Failed',
        errorMessage: templateErrorMessage,
      });
      return;
    }
    const { clientURL } = config;
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    let template = emailTemplate.template;
    template = decodeHtml(template);
    const dynamicTemplate = getDynamicTemplate({
      text: template,
      params: { logo, clientURL: clientURLForPractice },
    });
    await sendEmail({
      uuid,
      to,
      replyTo: emailTemplate.replyTo,
      subject: emailTemplate.subject,
      html: dynamicTemplate,
      attachments: [practiceLogoAttechment],
    });
  } catch (err) {
    logger.error(err);
    await createEmailAuditSafely(db, {
      email: serializeRecipients(to),
      subject: 'Failed Login',
      status: 'Failed',
      errorMessage: err.message,
    });
  }
};
/**
 * Send welcome email
 * @param {string} to
 * @returns {Promise}
 */
const sendWelcomeEmailToStaff = async (uuid, practiceSetting, { staff, token }, password) => {
  const db = getModels(uuid);

  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.STAFF_CREATE, isDeleted: false },
    });
    const { clientURL } = config;
    // const clientURLForPractice = clientURL.replace('localhost', `${practiceSetting?.practiceSetting?.domainName}.localhost`); // for localhost
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);

    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    template = decodeHtml(emailTemplate.template);

    const patientEmail = staff?.email;
    const patientPassword = password;

    const generatePasswordUrl = `${clientURLForPractice}/generate-password?token=${token}`;

    const dynamicTemplate = getDynamicTemplate({
      text: template,
      params: {
        patientFirstName: staff.firstName,
        patientMiddleName: staff.middleName || '',
        patientLastName: staff.lastName,
        clientURL: clientURLForPractice,
        logo,
        patientEmail,
        patientPassword,
        generatePasswordUrl,
      },
    });
    await sendEmail({
      uuid,
      to: staff.email,
      replyTo: emailTemplate.replyTo,
      subject: emailTemplate.subject,
      html: dynamicTemplate,
      attachments: [practiceLogoAttechment],
    });
  } catch (err) {
    logger.error(err);
  }
};

const sendWelcomeEmailToClinicAdmin = async (uuid, practiceSetting, { staff, token }) => {
  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.PATIENT_CREATE, isDeleted: false },
    });
    const { clientURL } = config;
    // const clientURLForPractice = clientURL.replace('localhost', `${practiceSetting?.domainName}.localhost`); // for localhost
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    template = decodeHtml(emailTemplate.template);

    const generatePasswordUrl = `${clientURLForPractice}/generate-password?token=${token}`;

    const dynamicTemplate = getDynamicTemplate({
      text: template,
      params: {
        patientFirstName: staff.firstName,
        patientMiddleName: staff.middleName || '',
        patientLastName: staff.lastName,
        clientURL: clientURLForPractice,
        logo,
        patientEmail: staff.email,
        patientPassword: staff.password,
        generatePasswordUrl,
      },
    });

    // Prepare email options
    const emailOptions = {
      uuid,
      to: staff.email,
      replyTo: emailTemplate.replyTo,
      subject: emailTemplate.subject,
      html: dynamicTemplate,
    };

    if (!isEmpty(practiceLogoAttechment)) {
      emailOptions.attachments = [practiceLogoAttechment];
    }
    await sendEmail(emailOptions);
  } catch (err) {
    logger.error(err);
  }
};

const sendWelcomeEmailToPatient = async (uuid, practiceSetting, { patient, user, token }, password) => {
  const { formLinkToMail } = require('./formLinkToMail.service');

  const db = getModels(uuid);
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.PATIENT_CREATE, isDeleted: false },
    });
    const { clientURL } = config;
    // const clientURLForPractice = clientURL.replace('localhost', `${practiceSetting?.practiceSetting?.domainName}.localhost`); // for localhost
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    template = decodeHtml(emailTemplate.template);
    const updatedTemplate = await formLinkToMail(template, patient, user, uuid);
    const { userId } = patient || {};

    const patientDetail = await db.User.findOne({
      where: { id: userId },
    });

    const patientEmail = patientDetail?.email;
    const patientPassword = password;
    const generatePasswordUrl = `${clientURLForPractice}/generate-password?token=${token}`;

    const dynamicTemplate = getDynamicTemplate({
      text: updatedTemplate,
      params: {
        patientFirstName: patient.firstName,
        patientMiddleName: patient.middleName || '',
        patientLastName: patient.lastName,
        clientURL: clientURLForPractice,
        logo,
        patientEmail,
        patientPassword,
        generatePasswordUrl,
      },
    });
    await sendEmail({
      uuid,
      to: patient.email,
      replyTo: emailTemplate.replyTo,
      subject: emailTemplate.subject,
      html: dynamicTemplate,
      attachments: [practiceLogoAttechment],
    });
  } catch (err) {
    logger.error(err);
  }
};

const sendBirthdayMail = async (uuid, practiceSetting, { patient }) => {
  try {
    const db = getModels(uuid);
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: Email_Templates.BIRTHDAY, isDeleted: false },
    });
    const { clientURL } = config;
    const clientURLForPractice = clientURL.replace('www', `${practiceSetting?.practiceSetting?.domainName}`);
    const { logo, practiceLogoAttechment = {} } = practiceSetting?.logoConfigs || {};
    template = decodeHtml(emailTemplate.template);
    const dynamicTemplate = getDynamicTemplate({
      text: template,
      params: {
        patientFirstName: patient.firstName,
        patientMiddleName: patient.middleName || '',
        patientLastName: patient.lastName,
        clientURL: clientURLForPractice,
        logo,
      },
    });
    await sendEmail({
      uuid,
      to: patient.email,
      replyTo: emailTemplate.replyTo,
      subject: emailTemplate.subject,
      html: dynamicTemplate,
      attachments: [practiceLogoAttechment],
    });
  } catch (err) {
    logger.error(err);
  }
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail({ to, subject, text });
};

const sendErrorMail = async ({ uuid, subject, ...rest }) => {
  // eslint-disable-next-line no-param-reassign
  subject = `${subject} (${config.env})`;
  await sendEmail({ uuid, subject, ...rest });
};

const sendVerificationCodeMail = async ({ uuid, email, req }) => {
  console.log('Sending verification email to:', email, req.session);

  // Generate a random 6-digit verification code
  const verificationCode = Math.floor(100000 + Math.random() * 900000);

  const subject = 'Verify Your Email - Action Required';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center;">Email Verification</h2>
      <p style="font-size: 16px; color: #555;">Dear user,</p>
      <p style="font-size: 16px; color: #555;">Please use the verification code below to confirm your email:</p>
      <div style="text-align: center; margin: 20px 0;">
        <span style="font-size: 24px; font-weight: bold; color: #3498db; padding: 10px 20px; border: 2px dashed #3498db; border-radius: 5px; display: inline-block;">
          ${verificationCode}
        </span>
      </div>
      <p style="font-size: 14px; color: #777;">If you did not request this, you can safely ignore this email.</p>
    </div>
  `;

  await sendEmail({ uuid, to: email, subject, html });
  return verificationCode;
};

const subCanOrDeacMailToClinicAndSuperAdmin = async ({ practice, superAdminEmail, mailType, subscription }) => {
  const uuid = practice?.id;
  const db = getModels(uuid);
  const clinicName = practice?.name;
  try {
    const emailTemplate = await isTemplateExist(db.EmailTemplate, {
      where: { emailTypeCode: mailType, isDeleted: false },
    });
    // replace this url with the link to the reset password page of your front-end app
    if (emailTemplate) {
      let template = emailTemplate.template;
      template = decodeHtml(template);
      const clinicAdmins = await db.User.findAll({
        where: { isDeleted: false },
        include: [{ model: db.Role, as: 'roles', where: { code: roles.CLINIC_ADMIN } }],
      });
      const emailParams = {
        clinicName,
        startDate: subscription?.startDate
          ? new Date(subscription.startDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          : '',
        endDate: subscription?.endDate
          ? new Date(subscription.endDate).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          : '',
        practitionerCount: subscription?.practitionerCount,
        rnCount: subscription?.rnCount,
        prescriberCount: subscription?.prescriberCount,
      };

      await sendEmail({
        uuid,
        to: superAdminEmail,
        replyTo: emailTemplate.replyTo,
        subject: emailTemplate.subject,
        html: getDynamicTemplate({
          text: template,
          params: {
            ...emailParams,
          },
        }),
      });
      if (!isEmpty(clinicAdmins)) {
        for (const admin of clinicAdmins) {
          await sendEmail({
            uuid,
            to: admin.email,
            replyTo: emailTemplate.replyTo,
            subject: emailTemplate.subject,
            html: getDynamicTemplate({
              text: template,
              params: {
                ...emailParams,
                clinicAdminMessage:
                  mailType === 'subscription_deactivated'
                    ? `<p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  <strong>Please activate your plan to continue accessing the platform's features.</strong>
                </p>`
                    : `<strong><p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                  Please create a new subscription to keep uninterrupted access.</strong>
                </p>`,
              },
            }),
          });
        }
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

const sendNewDeviceLoginNotificationEmail = async ({ email, userIp, deviceDetail, location, lastLoginTime, userTimezone = 'UTC', logo }) => {
  const moment = require('moment-timezone');
  
  // Convert lastLoginTime to user's timezone
  let formattedLoginTime = lastLoginTime;
  try {
    // Parse the UTC timestamp and convert to user's timezone
    const loginDate = moment.utc(lastLoginTime, 'YYYY-MM-DD HH:mm');
    if (loginDate.isValid() && userTimezone) {
      // Format with timezone-aware conversion
      formattedLoginTime = loginDate.tz(userTimezone).format('YYYY-MM-DD HH:mm');
      // Add timezone abbreviation for clarity
      const tzAbbr = loginDate.tz(userTimezone).format('z');
      formattedLoginTime = `${formattedLoginTime} ${tzAbbr}`;
    }
  } catch (tzError) {
    console.error('Error converting timezone for login notification:', tzError.message);
    // Fallback to original time if conversion fails
  }
  
  // Helper function to display location field or fallback
  const displayLocation = (value, fallback = 'Not available') => {
    return value && value.trim() ? value : fallback;
  };
  
  const subject = 'New device or location sign-in detected';
  const html = `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 500px;
    margin: auto;
    padding: 20px;
    border: 1px solid #ddd;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  ">
   ${logo
      ? `
        <div style="text-align: center; margin-bottom: 20px;">
          ${logo}
        </div>
        `
      : ''
    }
    <h2 style="color: #2c3e50; text-align: center;">
      New Login Detected
    </h2>

    <p style="font-size: 16px; color: #555;">
      Hi,
    </p>

    <p style="font-size: 16px; color: #555;">
      Your account was just accessed from a <strong>new device or location</strong>.
    </p>

    <div style="
      background-color: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 6px;
      padding: 15px;
      margin: 20px 0;
    ">
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>Time:</strong> ${formattedLoginTime}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>Device:</strong> ${deviceDetail}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>IP Address:</strong> ${userIp}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>Country:</strong> ${displayLocation(location?.country)}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>State:</strong> ${displayLocation(location?.state)}
      </p>
      <p style="font-size: 14px; color: #333; margin: 6px 0;">
        <strong>City:</strong> ${displayLocation(location?.city)}
      </p>
    </div>

    <p style="font-size: 15px; color: #b91c1c;">
      If not you, please reset your password.
    </p>
  </div>
`;
  await sendEmail({ to: email, subject, html });
};

const sendTwoFaToggleEmail = async ({ uuid, email, twoFaEnable }) => {

  // Determine the status text
  const statusText = twoFaEnable ? 'Enabled' : 'Disabled';

  const subject = `Two-Factor Authentication`;


  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
      <h2 style="color: #2c3e50; text-align: center;">Two-Factor Authentication ${statusText}</h2>
      <p style="font-size: 16px; color: #555;">Dear user,</p>
        <p style="font-size: 16px; color: #555;">
        This is a confirmation that Two-Factor Authentication has been 
        <strong>${statusText}</strong> on your account.
      </p>

    </div>
  `;

  await sendEmail({
    uuid,
    to: email,
    subject,
    html,
  });
};

const sendOofAppointmentCancelMail = async ({ clinicId, to, auditId }) => {
  const db = getModels(clinicId);

  // Determine the status text

  const subject = `Appointment Canceled - Staff Out of Office`;


  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Appointment Cancellation</title>
</head>

<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0;">

<div style="width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); border-radius: 8px;">

  <div style="text-align: center; padding: 20px 0; background-color: #dc3545; color: #ffffff; border-radius: 8px 8px 0 0;">
    <h1 style="font-size: 28px; margin: 0;">Appointment Cancelled</h1>
  </div>

  <div style="padding: 20px; text-align: left; color: #333333;">

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      Dear patient,
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      We regret to inform you that your appointment has been <strong>cancelled</strong>.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
      The practitioner will be <strong>out of office</strong> during this time.
      We apologize for any inconvenience this may cause.
    </p>
    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Please reschedule your appointment at your convenience through portal.
    </p>

    <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">
      Thank you for your understanding.
    </p>

  </div>

  <div style="text-align: center; padding: 20px; font-size: 14px; color: #777777; background-color: #f4f4f4; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;">&copy; 2024 Swift Charting. All rights reserved.</p>
  </div>

</div>

</body>
</html>`;

  try {

    const msg = {
      to,
      subject,
      html,
    };


    const result = await transport.sendMail(msg);

    if (!result?.accepted?.length) {
      throw new Error(EMAIL_REJECTED_MESSAGE);
    }

    // ✅ SUCCESS STATUS UPDATE

    await updateEmailAuditSafely(db, { status: 'SENT' }, { id: auditId });


    return result;
  } catch (error) {
    // ❌ FAILURE STATUS UPDATE

    await updateEmailAuditSafely(db, { status: 'FAILED', errorMessage: error.message }, { id: auditId });


    throw error; // important for queue retry
  }

};

module.exports = {
  subCanOrDeacMailToClinicAndSuperAdmin,
  transport,
  sendEmail,
  sendEmailToCompose,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendErrorMail,
  sendWelcomeEmailToStaff,
  sendPasswordUpdateEmail,   
  sendWelcomeEmailToPatient,
  sendBirthdayMail,
  sendWelcomeEmailToClinicAdmin,
  sendVerificationCodeMail,
  sendPasswordGeneratedEmail,
  sendFailedLoginAttemptEmail,
  sendNewDeviceLoginNotificationEmail,
  sendEmailToClinicToCompose,
  sendTwoFaToggleEmail,
  sendOofAppointmentCancelMail,
};
