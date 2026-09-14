const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, emailService, uploadPatientDataService } = require('../services');
const { Op } = require('sequelize');
const Stripe = require('stripe');
const { decryptString } = require('../utils/secureVault');
const { sendAppointmentNotificationAndMail } = require('../services/notification.service');
const { notifications } = require('../config/notification');
const { appointmentActions, appointmentStatus } = require('../config/appointment');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { isUserExist, isUserExist: isTemplateExist } = require('../services/user.service');
const { Email_Templates } = require('../utils/constant');
const randomPassword = require('../utils/randomPassword');
const { roles } = require('../config/roles');
const { tokenService } = require('../services');
const { tokenTypes } = require('../config/tokens');

const getStaffForBooking = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { staffId } = req.params;

  console.log('=== getStaffForBooking ===');
  console.log('Staff ID:', staffId);

  const staff = await db.Staff.findOne({
    where: { id: staffId, isDeleted: false },
    attributes: ['id', 'firstName', 'middleName', 'lastName', 'timezone', 'fileId'],
    include: [
      {
        model: db.File,
        as: 'file',
        required: false,
        attributes: ['id', 'file', 'name', 'mimetype', 'thumbnail'],
      },
    ],
  });


  if (!staff) {
    return res.status(httpStatus.NOT_FOUND).send({
      message: 'Staff not found or not available for booking',
    });
  }

  const allStaffLocations = await db.StaffLocation.findAll({
    where: {
      staffId: staffId,
      isDeleted: false,
    },
  });

  let staffLocation = await db.StaffLocation.findOne({
    where: {
      staffId: staffId,
      isPrimaryLocation: true,
      isDeleted: false,
    },
    include: [
      {
        model: db.PracticeLocation,
        as: 'location',
        where: { isDeleted: false },
        required: false,
      },
      {
        model: db.CalendarSchedule,
        as: 'calenderSchedule',
        where: { isDeleted: false },
        required: false,
      },
    ],
  });

  if (!staffLocation) {
    console.log('No primary location found, trying to get first available location...');
    staffLocation = await db.StaffLocation.findOne({
      where: {
        staffId: staffId,
        isDeleted: false,
      },
      include: [
        {
          model: db.PracticeLocation,
          as: 'location',
          where: { isDeleted: false },
          required: false,
        },
        {
          model: db.CalendarSchedule,
          as: 'calenderSchedule',
          where: { isDeleted: false },
          required: false,
        },
      ],
    });
  }

  console.log('Primary Staff Location found:', staffLocation ? 'Yes' : 'No');
  if (staffLocation) {
    console.log('Staff Location ID:', staffLocation.id);
    console.log('Is Primary:', staffLocation.isPrimaryLocation);
    console.log('Preferred Schedule Code:', staffLocation.preferredScheduleCode);
    console.log('Appointment Interval:', staffLocation.appointmentInterval);
    console.log('Has Schedule:', !!staffLocation.schedule);
    console.log('Has Calendar Schedule:', !!staffLocation.calenderSchedule);
  }

  const primaryLocation = staffLocation?.location;

  const response = {
    id: staff.id,
    firstName: staff.firstName,
    lastName: staff.lastName,
    timezone: staff.timezone,
    file: staff.file
      ? { file: staff.file.file, name: staff.file.name, mimetype: staff.file.mimetype }
      : null,
    primaryLocationId: primaryLocation?.id,
    primaryLocation: primaryLocation
      ? {
          id: primaryLocation.id,
          name: primaryLocation.name,
          address: primaryLocation.address, 
          phoneNo: primaryLocation.phoneNo, 
          preferredScheduleCode: staffLocation?.preferredScheduleCode,
          schedule: staffLocation?.schedule,
          calenderSchedule: staffLocation?.calenderSchedule,
          appointmentInterval: staffLocation?.appointmentInterval,
          leadDays: staffLocation?.leadDays,
          leadInterval: staffLocation?.leadInterval,
          appointmentConfirmation: staffLocation?.appointmentConfirmation,
          autoConfirmOnlineAppointment: staffLocation?.autoConfirmOnlineAppointment ?? 0,
          textTemplateForPatientConfirmation: staffLocation?.textTemplateForPatientConfirmation ?? null,
        }
      : null,
  };
  res.status(httpStatus.OK).send(response);
});

