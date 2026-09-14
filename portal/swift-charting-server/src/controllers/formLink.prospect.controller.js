const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { Op } = require('sequelize');
const Stripe = require('stripe');
const crypto = require('crypto');
const { decryptString } = require('../utils/secureVault');
const { sendEmail } = require('../services/email.service');
const { formLinkToMail } = require('../services/formLinkToMail.service');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { decodeHtml, getDynamicTemplate } = require('../utils');
const { roles } = require('../config/roles');

const normalizeEmpty = (value) =>
  typeof value === 'string' && value.trim() === '' ? null : value;

const safeDecryptIfNeeded = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const raw = String(value);
  if (!raw.startsWith('v1:')) return raw; // backwards compat if plain text ever existed
  try {
    return decryptString(raw);
  } catch (e) {
    return null;
  }
};

const normalizeStripeMode = (value) => {
  if (typeof value !== 'string') return null;
  const normalizedValue = value.trim().toLowerCase();
  if (normalizedValue === 'live') return 'live';
  if (normalizedValue === 'test') return 'test';
  return null;
};

const resolveStripeMode = (config, preferredMode) =>
  normalizeStripeMode(preferredMode) ||
  normalizeStripeMode(config?.stripePaymentMode) ||
  (process.env.NODE_ENV === 'production' ? 'live' : 'test');

const getStripeSecretKeyFromConfig = (config, preferredMode) => {
  const mode = resolveStripeMode(config, preferredMode);
  const encrypted =
    mode === 'live' ? config?.stripeLiveSecretKey : config?.stripeTestSecretKey;
  return safeDecryptIfNeeded(encrypted);
};

const resolveNumericId = (rawValue) => {
  const value = normalizeEmpty(rawValue);
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return value;
  if (typeof value === 'string' && /^\d+$/.test(value)) return Number(value);
  return null;
};

const resolveServiceId = (serviceRaw) => {
  const value = normalizeEmpty(serviceRaw);
  if (value === null || value === undefined) return null;
  return resolveNumericId(value);
};

const getProcedureAmountDollars = (procedure) => {
  if (!procedure) return null;
  const total = procedure?.total;
  if (Number.isFinite(Number(total))) return Number(total);

  const qty = Number(procedure?.qty ?? 0);
  const price = Number(procedure?.price ?? 0);
  if (!Number.isFinite(qty) || !Number.isFinite(price)) return null;

  const computed = qty * price;
  return Number.isFinite(computed) ? computed : null;
};

const normalizeIdList = (raw) => {
  const list = Array.isArray(raw) ? raw : raw ? [raw] : [];
  return list
    .map((v) => {
      if (v == null) return null;
      if (typeof v === 'object') return v?.id ?? v?.staffId ?? v?.userId ?? v?.value ?? null;
      if (typeof v === 'string') {
        const n = Number(v);
        return Number.isNaN(n) ? v : n;
      }
      return v;
    })
    .filter((v) => v !== null && v !== undefined && v !== '');
};

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const getOriginFromUrl = (value) => {
  const normalizedValue = normalizeEmpty(value);
  if (!normalizedValue) return null;

  try {
    return new URL(normalizedValue).origin;
  } catch (error) {
    return null;
  }
};

const buildStaffRegistrationSummaryHtml = ({
  firstName,
  lastName,
  preferredName,
  email,
  preferredContactNumber,
  optInTextReminder,
  dateOfBirth,
  sexAtBirth,
  race,
  ethnicity,
  genderIdentity,
  pronoun,
  preferredLanguage,
  streetAddress,
  city,
  state,
  zip,
  personalId,
  service,
}) => {
  const fields = [
    ['First Name', firstName],
    ['Last Name', lastName],
    ['Preferred Name', preferredName],
    ['Email', email],
    ['Preferred Contact Number', preferredContactNumber],
    ['Opt-in To Text Reminders', optInTextReminder ? 'Yes' : 'No'],
    ['Date Of Birth', dateOfBirth],
    ['Sex At Birth', sexAtBirth],
    ['Race', race],
    ['Ethnicity', ethnicity],
    ['Gender Identity', genderIdentity],
    ['Pronoun', pronoun],
    ['Preferred Language', preferredLanguage],
    ['Street Address', streetAddress],
    ['City', city],
    ['State', state],
    ['Zip', zip],
    ['Personal ID', personalId],
    ['Service', service],
  ];

  const rows = fields
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600;vertical-align:top;">${escapeHtml(
          label
        )}</td><td style="padding:8px;border:1px solid #e5e7eb;">${escapeHtml(
          normalizeEmpty(value) ?? 'N/A'
        )}</td></tr>`
    )
    .join('');

  return `
    <div style="font-family:Arial,sans-serif;color:#111827;">
      <p style="margin:0 0 12px 0;">A new patient has submitted the prospect registration widget form.</p>
      <table style="border-collapse:collapse;width:100%;max-width:900px;">
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
};

