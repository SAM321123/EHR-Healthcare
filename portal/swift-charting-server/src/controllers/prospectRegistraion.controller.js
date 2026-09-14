const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');
const { sequelize } = require('../config/database');
const he = require('he');
const { emailQueue } = require('../services/emailqueue');
const { initializeModels } = require('../models');
const { encryptString, decryptString } = require('../utils/secureVault');

const safeDecryptIfNeeded = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const raw = String(value);
  if (!raw.startsWith('v1:')) return raw; // backwards compat if plain text ever existed
  try {
    return decryptString(raw) || '';
  } catch (e) {
    // Never throw decrypted key errors to the UI; just treat as missing.
    return '';
  }
};

const normalizeStripePaymentMode = (value) => {
  if (typeof value !== 'string') return null;
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === 'live') return 'live';
  if (normalizedValue === 'test') return 'test';
  return null;
};

const resolveStripePaymentMode = (config) =>
  normalizeStripePaymentMode(config?.stripePaymentMode) ||
  (process.env.NODE_ENV === 'production' ? 'live' : 'test');

const sanitizeProspectRegistrationConfig = (config) => {
  if (!config) return {};
  const data = config.toJSON ? config.toJSON() : config;

  const hasStripeTestSecretKey = !!data.stripeTestSecretKey;
  const hasStripeTestWebhookSecret = !!data.stripeTestWebhookSecret;
  const hasStripeLiveSecretKey = !!data.stripeLiveSecretKey;
  const hasStripeLiveWebhookSecret = !!data.stripeLiveWebhookSecret;

  delete data.stripeTestSecretKey;
  delete data.stripeTestWebhookSecret;
  delete data.stripeLiveSecretKey;
  delete data.stripeLiveWebhookSecret;

  return {
    ...data,
    stripePaymentMode: resolveStripePaymentMode(data),
    hasStripeTestSecretKey,
    hasStripeTestWebhookSecret,
    hasStripeLiveSecretKey,
    hasStripeLiveWebhookSecret,
  };
};

const getProspectRegistration = catchAsync(async (req, res) => {
  // return the single configuration record for the current tenant
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });

  // if there's no configuration yet, return empty object
  res.status(httpStatus.OK).send({ success: true, data: sanitizeProspectRegistrationConfig(config) });
});

// Public endpoint for the widget to fetch display-only config (no auth required).
const getProspectRegistrationWidgetConfig = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });
  const stripePaymentMode = resolveStripePaymentMode(config);

  res.status(httpStatus.OK).send({
    success: true,
    data: {
      instructionText: config?.instructionText || '',
      serviceIds: Array.isArray(config?.serviceIds) ? config.serviceIds : [],
      paymentRequired: !!config?.paymentRequired,
      stripeMode: stripePaymentMode,
      stripePublishableKey:
        stripePaymentMode === 'live'
          ? config?.stripeLivePublishableKey || ''
          : config?.stripeTestPublishableKey || '',
    },
  });
});

// Authenticated endpoint to fetch Stripe keys (secrets decrypted for admin UI only).
const getProspectRegistrationStripeKeys = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });

  if (!config) {
    return res.status(httpStatus.OK).send({ success: true, data: {} });
  }

  const data = config.toJSON ? config.toJSON() : config;

  res.status(httpStatus.OK).send({
    success: true,
    data: {
      stripePaymentMode: resolveStripePaymentMode(data),
      stripeTestPublishableKey: data?.stripeTestPublishableKey || '',
      stripeTestSecretKey: safeDecryptIfNeeded(data?.stripeTestSecretKey),
      stripeTestWebhookSecret: safeDecryptIfNeeded(data?.stripeTestWebhookSecret),
      stripeLivePublishableKey: data?.stripeLivePublishableKey || '',
      stripeLiveSecretKey: safeDecryptIfNeeded(data?.stripeLiveSecretKey),
      stripeLiveWebhookSecret: safeDecryptIfNeeded(data?.stripeLiveWebhookSecret),
    },
  });
});

