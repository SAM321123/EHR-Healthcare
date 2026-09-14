const { v4: uuidv4 } = require('uuid');
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { getModels } = require('../utils/connection');
const { emailQueue } = require('../services/emailqueue');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');
const he = require('he');
const { dbService } = require('../services');
const sendBulkEmail = catchAsync(async (req, res) => {
  const { selectionMode, clinicNames, emailTypeId, role } = req.body;
  if (!emailTypeId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Template is required');
  }

  const clinicUuid = req.clinicUuid;
  //  const uuid = req.clinicUuid;
  // const db = getModels(uuid);
  const batchId = uuidv4();
  const masterDb = initializeModels(sequelize, true);

  let emails = [];

  if (selectionMode === 'all') {
    const users = await masterDb.ClinicStaff.findAll({
      where: {
        isDeleted: false,
        isActive: true,
      },
      attributes: ['email', 'firstName', 'middleName', 'lastName', 'clinicName'],
    });
    // console.log('userrrrrrrrrrrr',users)
    emails = users.map((u) => ({
      email: u.email,
      firstName: u.firstName,
      middleName: u.middleName || '',
      lastName: u.lastName,
      clinicName: u.clinicName,
    }));
  }

  // ✅ MANUAL MODE
  if (selectionMode === 'manual') {
    if (!clinicNames?.length || !role?.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Clinic names and roles required');
    }

    const clinicNameValues = clinicNames.map((c) => (c?.name || c)?.trim());
    const roleValues = role.map((r) => (r?.name || r?.value || r)?.trim());

    const users = await masterDb.ClinicStaff.findAll({
      where: {
        clinicName: { [Op.in]: clinicNameValues },
        role: { [Op.in]: roleValues },
        isDeleted: false,
        isActive: true,
      },
      attributes: ['email', 'firstName', 'middleName', 'lastName', 'clinicName'],
    });
    //  console.log('userrrrrrrrrrrr',users)
    if (!users.length) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'No emails found');
    }

    emails = users.map((u) => ({
      email: u.email,
      firstName: u.firstName,
      middleName: u.middleName || '',
      lastName: u.lastName,
      clinicName: u.clinicName,
    }));
  }

  if (!emails.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No emails found');
  }

  // Remove invalid emails
  emails = emails.filter((u) => u.email);

  // ✅ Get Template
  const templateing = await masterDb.AdminEmailTemplate.findOne({
    where: { id: emailTypeId },
  });

  if (!templateing) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Template not found');
  }

  const decodedHtml = he.decode(templateing.template);

  // ✅ Correct bulkCreate
  const records = await masterDb.EmailAudit.bulkCreate(
    emails.map((user) => ({
      email: user.email,
      subject: templateing.subject,
      status: 'PENDING',
    })),
    { returning: true }
  );
  // 🔥 Get unique clinic names from users
  const uniqueClinicNames = [...new Set(emails.map((u) => u.clinicName))];

  if (!uniqueClinicNames.length) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'No clinics found');
  }

  // 🔥 Ensure role is always array
  const safeRole = Array.isArray(role) ? role : role ? [role] : ['Practitioner', 'Clinic Admin', 'RN'];

  // 🔥 Create ONE row per clinic
  const compose = await masterDb.AdminEmailComposed.create({
    clinicName: uniqueClinicNames,
    role: safeRole,
    selectionMode,
    emailName: templateing.name,
    status: 'PENDING',
  });

  const composeMap = {};
  uniqueClinicNames.forEach((name) => {
    composeMap[name] = compose.id; // All clinics share the same compose record (ID: 7)
  });
  console.log('Compose Map:', composeMap);
  // ✅ Push to Queue
  await emailQueue.addBulk(
    records.map((record, index, compose) => ({
      name: 'send-email',
      data: {
        composeId: composeMap[emails[index].clinicName],
        auditId: record.id,
        email: emails[index].email,
        subject: templateing.subject,
        html: decodedHtml,
        text: templateing.text || '',
        clinicUuid: req.clinicUuid,
        firstName: emails[index].firstName,
        middleName: emails[index].middleName,
        lastName: emails[index].lastName,
        clinicName: emails[index].clinicName,
        UserRole: 1,
      },
      opts: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: false,
      },
    }))
  );

  res.status(httpStatus.OK).json({
    message: 'Emails queued successfully',
    batchId,
    total: emails.length,
  });
});
const getEmailComposed = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const masterDb = initializeModels(sequelize, true);
  // const db = getModels(uuid);
  const emailComposed = await dbService.getPaginated({
    model: masterDb.AdminEmailComposed,
    req,
    allowedFilters: ['clinicName', 'selectionMode', 'status'],
    searchFilter: ['clinicName', 'emailName'],
  });
  res.status(httpStatus.OK).send(emailComposed);
});
const getEmailComposedById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const masterDb = initializeModels(sequelize, true);

  // 1. Find the master composition record
  const emailComposed = await masterDb.AdminEmailComposed.findOne({
    where: { id },
  });

  if (!emailComposed) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Email composed record not found');
  }

  // 2. Fetch all staff that belong to the clinics and roles stored in this record
  // We use [Op.in] because clinicName and role are arrays in your DB
  const targetedStaff = await masterDb.ClinicStaff.findAll({
    where: {
      clinicName: { [Op.in]: emailComposed.clinicName },
      role: { [Op.in]: emailComposed.role },
      isDeleted: false,
    },
    attributes: ['firstName', 'lastName', 'email', 'role', 'clinicName'],
    order: [
      ['clinicName', 'ASC'],
      ['role', 'ASC'],
    ],
  });

  // 3. Send combined data back to frontend
  res.status(httpStatus.OK).send({
    details: emailComposed,
    staffList: targetedStaff, // This is the data for your "Table"
  });
});
module.exports = {
  sendBulkEmail,
  getEmailComposed,
  getEmailComposedById,
};
