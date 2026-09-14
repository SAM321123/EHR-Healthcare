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
const ApiError = require('../utils/ApiError');
const { buildEmailCampaignTemplateParams, renderEmailCampaignTemplate } = require('../utils/emailCampaignMergeTags');

const getComposeMail = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const composeMails = await dbService.getPaginated({
    model: db.EmailCampaignComposeMail,
    req,
    searchFilter: ['templateName'],
  });
  res.status(httpStatus.OK).send(composeMails);
});

const createComposeMail = catchAsync(async (req, res) => {
  const { user, clinicUuid } = req;
  const { sendTo, templateName, patients } = req.body;

  if (!templateName) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Template is required');
  }

  const masterDb = initializeModels(sequelize, true);
  const db = getModels(clinicUuid);
  const batchId = uuidv4();
  let emails = [];

  const patientAttributes = [
    'id',
    'email',
    'firstName',
    'middleName',
    'lastName',
    'preferredName',
    'phone',
    'workPhone',
    'homePhone',
    'textMessagePhone',
    'preferredPhone',
    'alternativePhone',
    'dob',
    'address',
    'timezone',
    'sexAtBirthCode',
    'otherSexAtBirth',
    'genderIdentityCode',
  ];

  const [practice, clinicSetting, clinicLocation] = await Promise.all([
    masterDb.Practice.findByPk(clinicUuid, {
      attributes: ['id', 'name', 'email', 'contact', 'address', 'domainName'],
      raw: true,
    }),
    db.PracticeSetting.findOne({
      where: { isDeleted: false, isActive: true },
      attributes: ['name', 'email', 'address', 'contact', 'primaryContactName', 'primaryContactPhone', 'timezone'],
      raw: true,
    }),
    db.PracticeLocation.findOne({
      where: { isDeleted: false, isActive: true },
      attributes: ['name', 'address', 'faxNo', 'phoneNo', 'contactPersonNo', 'contactPersonName', 'contactPersonEmail'],
      order: [['id', 'ASC']],
      raw: true,
    }),
  ]);

  const clinicProfile = {
    name: clinicSetting?.name || practice?.name || clinicLocation?.name || '',
    email: clinicSetting?.email || practice?.email || clinicLocation?.contactPersonEmail || '',
    contact: clinicSetting?.contact || practice?.contact || clinicLocation?.phoneNo || clinicLocation?.contactPersonNo || '',
    address: clinicSetting?.address || practice?.address || clinicLocation?.address || null,
    domainName: practice?.domainName || '',
    primaryContactName: clinicSetting?.primaryContactName || clinicLocation?.contactPersonName || '',
    primaryContactPhone: clinicSetting?.primaryContactPhone || clinicLocation?.contactPersonNo || '',
    timezone: clinicSetting?.timezone || '',
  };

  if (sendTo === 'all') {
    const users = await db.Patient.findAll({
      where: {
        isDeleted: false,
        isActive: true,
      },
      attributes: patientAttributes,
    });

    emails = users.map((patient) => ({
      patientId: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      middleName: patient.middleName || '',
      lastName: patient.lastName,
      preferredName: patient.preferredName || '',
      phone: patient.phone || '',
      workPhone: patient.workPhone || '',
      homePhone: patient.homePhone || '',
      textMessagePhone: patient.textMessagePhone || '',
      preferredPhone: patient.preferredPhone || '',
      alternativePhone: patient.alternativePhone || '',
      dob: patient.dob,
      address: patient.address,
      timezone: patient.timezone || '',
      sexAtBirthCode: patient.sexAtBirthCode || '',
      otherSexAtBirth: patient.otherSexAtBirth || '',
      genderIdentityCode: patient.genderIdentityCode || '',
    }));
  }

  if (sendTo === 'manually') {
    if (!patients?.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Patients are required for manual mode');
    }

    const patientIds = patients.map((patient) => (typeof patient === 'object' ? patient.patientId : patient));

    const users = await db.Patient.findAll({
      where: {
        id: { [Op.in]: patientIds },
        isDeleted: false,
        isActive: true,
      },
      attributes: patientAttributes,
    });

    emails = users.map((patient) => ({
      patientId: patient.id,
      email: patient.email,
      firstName: patient.firstName,
      middleName: patient.middleName || '',
      lastName: patient.lastName,
      preferredName: patient.preferredName || '',
      phone: patient.phone || '',
      workPhone: patient.workPhone || '',
      homePhone: patient.homePhone || '',
      textMessagePhone: patient.textMessagePhone || '',
      preferredPhone: patient.preferredPhone || '',
      alternativePhone: patient.alternativePhone || '',
      dob: patient.dob,
      address: patient.address,
      timezone: patient.timezone || '',
      sexAtBirthCode: patient.sexAtBirthCode || '',
      otherSexAtBirth: patient.otherSexAtBirth || '',
      genderIdentityCode: patient.genderIdentityCode || '',
    }));
  }

  if (!emails.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No emails found');
  }

  emails = emails.filter((patient) => patient.email);

  if (!emails.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No valid emails found');
  }

  const templateing = await db.EmailCampaignTemplate.findOne({
    where: { name: templateName },
  });

  if (!templateing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
  }

  const decodedHtml = he.decode(templateing.template);
  const emailJobs = emails.map((patient) => {
    const templateParams = buildEmailCampaignTemplateParams({
      patient,
      clinic: clinicProfile,
      clinicLocation,
    });

    return {
      patient,
      templateParams,
      subject: renderEmailCampaignTemplate({
        text: templateing.subject,
        params: templateParams,
      }),
      html: renderEmailCampaignTemplate({
        text: decodedHtml,
        params: templateParams,
      }),
      text: renderEmailCampaignTemplate({
        text: templateing.text || '',
        params: templateParams,
      }),
    };
  });

  const records = await db.EmailAudit.bulkCreate(
    emailJobs.map(({ patient, subject }) => ({
      email: patient.email,
      subject,
      status: 'PENDING',
    })),
    { returning: true }
  );

  const composeRow = await db.EmailCampaignComposeMail.create({
    sendTo,
    templateName,
    status: 'PENDING',
    patients: emailJobs.map(({ patient }) => ({
      patientId: patient.patientId,
      firstName: patient.firstName,
      middleName: patient.middleName,
      lastName: patient.lastName,
    })),
    createdById: user.id,
  });

  try {
    const jobs = await emailQueue.addBulk(
      records.map((record, index) => ({
        name: 'send-email-compose',
        data: {
          composeId: composeRow.id,
          auditId: record.id,
          email: emailJobs[index].patient.email,
          replyTo: templateing.replyTo || '',
          subject: emailJobs[index].subject,
          html: emailJobs[index].html,
          text: emailJobs[index].text,
          clinicUuid,
          firstName: emailJobs[index].patient.firstName,
          middleName: emailJobs[index].patient.middleName,
          lastName: emailJobs[index].patient.lastName,
          clinicName: clinicProfile.name || '',
          templateParams: emailJobs[index].templateParams,
          UserRole: 0,
        },
      }))
    );

    console.log('Jobs successfully added:', jobs);
  } catch (err) {
    console.error('Queue Error:', err);
  }

  res.status(httpStatus.OK).json({
    message: 'Emails queued successfully',
    batchId,
    total: emails.length,
  });
});

const getEmailClinicById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { id } = req.params;

  const emailComposed = await db.EmailCampaignComposeMail.findOne({
    where: { id },
  });

  if (!emailComposed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email composed record not found');
  }

  let targetIds = [];

  if (Array.isArray(emailComposed.patients)) {
    targetIds = emailComposed.patients.map((patient) => patient.patientId).filter((patientId) => patientId !== undefined);
  }

  let targetedStaff = [];

  if (targetIds.length > 0) {
    targetedStaff = await db.Patient.findAll({
      where: {
        id: { [Op.in]: targetIds },
        isDeleted: false,
      },
      attributes: ['firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC']],
    });
  } else if (emailComposed.sendTo === 'all') {
    targetedStaff = await db.Patient.findAll({
      where: { isDeleted: false },
      attributes: ['firstName', 'lastName', 'email'],
      order: [['firstName', 'ASC']],
    });
  }

  res.status(httpStatus.OK).send({
    details: emailComposed,
    staffList: targetedStaff,
  });
});

module.exports = { getComposeMail, createComposeMail, getEmailClinicById };