const truncateText = (value, max = 250) => {
  if (value === null || value === undefined) return null;
  const text = String(value);
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const safePaymentErrorText = (error) => {
  if (!error) return null;
  if (typeof error === 'string') return truncateText(error);
  if (typeof error === 'object') {
    return truncateText(
      error?.message || error?.code || error?.type || error?.decline_code || 'Payment logging error'
    );
  }
  return truncateText(String(error));
};

const generatePortalPassword = () => {
  const lower = 'abcdefghijklmnopqrstuvwxyz';
  const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const special = '@$!%*?&';
  const all = `${lower}${upper}${digits}${special}`;
  const chars = [
    lower[crypto.randomInt(lower.length)],
    upper[crypto.randomInt(upper.length)],
    digits[crypto.randomInt(digits.length)],
    special[crypto.randomInt(special.length)],
  ];

  while (chars.length < 12) {
    chars.push(all[crypto.randomInt(all.length)]);
  }

  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }

  return chars.join('');
};

const buildProspectPaymentLogPayload = ({
  paymentIntent,
  category = 'prospect_registration_payment',
}) => {
  const base =
    paymentIntent && typeof paymentIntent === 'object' ? { ...paymentIntent } : {};
  return {
    ...base,
    category,
  };
};

const upsertPaymentLog = async ({
  db,
  paymentIntentId,
  status,
  error,
  payload,
}) => {
  const normalizedIntentId = normalizeEmpty(paymentIntentId)?.toString();
  if (!normalizedIntentId) return;

  const serializedPayload =
    payload && typeof payload === 'object' ? JSON.stringify(payload) : null;

  const existingLog = await db.PaymentLogs.findOne({
    where: { paymentIntentId: normalizedIntentId, isDeleted: false },
  });

  const logBody = {
    status: normalizeEmpty(status) || null,
    error: safePaymentErrorText(error),
    response: serializedPayload,
  };

  if (existingLog) {
    await existingLog.update(logBody);
    return;
  }

  await db.PaymentLogs.create({
    paymentIntentId: normalizedIntentId,
    ...logBody,
  });
};

const ensurePatientPortalUser = async ({
  db,
  clinicUuid,
  firstName,
  lastName,
  email,
  transaction,
}) => {
  const patientRole = await db.Role.findOne({
    where: { code: roles.PATIENT },
    transaction,
  });

  let user = await db.User.findOne({
    where: { email, isDeleted: false },
    include: [
      {
        model: db.Role,
        as: 'roles',
        attributes: ['id', 'code'],
        through: { attributes: [] },
        required: false,
      },
    ],
    transaction,
  });

  if (!user) {
    user = await db.User.create(
      {
        firstName: firstName?.toString().trim(),
        lastName: lastName?.toString().trim(),
        email,
        password: generatePortalPassword(),
        tenantId: clinicUuid,
      },
      { transaction }
    );
  }

  const hasPatientRole = user?.roles?.some((role) => role.code === roles.PATIENT);
  if (patientRole?.id && !hasPatientRole) {
    await user.addRole(patientRole.id, { transaction });
  }

  return user;
};

/**
 * POST - Create Prospect Registration
 * Triggered by the public 'Register Now' button.
 */