const getAvailableSlots = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { startDate, endDate, practitionerId, locationId } = req.query;

  let appointmentFilter = {
    isDeleted: false,
    statusCode: {
      [Op.not]: 'canceled',
    },
  };

  if (startDate && endDate) {
    appointmentFilter.startDateTime = {
      [Op.between]: [new Date(`${startDate}T00:00:00.000Z`), new Date(`${endDate}T23:59:59.999Z`)],
    };
  } else if (startDate) {
    appointmentFilter.startDateTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    appointmentFilter.startDateTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  if (practitionerId) {
    appointmentFilter.practitionerId = practitionerId;
  }

  if (locationId) {
    appointmentFilter.locationId = locationId;
  }
  const appointments = await dbService.getAll({
    model: db.Appointment,
    filter: { where: appointmentFilter },
    otherOptions: {
      attributes: ['createdAt', 'startDateTime', 'endDateTime'],
    },
  });

  // Build filter for out-of-office schedules
  let oooFilter = {
    isDeleted: false,
  };

  if (startDate && endDate) {
    oooFilter.startDateTime = {
      [Op.lt]: new Date(`${endDate}T23:59:59.999Z`),
    };
    oooFilter.endDateTime = {
      [Op.gt]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (startDate) {
    oooFilter.startDateTime = {
      [Op.gte]: new Date(`${startDate}T00:00:00.000Z`),
    };
  } else if (endDate) {
    oooFilter.endDateTime = {
      [Op.lte]: new Date(`${endDate}T23:59:59.999Z`),
    };
  }

  if (practitionerId) {
    oooFilter.staffId = practitionerId;
  }

  if (locationId) {
    oooFilter.locationId = locationId;
  }

  // Fetch out-of-office schedules
  const oooSchedules = await dbService.getAll({
    model: db.OutOfOfficeSchedule,
    filter: { where: oooFilter },
  });

  res.status(httpStatus.OK).send({
    appointments,
    oooSchedules,
  });
});

const safeDecrypt = (value) => {
  if (!value) return null;
  const raw = String(value);
  if (!raw.startsWith('v1:')) return raw;
  try {
    return decryptString(raw);
  } catch (e) {
    return null;
  }
};

const getStripeSecretKey = (config) => {
  const mode = config?.stripePaymentMode === 'live' ? 'live' : 'test';
  const encrypted = mode === 'live' ? config?.stripeLiveSecretKey : config?.stripeTestSecretKey;
  return { secretKey: safeDecrypt(encrypted), mode };
};

/**
 * GET /online-booking-registration/appointment-confirmed-templates
 * Public: returns appointment_approved email templates for the staff location
 * Text Template For Patient Confirmation dropdown — no auth required.
 */
const getAppointmentConfirmedTemplates = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const templates = await db.EmailTemplate.findAll({
    where: { emailTypeCode: Email_Templates.APPROVED_APPOINTMENT, isDeleted: false },
    attributes: ['id', 'name', 'subject'],
    order: [['name', 'ASC']],
  });

  return res.status(httpStatus.OK).json({ results: templates });
});
const createBookingPaymentIntent = catchAsync(async (req, res) => {
  const { clinicUuid } = req;
  const db = getModels(clinicUuid);
  const { serviceId, email, paymentForBooking, depositAmount, serviceName } = req.body || {};

  if (!clinicUuid) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Missing clinic context.' });
  }

  if (!email) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Email is required.' });
  }

  let amountDollars = 0;
  let resolvedServiceName = serviceName || '';
  if (paymentForBooking === 'full_payment_required' && serviceId) {
    const procedure = await db.ProcedureCode.findOne({ where: { id: serviceId, isDeleted: false } });
    if (!procedure) {
      return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid service selected.' });
    }
    const total = procedure?.total;
    const qty = Number(procedure?.qty ?? 0);
    const price = Number(procedure?.price ?? 0);
    const computed = Number.isFinite(qty * price) ? qty * price : price;
    amountDollars = Number.isFinite(Number(total)) ? Number(total) : computed;
    if (!resolvedServiceName) resolvedServiceName = procedure?.name || '';
  } else {
    amountDollars = Number(depositAmount) || 0;
  }

  const amountCents = Math.round(amountDollars * 100);
  if (!amountCents || amountCents <= 0) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Invalid payment amount.' });
  }
  const config = await db.ProspectRegistration.findOne({ where: { isDeleted: false } });
  const { secretKey, mode } = getStripeSecretKey(config);

  if (!secretKey) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Stripe is not configured for this clinic.' });
  }

  // Build a human-readable description for the Stripe payment
  let description = 'Online Booking';
  if (resolvedServiceName) description += ` — ${resolvedServiceName}`;
  if (paymentForBooking === 'deposit_required_cancellation_fee') {
    description += ` (Deposit / Cancellation Fee: $${amountDollars.toFixed(2)})`;
  } else if (paymentForBooking === 'full_payment_required') {
    description += ` (Full Payment: $${amountDollars.toFixed(2)})`;
  }

  const stripe = new Stripe(secretKey);
  const intent = await stripe.paymentIntents.create({
    amount: amountCents,
    currency: 'usd',
    payment_method_types: ['card'],
    receipt_email: email,
    description,
    metadata: { clinicUuid: String(clinicUuid), paymentForBooking: paymentForBooking || '', mode, serviceName: resolvedServiceName },
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      clientSecret: intent.client_secret,
      paymentIntentId: intent.id,
      amount: intent.amount,
      currency: intent.currency,
      stripeMode: mode,
    },
  });
});

