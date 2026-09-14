const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { getModels } = require('../utils/connection');
const { dbService, emailService, userService, tokenService, subscriptionService } = require('../services');
const { roles } = require('../config/roles');
const randomPassword = require('../utils/randomPassword');
const { isUserExist } = require('../services/user.service');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { isEmpty } = require('lodash');
const { tokenTypes } = require('../config/tokens');
const moment = require('moment');
const { createStaffOnTrialPeriod } = require('../services/satff.service');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { updateTrialSubscription, updateTrialSubscriptionForPrescriber } = require('../services/subscription.service');
const { getClinicNameById, getRoleNamesByIds } = require('../services/db.service');

const getStaff = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { role } = req?.query || {};

  let whereClause = {};
  if (role) {
    whereClause = { code: req.query.role };
  }
  const result = await dbService.getPaginated({
    model: db.Staff,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName'],
    searchFilter: ['firstName', 'lastName', 'middleName'],
    include: [
      {
        model: db.User,
        as: 'user',
        // include:[{model:db.Role,as:'roles',where:{code:req.query.role}}]
        include: [{ model: db.Role, as: 'roles', where: whereClause }],
      },
      { model: db.GlobalType, as: 'title' },
      { model: db.GlobalType, as: 'genderIdentity' },
      { model: db.File, as: 'file' },
      { model: db.StaffBookingSetting, as: 'bookingSetting' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const createStaff = catchAsync(async (req, res) => {
  const {
    email,
    firstName,
    middleName,
    lastName,
    file: { id: fileId = null } = {},
    roleIds = [],
    isPrescriber,
  } = req.body || {};
  const { tenantId, id: userId } = req.user || {};
  let isUserCreated = false;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const password = randomPassword();
  let user = await isUserExist(db.User, { where: { email }, include: [{ model: db.Role, as: 'roles' }] });
  const existingStaffWithNewEmail = await dbService.getOne({ model: db.Staff, filter: { where: { email } } });
  if (existingStaffWithNewEmail) {
    throw new Error('Staff with same email already exists try updating its role!');
  }

  if (!user) {
    isUserCreated = true;
    user = await dbService.createOne({
      model: db.User,
      reqParams: {
        email,
        firstName,
        middleName,
        lastName,
        tenantId,
        password,
        createdById: userId,
        updatedById: userId,
        fileId,
      },
    });
  }
  await user.addRoles(roleIds);
  let prescribeDate = null;
  if (isPrescriber) {
    prescribeDate = moment().utc();
  }
  const staff = await dbService.createOne({
    model: db.Staff,
    reqParams: { ...req.body, fileId, userId: user.id, createdById: userId, prescribeDate },
  });

  const masterDB = initializeModels(sequelize, true);

  if (isUserCreated && staff) {
    const clinicName = await dbService.getClinicNameById({ model: masterDB?.Practice, clinicId: uuid });
    const roleNames = await dbService.getRoleNamesByIds({ model: db?.Role, roleIds });
    const titleName = await dbService.getTitleNameByTitleCode({ model: db?.GlobalType, titleCode: staff.titleCode });
    const clinicStaff = await dbService.createOne({
      model: masterDB.ClinicStaff,
      reqParams: {
        title: titleName,
        clinicId: uuid,
        clinicName: clinicName,
        staffId: staff.id,
        firstName: staff.firstName,
        middleName: staff.middleName,
        lastName: staff.lastName,
        email: staff.email,
        role: roleNames.join(', '),
        isPrescriber: staff.isPrescriber,
      },
    });
  }

  const isTrialSubscription = await dbService.getOne({
    model: masterDB.TrialSubscription,
    filter: { where: { practiceId: uuid } },
  });

  if (isTrialSubscription) {
    createStaffOnTrialPeriod({ tenantId, userId, isPrescriber, roleIds });
  } else {
    ///////////////////// UPDATE SUBSCRIPTION LOGIC /////////////////////
    //// update for practitioner and staff
    const subscriptionUpdate = await subscriptionService.updateSubscription({
      tenatId: uuid,
      userId,
      roleIds,
    });

    //// update for prescriber
    if (isPrescriber) {
      const subscriptionUpdateForPrescriber = await subscriptionService.updateSubscriptionForPrescriber({
        tenatId: uuid,
        userId,
      });
    }
    ///////////////////////////////////////////////////////////////////
  }

  const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
  if (staff) {
    //////////////////////generate password token/////////////
    const { generatePasswordToken, expires } = await tokenService.generatePasswordToken(user);
    await db.Token.create({
      token: generatePasswordToken,
      userId: user.id,
      expires,
      type: tokenTypes.GENERATE_PASSWORD,
    });
    emailService.sendWelcomeEmailToStaff(uuid, practiceSetting, { staff, token: generatePasswordToken }, password);
  }

  res.status(httpStatus.CREATED).send(staff);
});

const updateStaff = catchAsync(async (req, res) => {
  const { body = {}, user, params, clinicUuid: uuid } = req;
  const { staffId } = params || {};
  const { id: userId } = user;
  const db = getModels(uuid);
  const masterDB = initializeModels(sequelize, true);
  const { email, isActive, file, roleIds, twoFaEnable } = body || {};
  const { id: fileId = null } = file || {};
  delete body.file;
  const updateParams = { ...body, ...(file ? { fileId } : {}), updateById: userId };
  const existingStaff = await dbService.getOneById({
    model: db.Staff,
    id: staffId,
    include: [{ model: db.User, as: 'user' }],
  });
  if (!existingStaff) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('Staff'));
  }
  //////////////////////////SUBSCRIPTION UPDATE////////////////////////////////////
  //// update for practitioner and staff
  const isTrialSubscription = await dbService.getOne({
    model: masterDB.TrialSubscription,
    filter: { where: { practiceId: uuid } },
  });

  if (roleIds) {
    if (isTrialSubscription) {
      await updateTrialSubscription({ tenatId: uuid, userId, existingStaff, roleIds });
    } else {
      const subscriptionUpdate = await subscriptionService.updateSubscription({
        tenatId: uuid,
        userId,
        roleIds,
        existingStaff,
      });
    }
  }
  //////////////////////////////////////////////////////////////////////////////////

  let finalUser = existingStaff.user;
  let removePatientRole = false;
  if (email) {
    const existingStaffWithNewEmail = await dbService.getOne({ model: db.Staff, filter: { where: { email } } });
    if (existingStaffWithNewEmail) {
      throw new Error('Staff with same email already exists!');
    }
    const existingUser = await isUserExist(db.User, { where: { email } });

    if (existingUser) {
      finalUser = existingUser;
      updateParams.userId = existingUser.id;
      await dbService.updateById({
        model: db.User,
        reqParams: { id: existingUser.id, isActive: true, updatedById: userId, isDeleted: false, ...body },
      });
      await dbService.updateById({
        model: db.User,
        reqParams: { id: existingStaff.userId, isActive: false },
      });
    } else {
      await dbService.updateById({
        model: db.User,
        reqParams: { id: existingStaff.userId, isActive: true, isDeleted: false, email, updatedById: userId, ...body },
      });
    }
  }
  if (roleIds && roleIds.length) {
    console.log('🚀 ~ updateStaff ~ roleIds:', roleIds);
    const currentRoles = await finalUser.getRoles(); // Fetch existing roles
    const patientRole = await db.Role.findOne({ where: { code: 'patient' } });
    let rolesToRemove = [];
    // Determine roles to remove (excluding patient role)
    if (removePatientRole) {
      rolesToRemove = currentRoles.filter((role) => !roleIds.includes(role.id)).map((role) => role.id);
    } else {
      rolesToRemove = currentRoles
        .filter((role) => !roleIds.includes(role.id) && role.id !== patientRole.id)
        .map((role) => role.id);
    }

    if (rolesToRemove.length > 0) {
      await finalUser.removeRoles(rolesToRemove); // Remove outdated roles
    }

    await finalUser.addRoles(roleIds); // Add new roles
  }

  if (body.hasOwnProperty('isActive')) {
    await dbService.updateOne({
      model: db.User,
      updateParams: { isActive, updateById: userId },
      filter: { where: { id: existingStaff.userId } },
    });
  }
   if (body.hasOwnProperty('twoFaEnable')) {
    const twoFaToggle = await dbService.updateOne({
      model: db.User,
      updateParams: { twoFaEnable, updateById: userId },
      filter: { where: { id: existingStaff.userId } },
    });
    if(twoFaToggle){
      //mail send

      await emailService.sendTwoFaToggleEmail({
        uuid,
        email: existingStaff.email,
        twoFaEnable
      })
    }
  }

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  if (body.isDeleted === true || body.isActive === false) {
    updateParams.deactivatedDate = moment().utc();
  }
  if (body.isActive === true) {
    updateParams.deactivatedDate = null;
  }
  if (body.isPrescriber === true || body.isPrescriber === false) {
    updateParams.prescribeDate = moment().utc();
  }

  //// update for prescriber
  if (body.isPrescriber) {
    if (isTrialSubscription) {
      await updateTrialSubscriptionForPrescriber({ tenatId: uuid, userId, existingStaff, roleIds });
    } else {
      const subscriptionUpdateForPrescriber = await subscriptionService.updateSubscriptionForPrescriber({
        tenatId: uuid,
        userId,
      });
    }
  }

  const result = await dbService.updateOne({
    model: db.Staff,
    updateParams,
    filter: { where: { id: staffId } },
  });

  //--------------master db ClinicStaff Update-----------------//
  const clinicName = await dbService.getClinicNameById({ model: masterDB?.Practice, clinicId: uuid });
  const roleNames = await dbService.getRoleNamesByIds({ model: db?.Role, roleIds });
  const staff = await dbService.getOneById({ model: db.Staff, id: staffId });
  const titleName = await dbService.getTitleNameByTitleCode({ model: db?.GlobalType, titleCode: staff.titleCode });
  const clinicStaffExists = await dbService.getOne({
    model: masterDB.ClinicStaff,
    filter: { where: { clinicId: uuid, staffId: staffId } },
  });
  if(clinicStaffExists){
    const clinicStaff = await dbService.updateOne({
      model: masterDB.ClinicStaff,
      updateParams: {
        title: titleName,
        clinicId: uuid,
        clinicName: clinicName,
        staffId: staffId,
        firstName: staff.firstName,
        middleName: staff.middleName,
        lastName: staff.lastName,
        email: staff.email,
        role: Array.isArray(roleIds) && roleIds.length > 0 ? roleNames.join(', ') : clinicStaffExists?.role,
        isPrescriber: staff.isPrescriber,
        isDeleted: body.isDeleted === true ? true : staff.isDeleted,
        isActive: isActive === false ? false : staff.isActive,
      },
      filter: { where: { clinicId: uuid, staffId: staffId } },
    });
  }
  //--------------End-----------------//

  res.status(httpStatus.OK).send(result);
});

const getStaffById = catchAsync(async (req, res) => {
  const { params, clinicUuid: uuid } = req || {};
  const { staffId } = params || {};
  const db = getModels(uuid);
  const staff = await dbService.getOneById({
    model: db.Staff,
    id: staffId,
    include: [
      {
        model: db.User,
        as: 'user',
        // include:[{model:db.Role,as:'roles',where:{code:req.query.role}}]
        include: [{ model: db.Role, as: 'roles' }],
      },
      { model: db.GlobalType, as: 'title' },
      { model: db.GlobalType, as: 'genderIdentity' },
      { model: db.File, as: 'file' },
    ],
  });
  res.status(httpStatus.OK).send(staff);
});

module.exports = {
  getStaff,
  createStaff,
  updateStaff,
  getStaffById,
};