const createFormLinkProspect = catchAsync(async (req, res) => {
  const { clinicUuid } = req;

  const {
    firstName,
    lastName,
    preferredName,
    email,
    // allow both legacy and new field names
    phone,
    preferredContactNumber,
    optInTextReminder,
    dob,
    dateOfBirth,
    sexAtBirth,
    race,
    ethnicity,
    genderIdentity,
    pronoun,
    preferredLanguage,
    address,
    streetAddress,
    city,
    state,
    zip,
    personalId,
    service,
    clinicId,
    templateId,
    staffIds,
    stripePaymentIntentId,
    stripeMode,
  } = req.body || {};

  if (!clinicUuid) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Missing clinic context.',
    });
  }

  if (!firstName || !lastName || !email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'First name, last name, and email are required.',
    });
  }

  const normalizedEmail = normalizeEmpty(email)?.toString().trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email is required.',
    });
  }

  const normalizedSexAtBirth = (() => {
    const value = normalizeEmpty(sexAtBirth);
    if (!value) return null;
    if (typeof value !== 'string') return value;

    const lower = value.toLowerCase();
    if (lower === 'male') return 'Male';
    if (lower === 'female') return 'Female';
    return null; // avoid invalid enum values (e.g. empty/other strings)
  })();

  const resolvedPreferredContactNumber = normalizeEmpty(
    preferredContactNumber ?? phone ?? null
  );
  const resolvedDateOfBirth = normalizeEmpty(dateOfBirth ?? dob ?? null);
  const resolvedStreetAddress = normalizeEmpty(streetAddress ?? address ?? null);

  const db = getModels(clinicUuid);

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });
  const paymentRequired = !!config?.paymentRequired;
  const allowedServiceIds = Array.isArray(config?.serviceIds) ? config.serviceIds : [];
  const staffIdsToUse = normalizeIdList(config?.staffIds ?? staffIds);
  const selectedQuestionnaireFormId = resolveNumericId(config?.questionnaireFormId);
  const questionnaireBaseUrl =
    getOriginFromUrl(config?.codeLink) || getOriginFromUrl(req.headers?.origin);

  const resolveGlobalTypeCode = async (globalCategoryTypeCode, rawValue, transaction) => {
    const value = normalizeEmpty(rawValue);
    if (!value) return null;

    const result = await db.GlobalType.findOne({
      where: {
        globalCategoryTypeCode,
        isDeleted: false,
        [Op.or]: [{ code: value }, { name: { [Op.iLike]: value } }],
      },
      transaction,
    });

    // Patient FK fields must store an existing GlobalType.code or null.
    // Returning the raw value can violate FK constraints when UI sends labels/placeholders.
    return result?.code || null;
  };

  const serviceId = resolveServiceId(service);
  if (serviceId && allowedServiceIds.length > 0) {
    const allowedSet = new Set(allowedServiceIds.map(String));
    if (!allowedSet.has(String(serviceId))) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Selected service is not allowed for this registration form.',
      });
    }
  }

  const selectedProcedure = serviceId
    ? await db.ProcedureCode.findOne({
        where: { id: serviceId, isDeleted: false },
      })
    : null;

  if (serviceId && !selectedProcedure) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Invalid service selected.',
    });
  }

  const selectedQuestionnaireForm = selectedQuestionnaireFormId
    ? await db.Form.findOne({
        where: {
          id: selectedQuestionnaireFormId,
          formTypeCode: 'FT_QUESTIONNAIRES',
          isDeleted: false,
          isActive: true,
        },
      })
    : null;

  const amountDollars = getProcedureAmountDollars(selectedProcedure);
  const amountCents =
    amountDollars !== null && amountDollars !== undefined
      ? Math.round(Number(amountDollars) * 100)
      : null;

  const requiresPayment = paymentRequired && !!serviceId && !!amountCents && amountCents > 0;

  if (requiresPayment) {
    if (!stripePaymentIntentId || String(stripePaymentIntentId).trim() === '') {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Payment is required. Missing payment intent id.',
      });
    }

    const paymentMode = resolveStripeMode(config, stripeMode);
    const secretKey = getStripeSecretKeyFromConfig(config, paymentMode);
    if (!secretKey) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message:
          'Payment is required but Stripe secret key is not configured. Please contact the clinic.',
      });
    }

    const stripe = new Stripe(secretKey);
    const paymentIntent = await stripe.paymentIntents.retrieve(String(stripePaymentIntentId));

    const isOkStatus = paymentIntent?.status === 'succeeded';
    const isOkAmount = Number(paymentIntent?.amount) === Number(amountCents);
    const isOkCurrency = String(paymentIntent?.currency || '').toLowerCase() === 'usd';
    const isOkClinic =
      String(paymentIntent?.metadata?.clinicUuid || '') === String(clinicUuid);
    const isOkService =
      String(paymentIntent?.metadata?.serviceId || '') === String(serviceId);
    const isOkMode =
      String(paymentIntent?.metadata?.mode || '').toLowerCase() === String(paymentMode);

    if (!isOkStatus || !isOkAmount || !isOkCurrency || !isOkClinic || !isOkService || !isOkMode) {
      // best-effort log
      try {
        await upsertPaymentLog({
          db,
          paymentIntentId: stripePaymentIntentId,
          status: paymentIntent?.status || 'invalid',
          error: 'Invalid payment intent for this registration.',
          payload: buildProspectPaymentLogPayload({
            paymentIntent,
          }),
        });
      } catch (e) {
        // ignore logging errors
      }

      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Payment verification failed. Please try again.',
      });
    }

    // best-effort log verification success
    try {
      await upsertPaymentLog({
        db,
        paymentIntentId: stripePaymentIntentId,
        status: paymentIntent?.status,
        error: null,
        payload: buildProspectPaymentLogPayload({
          paymentIntent,
        }),
      });
    } catch (e) {
      // ignore logging errors
    }
  }

  const transaction = await db.Patient.sequelize.transaction();
  try {
    const emailWhere = db.Patient.sequelize.where(
      db.Patient.sequelize.fn('lower', db.Patient.sequelize.col('email')),
      normalizedEmail
    );

    const existingPatient = await db.Patient.findOne({
      where: emailWhere,
      transaction,
    });

    if (existingPatient) {
      await transaction.rollback();
      return res.status(httpStatus.CONFLICT).json({
        success: false,
        message: 'Patient with this email already exists.',
      });
    }

    const sexAtBirthCode = await resolveGlobalTypeCode(
      'gender_at_birth',
      normalizedSexAtBirth,
      transaction
    );
    const raceCode = await resolveGlobalTypeCode('race_code', race, transaction);
    const genderIdentityCode = await resolveGlobalTypeCode(
      'gender',
      genderIdentity,
      transaction
    );
    const pronounsCode = await resolveGlobalTypeCode('pronouns', pronoun, transaction);

    const resolvedDob = resolvedDateOfBirth ? new Date(resolvedDateOfBirth) : null;

    const patientAddress =
      resolvedStreetAddress || city || state || zip
        ? {
            address: resolvedStreetAddress || undefined,
            city: normalizeEmpty(city) || undefined,
            stateCode: normalizeEmpty(state) || undefined,
            postalCode: normalizeEmpty(zip) || undefined,
          }
        : null;

    const procedure = serviceId
      ? await db.ProcedureCode.findOne({
          where: { id: serviceId, isDeleted: false },
          transaction,
        })
      : null;
    const serviceLabel = procedure
      ? `${procedure.cptCode ? `${procedure.cptCode} - ` : ''}${procedure.name}`
      : null;

    const patientNotes = serviceLabel
      ? `Prospect registration preferred service: ${serviceLabel}`
      : null;

    const patientUser = await ensurePatientPortalUser({
      db,
      clinicUuid,
      firstName,
      lastName,
      email: normalizedEmail,
      transaction,
    });

    const patient = await db.Patient.create(
      {
        firstName: firstName?.toString().trim(),
        lastName: lastName?.toString().trim(),
        preferredName: normalizeEmpty(preferredName),
        email: normalizedEmail,
        phone: resolvedPreferredContactNumber,
        dob: resolvedDob,
        sexAtBirthCode,
        raceCode,
        genderIdentityCode,
        pronounsCode,
        languagesSpoken: normalizeEmpty(preferredLanguage),
        driversLicensNo: normalizeEmpty(personalId),
        address: patientAddress,
        notes: patientNotes,
        userId: patientUser?.id || null,
      },
      { transaction }
    );

    const prospect = await db.FormLinkProspect.create(
      {
        firstName,
        lastName,
        preferredName,
        email: normalizedEmail,
        preferredContactNumber: resolvedPreferredContactNumber,
        optInTextReminder: optInTextReminder || false,
        dateOfBirth: resolvedDateOfBirth,
        sexAtBirth: normalizedSexAtBirth,
        race,
        ethnicity,
        genderIdentity,
        pronoun,
        preferredLanguage,
        streetAddress: resolvedStreetAddress,
        city,
        state,
        zip,
        personalId,
        service: serviceLabel || (serviceId ? String(serviceId) : normalizeEmpty(service)),
        clinicId,
        templateId,
        staffIds: staffIdsToUse.length > 0
          ? staffIdsToUse
          : Array.isArray(staffIds)
            ? staffIds
            : staffIds
              ? [staffIds]
              : null,
        route: req.originalUrl,
      },
      { transaction }
    );

    await transaction.commit();

    // Email notifications (best-effort): selected template to patient,
    // registration summary to selected staff.
    try {
      const templateIdToUse = config?.templateId ?? templateId ?? null;

      const [emailTemplate, staffs, practiceSettingConfig] = await Promise.all([
        templateIdToUse
          ? db.EmailCampaignTemplate.findOne({
              where: { id: templateIdToUse, isDeleted: false, isActive: true },
            })
          : Promise.resolve(null),
        staffIdsToUse.length > 0
          ? db.Staff.findAll({
              where: { id: { [Op.in]: staffIdsToUse }, isDeleted: false },
              attributes: ['email'],
            })
          : Promise.resolve([]),
        getPracticeSettingsConfig({ tenantId: clinicUuid }),
      ]);

      const { logo } = practiceSettingConfig?.logoConfigs || {};
      const clinicName = practiceSettingConfig?.practiceSetting?.name || '';

      const templateParams = {
        logo,
        clinicName,
        firstName: firstName?.toString().trim() || '',
        lastName: lastName?.toString().trim() || '',
        preferredName: normalizeEmpty(preferredName) || '',
        email: normalizedEmail,
        phone: resolvedPreferredContactNumber || '',
        preferredContactNumber: resolvedPreferredContactNumber || '',
        dateOfBirth: resolvedDateOfBirth || '',
        sexAtBirth: normalizedSexAtBirth || '',
        race: normalizeEmpty(race) || '',
        ethnicity: normalizeEmpty(ethnicity) || '',
        genderIdentity: normalizeEmpty(genderIdentity) || '',
        pronoun: normalizeEmpty(pronoun) || '',
        preferredLanguage: normalizeEmpty(preferredLanguage) || '',
        streetAddress: resolvedStreetAddress || '',
        city: normalizeEmpty(city) || '',
        state: normalizeEmpty(state) || '',
        zip: normalizeEmpty(zip) || '',
        personalId: normalizeEmpty(personalId) || '',
        service: serviceLabel || '',

        // common aliases (campaign templates may use different keys)
        patientFirstName: firstName?.toString().trim() || '',
        patientLastName: lastName?.toString().trim() || '',
        patientEmail: normalizedEmail,
        patientPhone: resolvedPreferredContactNumber || '',
        patientName: `${firstName || ''} ${lastName || ''}`.trim(),
      };

      // 1) Send selected template to patient email.
      if (emailTemplate && normalizedEmail) {
        let template = decodeHtml(emailTemplate.template);
        if (selectedQuestionnaireForm && staffIdsToUse.length > 0) {
          template = `${template}
            <p>Please complete your questionnaire:
              <a href="FORMCODE_${selectedQuestionnaireForm.id}">${escapeHtml(selectedQuestionnaireForm.name)}</a>
            </p>`;
          template = await formLinkToMail(
            template,
            patient,
            { id: patientUser?.id, userId: patientUser?.id },
            clinicUuid,
            staffIdsToUse[0],
            questionnaireBaseUrl
          );
        }
        const dynamicTemplate = getDynamicTemplate({
          text: template,
          params: templateParams,
        });

        await sendEmail({
          uuid: clinicUuid,
          to: normalizedEmail,
          replyTo: emailTemplate.replyTo,
          subject: emailTemplate.subject,
          html: dynamicTemplate,
        });
      }

      // 2) Send registration summary with all form fields to selected staff.
      const toList = (staffs || []).map((s) => s?.email).filter(Boolean);
      if (toList.length > 0) {
        const staffSummaryHtml = buildStaffRegistrationSummaryHtml({
          firstName: templateParams.firstName,
          lastName: templateParams.lastName,
          preferredName: templateParams.preferredName,
          email: templateParams.email,
          preferredContactNumber: templateParams.preferredContactNumber,
          optInTextReminder: !!optInTextReminder,
          dateOfBirth: templateParams.dateOfBirth,
          sexAtBirth: templateParams.sexAtBirth,
          race: templateParams.race,
          ethnicity: templateParams.ethnicity,
          genderIdentity: templateParams.genderIdentity,
          pronoun: templateParams.pronoun,
          preferredLanguage: templateParams.preferredLanguage,
          streetAddress: templateParams.streetAddress,
          city: templateParams.city,
          state: templateParams.state,
          zip: templateParams.zip,
          personalId: templateParams.personalId,
          service: templateParams.service,
        });

        const staffSubject = `New Patient Registration: ${templateParams.patientName || normalizedEmail}`;
        await Promise.allSettled(
          toList.map((to) =>
            sendEmail({
              uuid: clinicUuid,
              to,
              replyTo: emailTemplate?.replyTo || normalizedEmail,
              subject: staffSubject,
              html: staffSummaryHtml,
            })
          )
        );
      }
    } catch (emailError) {
      console.error('Notification failed to send:', emailError);
    }

  // 5. Success Response
    res.status(httpStatus.CREATED).send({
      success: true,
      message: 'Registration successful!',
      data: prospect,
      patientId: patient?.id,
    });
  } catch (err) {
    await transaction.rollback();
    throw err;
  }
});