/**
 * POST /online-booking-registration/setup-intent
 * Creates a Stripe SetupIntent to save a card on file without charging.
 */
const createBookingSetupIntent = catchAsync(async (req, res) => {
  const { clinicUuid } = req;
  const db = getModels(clinicUuid);
  const { email, serviceName } = req.body || {};

  if (!clinicUuid) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Missing clinic context.' });
  }

  const config = await db.ProspectRegistration.findOne({ where: { isDeleted: false } });
  const { secretKey, mode } = getStripeSecretKey(config);

  if (!secretKey) {
    return res.status(httpStatus.BAD_REQUEST).json({ success: false, message: 'Stripe is not configured for this clinic.' });
  }

  const description = serviceName
    ? `Online Booking — ${serviceName} (Card saved on file, no charge)`
    : 'Online Booking (Card saved on file, no charge)';

  const stripe = new Stripe(secretKey);
  const customer = await stripe.customers.create({
    email,
    description,
  });
  const setupIntent = await stripe.setupIntents.create({
    customer: customer.id,
    payment_method_types: ['card'],
    usage: 'off_session',
    description,
    metadata: { clinicUuid: String(clinicUuid), email: email || '', mode, serviceName: serviceName || '' },
  });

  return res.status(httpStatus.OK).json({
    success: true,
    data: {
      clientSecret: setupIntent.client_secret,
      setupIntentId: setupIntent.id,
      customerId: customer.id,
      stripeMode: mode,
    },
  });
});

/**
 * GET /online-booking-registration/procedure-codes
 * Public: returns procedure codes (services) for online booking.
 */
const getPublicProcedureCodes = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { limit = 100 } = req.query;

  const results = await db.ProcedureCode.findAll({
    where: { isDeleted: false },
    limit: Number(limit),
    order: [['id', 'DESC']],
  });

  return res.status(httpStatus.OK).json({ results });
});

/**
 * GET /online-booking-registration/all-staff
 * Public: returns active practitioners for the practitioner selector.
 * Only exposes fields required by the booking UI — no PII beyond display name.
 */
const getPublicAllStaff = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { limit = 100 } = req.query;

  const staff = await db.Staff.findAll({
    where: { isDeleted: false },
    limit: Number(limit),
    attributes: ['id', 'firstName', 'middleName', 'lastName', 'timezone', 'fileId'],
    include: [
      {
        model: db.File,
        as: 'file',
        required: false,
        attributes: ['id', 'file', 'name', 'mimetype', 'thumbnail'],
      },
      {
        model: db.User,
        as: 'user',
        required: false,
        attributes: ['id'],
        include: [
          {
            model: db.Role,
            as: 'roles',
            required: false,
            attributes: ['id', 'name', 'code'],
            through: { attributes: [] },
          },
        ],
      },
    ],
  });

  return res.status(httpStatus.OK).json({ results: staff });
});

/**
 * GET /online-booking-registration/appointments
 * Public: returns booked appointment slots for conflict checking.
 * Query params: startDate, endDate, practitionerId, locationId
 */