// Authenticated endpoint to store Stripe keys (secret/webhook are encrypted at rest).
const updateProspectRegistrationStripeKeys = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const normalize = (v) =>
    typeof v === 'string' && v.trim() === '' ? null : v;

  const {
    stripeTestPublishableKey,
    stripeTestSecretKey,
    stripeTestWebhookSecret,
    stripeLivePublishableKey,
    stripeLiveSecretKey,
    stripeLiveWebhookSecret,
    stripePaymentMode,
  } = req.body || {};

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });

  if (!config) {
    return res.status(httpStatus.BAD_REQUEST).send({
      success: false,
      message: 'Save prospect registration settings first, then add Stripe details.',
    });
  }

  const update = {};

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeTestPublishableKey')) {
    update.stripeTestPublishableKey = normalize(stripeTestPublishableKey);
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeLivePublishableKey')) {
    update.stripeLivePublishableKey = normalize(stripeLivePublishableKey);
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripePaymentMode')) {
    update.stripePaymentMode =
      normalizeStripePaymentMode(stripePaymentMode) || resolveStripePaymentMode(config);
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeTestSecretKey')) {
    update.stripeTestSecretKey = encryptString(normalize(stripeTestSecretKey));
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeLiveSecretKey')) {
    update.stripeLiveSecretKey = encryptString(normalize(stripeLiveSecretKey));
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeTestWebhookSecret')) {
    update.stripeTestWebhookSecret = encryptString(normalize(stripeTestWebhookSecret));
  }
  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'stripeLiveWebhookSecret')) {
    update.stripeLiveWebhookSecret = encryptString(normalize(stripeLiveWebhookSecret));
  }

  const updated = await config.update({
    ...update,
    updatedById: req.user?.id,
  });

  res.status(httpStatus.OK).send({
    success: true,
    message: 'Stripe details saved successfully.',
    data: {
      stripePaymentMode: resolveStripePaymentMode(updated),
      stripeTestPublishableKey: updated?.stripeTestPublishableKey || '',
      stripeLivePublishableKey: updated?.stripeLivePublishableKey || '',
      hasStripeTestSecretKey: !!updated?.stripeTestSecretKey,
      hasStripeTestWebhookSecret: !!updated?.stripeTestWebhookSecret,
      hasStripeLiveSecretKey: !!updated?.stripeLiveSecretKey,
      hasStripeLiveWebhookSecret: !!updated?.stripeLiveWebhookSecret,
    },
  });
});
const createProspectRegistration = catchAsync(async (req, res) => {
  const { clinicUuid } = req;

  const {
    link,
    codeLink,
    templateId: templateIdFromBody,
    templateName,
    staffs: staffsFromBody,
    staffIds: staffIdsFromBody,
    serviceIds: serviceIdsFromBody,
    services: servicesFromBody,
    questionnaireFormId: questionnaireFormIdFromBody,
    paymentRequired,
    widgetInstructions,
    instructionText,
  } = req.body || {};

  const templateIdRaw =
    templateIdFromBody ??
    (typeof templateName === 'object'
      ? templateName?.id ?? templateName?.templateId ?? templateName?.value
      : templateName);
  const templateId =
    typeof templateIdRaw === 'string'
      ? Number.isNaN(Number(templateIdRaw))
        ? templateIdRaw
        : Number(templateIdRaw)
      : templateIdRaw;

  const staffsRaw = staffsFromBody ?? staffIdsFromBody ?? [];
  const staffIds = Array.isArray(staffsRaw)
    ? staffsRaw
        .map((s) => {
          if (s == null) return null;
          if (typeof s === 'object') {
            return s.id ?? s.staffId ?? s.userId ?? s.value ?? null;
          }
          if (typeof s === 'string') {
            const n = Number(s);
            return Number.isNaN(n) ? s : n;
          }
          return s;
        })
        .filter((id) => id !== null && id !== undefined && id !== '')
    : [];

  const servicesRaw = servicesFromBody ?? serviceIdsFromBody ?? [];
  const serviceIds = Array.isArray(servicesRaw)
    ? servicesRaw
        .map((s) => {
          if (s == null) return null;
          if (typeof s === 'object') {
            return s.id ?? s.procedureCodeId ?? s.value ?? null;
          }
          if (typeof s === 'string') {
            const n = Number(s);
            return Number.isNaN(n) ? s : n;
          }
          return s;
        })
        .filter((id) => id !== null && id !== undefined && id !== '')
    : [];

  const questionnaireFormId =
    questionnaireFormIdFromBody == null || questionnaireFormIdFromBody === ''
      ? null
      : Number.isNaN(Number(questionnaireFormIdFromBody))
        ? questionnaireFormIdFromBody
        : Number(questionnaireFormIdFromBody);

  const finalPaymentRequired =
    paymentRequired === true ||
    paymentRequired === 'true' ||
    paymentRequired === 1 ||
    paymentRequired === '1';

  const finalInstructionText = widgetInstructions ?? instructionText ?? '';
  const finalCodeLink = link ?? codeLink ?? '';

  console.log('Received Prospect Registration Data:', {
    templateId,
    staffIds,
    widgetInstructions: finalInstructionText,
    link: finalCodeLink,
  });

  if (templateId === undefined || templateId === null || staffIds.length === 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'Template ID and at least one staff member are required.',
    });
  }

  const db = getModels(clinicUuid);

  if (questionnaireFormId !== null && questionnaireFormId !== undefined) {
    const questionnaireForm = await db.Form.findOne({
      where: {
        id: questionnaireFormId,
        formTypeCode: 'FT_QUESTIONNAIRES',
        isDeleted: false,
        isActive: true,
      },
    });

    if (!questionnaireForm) {
      return res.status(httpStatus.BAD_REQUEST).json({
        message: 'Selected questionnaire form is invalid.',
      });
    }
  }

  // check if a configuration already exists (per tenant there should be only one)
  let data = await db.ProspectRegistration.findOne({ where: { isDeleted: false } });

  if (data) {
    // update existing record
    data = await data.update({
      templateId,
      staffIds,
      serviceIds,
      questionnaireFormId,
      paymentRequired: finalPaymentRequired,
      instructionText: finalInstructionText,
      codeLink: finalCodeLink,
      updatedById: req.user?.id,
    });
  } else {
    // create new record
    data = await db.ProspectRegistration.create({
      templateId,
      staffIds,
      serviceIds,
      questionnaireFormId,
      paymentRequired: finalPaymentRequired,
      instructionText: finalInstructionText,
      codeLink: finalCodeLink,
      createdById: req.user?.id,
    });
  }

  res.status(httpStatus.OK).json({
    success: true,
    message: 'Registration settings saved successfully',
    data: sanitizeProspectRegistrationConfig(data),
  });
});
const getEmailClinicById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { id } = req.params;

  // 1. Find the master composition record
  const emailComposed = await db.EmailCampaignComposeMail.findOne({
    where: { id },
  });

  if (!emailComposed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email composed record not found');
  }

  // 2. Safely extract the IDs from the array of objects
  let targetIds = [];

  if (Array.isArray(emailComposed.patients)) {
    // Extract the 'patientId' property from each object in the array
    targetIds = emailComposed.patients.map((p) => p.patientId).filter((id) => id !== undefined);
  }

  let targetedStaff = [];

  // 3. Fetch patients only if we have valid IDs
  if (targetIds.length > 0) {
    targetedStaff = await db.Patient.findAll({
      where: {
        id: { [Op.in]: targetIds }, // Now this is [2], not [[object Object]]
        isDeleted: false,
      },
      attributes: ['firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC']],
    });
  } else if (emailComposed.sendTo === 'all') {
    // Optional: Handle 'all' selection if patients array is empty
    targetedStaff = await db.Patient.findAll({
      where: { isDeleted: false },
      attributes: ['firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC']],
    });
  }

  // 4. Send response
  res.status(httpStatus.OK).send({
    details: emailComposed,
    staffList: targetedStaff,
  });
});
module.exports = {
  getProspectRegistration,
  getProspectRegistrationWidgetConfig,
  getProspectRegistrationStripeKeys,
  updateProspectRegistrationStripeKeys,
  createProspectRegistration,
  getEmailClinicById,
};