/**
 * POST - Create a Stripe PaymentIntent for the widget
 * Called before confirming payment on the client.
 */
const createProspectPaymentIntent = catchAsync(async (req, res) => {
  const { clinicUuid } = req;
  const db = getModels(clinicUuid);

  const { serviceId: serviceIdFromBody, service, email } = req.body || {};

  if (!clinicUuid) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Missing clinic context.',
    });
  }

  const normalizedEmail = normalizeEmpty(email)?.toString().trim().toLowerCase();
  if (!normalizedEmail) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Email is required.',
    });
  }

  const resolvedServiceId = resolveServiceId(serviceIdFromBody ?? service);
  if (!resolvedServiceId) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Service is required.',
    });
  }

  const config = await db.ProspectRegistration.findOne({
    where: { isDeleted: false },
  });

  if (!config?.paymentRequired) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Payment is not enabled for this widget.',
    });
  }

  const allowedServiceIds = Array.isArray(config?.serviceIds) ? config.serviceIds : [];
  if (allowedServiceIds.length > 0) {
    const allowedSet = new Set(allowedServiceIds.map(String));
    if (!allowedSet.has(String(resolvedServiceId))) {
      return res.status(httpStatus.BAD_REQUEST).json({
        success: false,
        message: 'Selected service is not allowed for this registration form.',
      });
    }
  }

  // Duplicate check early: don't take payment for an existing patient.
  const emailWhere = db.Patient.sequelize.where(
    db.Patient.sequelize.fn('lower', db.Patient.sequelize.col('email')),
    normalizedEmail
  );
  const existingPatient = await db.Patient.findOne({ where: emailWhere });
  if (existingPatient) {
    return res.status(httpStatus.CONFLICT).json({
      success: false,
      message: 'Patient with this email already exists.',
    });
  }

  const procedure = await db.ProcedureCode.findOne({
    where: { id: resolvedServiceId, isDeleted: false },
  });

  if (!procedure) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Invalid service selected.',
    });
  }

  const amountDollars = getProcedureAmountDollars(procedure);
  const amountCents =
    amountDollars !== null && amountDollars !== undefined
      ? Math.round(Number(amountDollars) * 100)
      : null;

  if (!amountCents || amountCents <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Selected service does not have a valid price.',
    });
  }

  const stripeMode = resolveStripeMode(config);
  const secretKey = getStripeSecretKeyFromConfig(config, stripeMode);
  if (!secretKey) {
    return res.status(httpStatus.BAD_REQUEST).json({
      success: false,
      message: 'Stripe secret key is not configured.',
    });
  }

  const stripe = new Stripe(secretKey);
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    payment_method_types: ['card'],
    receipt_email: normalizedEmail,
    metadata: {
      clinicUuid: String(clinicUuid),
      serviceId: String(resolvedServiceId),
      email: normalizedEmail,
      mode: stripeMode,
    },
  });

  // best-effort log
  try {
    await upsertPaymentLog({
      db,
      paymentIntentId: intent?.id,
      status: intent?.status,
      error: null,
      payload: buildProspectPaymentLogPayload({
        paymentIntent: intent,
      }),
    });
  } catch (e) {
    // ignore log errors
  }

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      clientSecret: intent?.client_secret,
      paymentIntentId: intent?.id,
      amount: intent?.amount,
      currency: intent?.currency,
      stripeMode,
    },
  });
});

/**
 * GET - All Prospect Registrations
 */
const getFormLinkProspect = catchAsync(async (req, res) => {
  const { clinicUuid } = req;
  const db = getModels(clinicUuid);

  const prospects = await db.FormLinkProspect.findAll({
    where: { isDeleted: false },
    order: [['createdAt', 'DESC']],
  });

  res.status(httpStatus.OK).send({
    success: true,
    data: prospects
  });
});

module.exports = {
  createFormLinkProspect,
  createProspectPaymentIntent,
  getFormLinkProspect
};