const getPublicAppointments = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { startDate, endDate, practitionerId, locationId } = req.query;

  const filter = {
    isDeleted: false,
    statusCode: { [Op.not]: 'canceled' },
  };

  if (startDate && endDate) {
    filter.startDateTime = { [Op.lt]: new Date(`${endDate}T23:59:59.999Z`) };
    filter.endDateTime = { [Op.gt]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (startDate) {
    filter.startDateTime = { [Op.gte]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (endDate) {
    filter.endDateTime = { [Op.lte]: new Date(`${endDate}T23:59:59.999Z`) };
  }

  if (practitionerId) filter.practitionerId = practitionerId;
  if (locationId) filter.locationId = locationId;

  const appointments = await dbService.getAll({
    model: db.Appointment,
    filter: { where: filter },
    otherOptions: { attributes: ['createdAt', 'startDateTime', 'endDateTime'] },
  });

  return res.status(httpStatus.OK).json(appointments);
});

/**
 * GET /online-booking-registration/oof-schedules
 * Public: returns out-of-office schedules for conflict checking.
 * Query params: startDate, endDate, staffId
 */
const getPublicOofSchedules = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { startDate, endDate, staffId } = req.query;

  const filter = { isDeleted: false };

  if (startDate && endDate) {
    filter.startDateTime = { [Op.lt]: new Date(`${endDate}T23:59:59.999Z`) };
    filter.endDateTime = { [Op.gt]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (startDate) {
    filter.startDateTime = { [Op.gte]: new Date(`${startDate}T00:00:00.000Z`) };
  } else if (endDate) {
    filter.endDateTime = { [Op.lte]: new Date(`${endDate}T23:59:59.999Z`) };
  }

  if (staffId) filter.staffId = staffId;

  const schedules = await dbService.getAll({
    model: db.OutOfOfficeSchedule,
    filter: { where: filter },
  });

  return res.status(httpStatus.OK).json(schedules);
});

/**
 * POST /online-booking-registration/patient
 * Public: creates a guest patient for an online booking.
 */
const createPublicPatient = catchAsync(async (req, res) => {
  const triggerFrom = 'Patient Creation';
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const {
    firstName,
    lastName,
    middleName,
    email,
    sexAtBirthCode,
    genderIdentityCode,
    sexualOrientationCode,
    raceCode,
    titleCode,
    primaryProviderId,
    address,
  } = req.body || {};

  if (!firstName || !lastName || !email) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'First name, last name, and email are required.',
    });
  }

  // Check if patient with this email already exists
  const existing = await db.Patient.findOne({
    where: { email, isDeleted: false },
    include: [{ model: db.User, as: 'user' }],
  });
  if (existing) {
    return res.status(httpStatus.CONFLICT).json({
      message: 'Email already exists.',
    });
  }

  const password = randomPassword();
  const patientRole = await dbService.getOne({ model: db.Role, filter: { where: { code: roles.PATIENT } } });

  let user = await isUserExist(db.User, { where: { email }, include: [{ model: db.Role, as: 'roles' }] });
  if (!user) {
    user = await dbService.createOne({
      model: db.User,
      reqParams: {
        email,
        firstName,
        middleName: middleName || '',
        lastName,
        tenantId: uuid,
        password,
      },
    });
    if (patientRole) await user.addRole(patientRole.id);
  } else if (patientRole) {
    await user.addRole(patientRole.id);
  }

  const patientParams = { ...req.body };

  if (sexAtBirthCode !== 'gender_at_birth_other') patientParams.otherSexAtBirth = null;
  if (genderIdentityCode !== 'another_gender_identity') patientParams.anotherGenderIdentity = null;
  if (sexualOrientationCode !== 'another_orientation_not_listed') patientParams.anotherOrientation = null;
  if (raceCode !== 'unknown') patientParams.raceUnknown = null;
  if (titleCode !== 'name_prefixes_other') patientParams.otherTitle = null;
  if (titleCode === 'name_prefixes_other' && !patientParams.otherTitle) patientParams.titleCode = null;

  const patient = await dbService.createOne({
    model: db.Patient,
    reqParams: {
      ...patientParams,
      primaryProviderId: primaryProviderId || null,
      address: address || null,
      userId: user.id,
      isDeleted: false,
    },
  });

  let authTokens = null;
  try {
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });

    const { generatePasswordToken, expires } = await tokenService.generatePasswordToken(user);
    await db.Token.create({
      token: generatePasswordToken,
      userId: user.id,
      expires,
      type: tokenTypes.GENERATE_PASSWORD,
    });
    emailService.sendWelcomeEmailToPatient(
      uuid,
      practiceSetting,
      { patient, user: { userId: user.id }, token: generatePasswordToken },
      password,
    );

    const tokens = await tokenService.generateAuthTokens(user, roles.PATIENT);
    await db.Token.create({
      token: tokens.refresh.token,
      userId: user.id,
      expires: tokens.refresh.expires,
      type: tokenTypes.REFRESH,
    });
    authTokens = tokens;
  } catch (notifError) {
    console.error('Online booking patient welcome email error:', notifError);
  }

  const reqForSync = { ...req, user: req.user || { id: null, firstName: 'System' } };
  uploadPatientDataService.uploadPatientToMdtoolbox(patient, reqForSync, triggerFrom).catch(() => { /* non-fatal */ });

  return res.status(httpStatus.CREATED).json({ id: patient.id, userId: user.id, tokens: authTokens });
});

/**
 * POST /online-booking-registration/appointment
 * Public: creates an appointment for a guest patient.
 * All booking settings (autoConfirm, sendTextAlso, etc.) come from the
 * encrypted token that was validated client-side — they are passed in the
 * request body and never exposed as plain URL params.
 */
const createPublicAppointment = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const {
    patientIds,
    practitionerId,
    locationId,
    startDateTime,
    endDateTime,
    typeCode,
    statusCode,
    isOnlineBookingStatus,
    ICDId,
    reasonForAppointment,
    comments,
    isVirtual,
    confirmOnIntake,
    stripePaymentIntentId,
    stripeSetupIntentId,
    stripeCustomerId,
    stripePaymentMethodId,
    paymentForBooking,
    sendTextAlso,
    textTemplateId,
  } = req.body || {};

  if (!practitionerId || !locationId || !startDateTime || !endDateTime) {
    return res.status(httpStatus.BAD_REQUEST).json({
      message: 'practitionerId, locationId, startDateTime, and endDateTime are required.',
    });
  }

  if (!patientIds || !patientIds.length) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'patientIds are required.' });
  }

  const appointment = await db.Appointment.create({
    practitionerId,
    locationId,
    startDateTime,
    endDateTime,
    typeCode: typeCode || 'individual',
    statusCode: statusCode || 'pending',
    isOnlineBookingStatus: isOnlineBookingStatus ?? 0,
    ICDId: ICDId || null,
    reasonForAppointment: reasonForAppointment || '',
    comments: comments || '',
    isVirtual: isVirtual || false,
    confirmOnIntake: confirmOnIntake || false,
    stripePaymentIntentId: stripePaymentIntentId || null,
    stripeSetupIntentId: stripeSetupIntentId || null,
    stripeCustomerId: stripeCustomerId || null,
    stripePaymentMethodId: stripePaymentMethodId || null,
    paymentForBooking: paymentForBooking || 'not_required',
    isDeleted: false,
  });

  // Link patients to the appointment
  if (patientIds && patientIds.length && db.AppointmentPatient) {
    await Promise.all(
      patientIds.map((patientId) =>
        db.AppointmentPatient.create({ appointmentId: appointment.id, patientId })
      )
    );
  }


  const resolvedSendTextAlso = sendTextAlso || 'to_both';
  if (resolvedSendTextAlso !== 'none') {
    try {
      const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
      const emailTemplate = await isTemplateExist(db.EmailTemplate, {
        where: {
          emailTypeCode: Email_Templates.CREATE_APPOINTMENT,
          isDeleted: false,
          typeCode: 'individual',
        },
      });
      const clinicNotificationInfo = notifications.Clinic[appointmentActions.APPOINTMENT_CREATED];
      const patientNotificationInfo = notifications.Patient[appointmentActions.APPOINTMENT_CREATED];

      sendAppointmentNotificationAndMail(
        {
          appointment,
          subject: emailTemplate?.subject,
          replyTo: emailTemplate?.replyTo,
          template: emailTemplate?.template,
          practiceSetting,
          sendTextAlso: resolvedSendTextAlso,
        },
        { tenantId: uuid, clinicNotificationInfo, patientNotificationInfo }
      );
    } catch (notifError) {
      console.error('Online booking notification error:', notifError);
    }
  }


  if (textTemplateId) {
    try {
      const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
      const confirmationTemplate = await isTemplateExist(db.EmailTemplate, {
        where: {
          id: textTemplateId,
          emailTypeCode: Email_Templates.APPROVED_APPOINTMENT,
          isDeleted: false,
        },
      });
      if (confirmationTemplate) {
        const clinicNotificationInfo = notifications.Clinic[appointmentStatus.CONFIRMED];
        const patientNotificationInfo = notifications.Patient[appointmentStatus.CONFIRMED];

        sendAppointmentNotificationAndMail(
          {
            appointment,
            subject: confirmationTemplate.subject,
            replyTo: confirmationTemplate.replyTo,
            template: confirmationTemplate.template,
            practiceSetting,
            sendTextAlso: 'to_patient', 
          },
          { tenantId: uuid, clinicNotificationInfo, patientNotificationInfo }
        );
      }
    } catch (notifError) {
      console.error('Online booking confirmation template email error:', notifError);
    }
  }

  return res.status(httpStatus.CREATED).json({ id: appointment.id });
});

module.exports = {
  getStaffForBooking,
  getAvailableSlots,
  getPublicProcedureCodes,
  getPublicAllStaff,
  getPublicAppointments,
  getPublicOofSchedules,
  createPublicPatient,
  createPublicAppointment,
  createBookingPaymentIntent,
  createBookingSetupIntent,
  getAppointmentConfirmedTemplates,
};
