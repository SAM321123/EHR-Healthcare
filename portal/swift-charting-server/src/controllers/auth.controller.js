/* eslint-disable no-unused-vars */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { authService, tokenService, dbService, emailService } = require('../services');
const { getModels } = require('../utils/connection');
const { tokenTypes } = require('../config/tokens');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { initializeModels } = require('../models');
const randomPassword = require('../utils/randomPassword');
const { sequelize } = require('../config/database');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { roles } = require('../config/roles');
const { where } = require('sequelize');
const jwt = require('jsonwebtoken');
const { loginLogsEntry } = require('../services/loginLogs.service');
const { loginAttempt } = require('../utils');
const getLocation = require('../services/location.service');
const { UtcToFormat, dateTimeFormat } = require('../utils/dateUtility');
const logger = require('../config/logger');

const resetSuccessfulLoginState = async (db, user) => {
  if (!user?.id) {
    return;
  }

  if (!user.loginAttempt && !user.isBlocked && !user.blockedDateTime) {
    return;
  }

  await dbService.updateOne({
    model: db.User,
    filter: { where: { id: user.id } },
    updateParams: {
      loginAttempt: 0,
      isBlocked: false,
      blockedDateTime: null,
    },
  });
};

const registerSuperAdmin = catchAsync(async (req, res) => {
  const { name, email, password, roleId = 1 } = req.body || {};
  const db = initializeModels(sequelize);

  const user = await db.User.create({
    name,
    email,
    password,
    roleId,
  });
  res.status(httpStatus.CREATED).send({ user, tokens: {} });
});

const register = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  // const { name, email, password, roleId = 1 } = req.body || {};
  const { firstName, lastName, email, phone } = req.body || {};

  const isEmailExist = await db.User.findOne({ where: { email: email } });

  if (isEmailExist) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_EXISTS);
  }

  const patientRole = await dbService.getOne({ model: db.Role, filter: { where: { code: roles.PATIENT } } });
  const password = randomPassword();

  let user;
  let patient;
  try {
    user = await db.User.create({
      firstName,
      lastName,
      email,
      password,
      tenantId: uuid,
    });
    await user.addRole(patientRole?.id);
    patient = await db.Patient.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      userId: user?.id,
    });

    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });

    if (patient) {
      emailService.sendWelcomeEmailToPatient(uuid, practiceSetting, { patient, user: { userId: user?.id } }, password);
    }
  } catch (error) {
    throw new ApiError(httpStatus.BAD_REQUEST, error?.errors[0]?.message);
  }
  res.status(httpStatus.CREATED).send(patient);
});

const login = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  //to check practice active
  const practiceSetting = await db.PracticeSetting.findOne({});
  if (!practiceSetting?.isActive) {
    res.send({
      error: true,
      message: 'This practice is currently inactive. Please contact the administrator for assistance.',
    });
    return;
  }

  const roleWhere = {};
  if (role === roles.PATIENT) {
    roleWhere.code = role;
  }
  const user = await db.User.findOne({
    where: { email, isDeleted: false },
    include: [{ model: db.Role, as: 'roles', where: roleWhere }],
  });
  if (!user) {
    res.send({ error: true, message: 'Wrong email or password' });
    return;
  }
  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch) {
    res.send({ error: true, message: 'Wrong email or password' });
    return;
  }
  if (user?.roles?.length === 1 && role !== roles.PATIENT && user?.roles.some((item) => item.code === roles.PATIENT)) {
    res.send({ error: true, message: 'Wrong email or password' });
    return;
  }
  if (!user.isActive) {
    res.send({ error: true, message: errorMessages.USER_INACTIVE });
    return;
  }

  // try{

  //   const roleId = await db.Role.findOne({
  //     where: {
  //       code: role
  //     },
  //     attributes: ['id']
  //   })
  //   console.log('roleId---------------->', roleId)
  //   // const listOfPermissions = await RolePermissions.findAll({
  //   //   where: {
  //   //     roleId: userRoleId,
  //   //     depId,
  //   //   },
  //   // })

  //   // console.log('permission---list--', listOfPermissions)
  //   // if (listOfPermissions?.length > 0) {
  //   //   logger.info(
  //   //     { component: 'auth', method: 'loginUser' },
  //   //     {
  //   //       user: empId,
  //   //       message: `permissions fetched successfully.Length of permissions are ${listOfPermissions?.length}`,
  //   //     },
  //   //   )
  //   //   for (let i = 0; i < listOfPermissions.length; i++) {
  //   //     const { moduleId, permissions } = listOfPermissions[i]
  //   //     const moduleName = await GlobalType.findOne({
  //   //       where: {
  //   //         id: moduleId,
  //   //         globalTypeCategory_uniqeValue: 'modules',
  //   //       },
  //   //     })
  //   //     const permissionsName = await GlobalType.findAll({
  //   //       where: {
  //   //         id: {
  //   //           [Op.in]: permissions?.includes(',')
  //   //             ? permissions?.split(',')
  //   //             : [Number(permissions)],
  //   //         },
  //   //         globalTypeCategory_uniqeValue: 'permissions',
  //   //       },
  //   //     })

  //   //     const permissionsNames = []
  //   //     if (!isEmpty(permissionsName)) {
  //   //       for (let j = 0; j < permissionsName?.length; j++) {
  //   //         const localPermission = permissionsName[j]
  //   //         if (localPermission?.dataValues?.uniqueValue) {
  //   //           permissionsNames?.push(localPermission?.dataValues?.uniqueValue)
  //   //         }
  //   //       }
  //   //       userRoles[`${moduleName?.uniqueValue}`] = permissionsNames
  //   //     }
  //   //   }
  //   // }
  // } catch (e) {
  //   logger.error({ component: 'auth', method: 'loginUser', user: empId, error: e })
  //   throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
  // }

  const tokens = await tokenService.generateAuthTokens(user);
  await db.Token.create({
    token: tokens.refresh.token,
    userId: user.id,
    expires: tokens.refresh.expires,
    type: tokenTypes.REFRESH,
  });
  res.send({ user, tokens });
});

const logout = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { refreshToken } = req.body;
  const db = uuid ? getModels(uuid) : initializeModels(sequelize, true);
  try {
    const refreshTokenDoc = await db.Token.findOne({
      where: { token: refreshToken, type: tokenTypes.REFRESH, blacklisted: false },
    });
    if (!refreshTokenDoc) {
      throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
    }
    await db.Token.destroy({ where: { id: refreshTokenDoc.id } });
  } catch (err) {
    console.log('🚀 ~ logout ~ err:', err);
  }
  res.status(httpStatus.OK).send({ status: 'success' });
});

const refreshTokens = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { refreshToken, userRole } = req.body;
  const db = userRole === 'superAdmin' ? initializeModels(sequelize, (master = true)) : getModels(uuid);
  const refreshTokenDoc = await tokenService.verifyToken(
    { token: refreshToken, type: tokenTypes.REFRESH },
    { model: db.Token }
  );

  let loginUserRole;
  if (refreshTokenDoc?.token) {
    const decoded = jwt.decode(refreshTokenDoc.token);
    loginUserRole = decoded?.loginUserRole;
    refreshTokenDoc.loginUserRole = loginUserRole;
  }
  if (!refreshTokenDoc?.loginUserRole) {
    refreshTokenDoc.loginUserRole = 'superAdmin';
  }
  const user = await db.User.findOne({ where: { id: refreshTokenDoc.userId } });
  if (!user) {
    throw new Error();
  }
  await db.Token.destroy({ where: { id: refreshTokenDoc.id } });
  const tokens = await tokenService.generateAuthTokens(user, refreshTokenDoc?.loginUserRole);
  await db.Token.create({
    token: tokens.refresh.token,
    userId: user.id,
    expires: tokens.refresh.expires,
    type: tokenTypes.REFRESH,
  });
  res.status(httpStatus.OK).send({ status: 'success', tokens });
});

const validateToken = catchAsync(async (req, res) => {
  const { user } = req;
  res.status(httpStatus.OK).send(user);
});

const forgotPassword = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const email = req.body.email;
  const db = getModels(uuid);
  const user = await dbService.getOne({ model: db.User, filter: { where: { email } } });
  if (user) {
    const { resetPasswordToken, expires } = await tokenService.generateResetPasswordToken(user);
    await db.Token.create({
      token: resetPasswordToken,
      userId: user.id,
      expires,
      type: tokenTypes.RESET_PASSWORD,
    });
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    await emailService.sendResetPasswordEmail(
      uuid,
      practiceSetting,
      { to: req.body.email, reqParams: { ...user, token: resetPasswordToken } },
      resetPasswordToken
    );
  } else {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }

  res.status(httpStatus.OK).send({ status: 'success' });
});

const resetPassword = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const newPassword = req.body.password;
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      { token: req.query.token, type: tokenTypes.RESET_PASSWORD },
      { model: db.Token }
    );
    const user = await dbService.getOneById({ model: db.User, id: resetPasswordTokenDoc.userId });
    if (!user) {
      throw new Error('user not found');
    }
    await dbService.updateById({ model: db.User, reqParams: { id: user.id, password: newPassword, firstTimeLogin: false } });
    await dbService.deleteMany({ model: db.Token, filter: { where: { userId: user.id, type: tokenTypes.RESET_PASSWORD } } });
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    await emailService.sendPasswordUpdateEmail(uuid, practiceSetting, { to: user.email, firstName: user.firstName });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.PASSWORD_RESET_FAILED);
  }
  res.status(httpStatus.OK).send({ status: 'success' });
});

const isValidToken = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const message = await authService.isValidToken(req.query.token, { model: db.Token }, req.query.isGeneratePassword);
  res.status(httpStatus.OK).send({ status: 'success', message });
});

const changePassword = catchAsync(async (req, res) => {
  const { user, body } = req;
  const uuid = req.clinicUuid;
  const { password, newPassword } = body;
  await authService.changePassword({ password, newPassword, user, tenantId: uuid });
  res.status(httpStatus.OK).send({ status: 'success' });
});

const adminLogin = catchAsync(async (req, res) => {
  const { email, password, role } = req.body;
  // const uuid = req.clinicUuid;

  const db = initializeModels(sequelize, true);
  const roleWhere = { code: 'superAdmin' };
  const user = await db.User.findOne({
    where: { email, isDeleted: false },
    include: [{ model: db.Role, as: 'roles', where: roleWhere }],
  });
  if (!user) {
    res.send({ error: true, message: 'Wrong email or password' });
    return;
  }
  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch) {
    res.send({ error: true, message: 'Wrong email or password' });
    return;
  }
  if (!user.isActive) {
    res.send({ error: true, message: errorMessages.USER_INACTIVE });
    return;
  }

  const tokens = await tokenService.generateAuthTokens(user, role);
  await db.Token.create({
    token: tokens.refresh.token,
    userId: user.id,
    expires: tokens.refresh.expires,
    type: tokenTypes.REFRESH,
  });
  res.send({ user, tokens });
});

const checkUserExistsWithCredentials = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  const deviceDetail = req.headers['user-agent'];
  const { email, password, role, deviceId, browserTimezone } = req.body;
  const isSuperAdmin = role === 'superAdmin';
  const db = isSuperAdmin ? initializeModels(sequelize, true) : getModels(uuid);

  let user;
  let codeModel = db.VerifyCode;
  let tokens = {};
  let allowed2FA = true;
  const lastLogin = await db.LoginLogs.findOne({
    where: { email, userIp, deviceDetail, status: 'Success', deviceId },
    order: [['loginTime', 'DESC']],
  });
  if (lastLogin && lastLogin?.loginTime) {
    const lastTime = new Date(lastLogin.loginTime);
    const currentTime = new Date();

    // Check if it's been 30 or more days
    const daysDiff = (currentTime - lastTime) / (1000 * 60 * 60 * 24);
    if (daysDiff <= 30) {
      allowed2FA = false;
    }
  }
  user = await db.User.findOne({
    where: { email, isDeleted: false },
  });
  allowed2FA = Boolean(user?.twoFaEnable) && allowed2FA;
  if (isSuperAdmin) {
    const roleWhere = { code: 'superAdmin' };
    user = await db.User.findOne({
      where: { email, isDeleted: false },
      include: [{ model: db.Role, as: 'roles', where: roleWhere }],
    });
    if (allowed2FA === true) {
      codeModel = db.Code;
    }
  } else {
    // Check if practice is active
    const practiceSetting = await db.PracticeSetting.findOne({});
    if (!practiceSetting?.isActive) {
      if (allowed2FA === false) {
        await loginLogsEntry(email, req, role, 'Failed', deviceId);
      }
      return res.send({
        error: true,
        message: 'This practice is currently inactive. Please contact the administrator for assistance.',
      });
    }
    const roleWhere = {};
    if (role === roles.PATIENT) {
      roleWhere.code = role;
    }
    user = await db.User.findOne({
      where: { email, isDeleted: false },
      include: [{ model: db.Role, as: 'roles', where: roleWhere }],
    });

    if (user?.roles?.length === 1 && role !== roles.PATIENT && user?.roles.some((item) => item.code === roles.PATIENT)) {
      if (allowed2FA === false) {
        await loginLogsEntry(email, req, role, 'Failed', deviceId);
      }
      return res.send({ error: true, message: 'Wrong email or password' });
    }
  }

  if (!user) {
    if (allowed2FA === false) {
      await loginLogsEntry(email, req, role, 'Failed', deviceId);
    }
    return res.send({ error: true, message: 'Wrong email or user not exist' });
  }

  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch) {
    if (allowed2FA === false) {
      await loginLogsEntry(email, req, role, 'Failed', deviceId);
    }
    const nextAttempt = Math.min(user.loginAttempt + 1, loginAttempt.loginFailedCount);
    if (
      user.loginAttempt < loginAttempt.loginFailedCount &&
      user?.roles?.some((item) => item.code !== roles.CLINIC_ADMIN && item.code !== roles.SUPER_ADMIN)
    ) {
      const updateLoginAttempt = await dbService.updateOne({
        model: db.User,
        filter: { where: { id: user.id } },
        updateParams: {
          loginAttempt: nextAttempt,
          ...(nextAttempt === 3 && {
            isBlocked: true,
            blockedDateTime: new Date(),
          }),
        },
      });

      if (
        user?.roles?.some((item) => item.code !== roles.CLINIC_ADMIN && item.code !== roles.SUPER_ADMIN) &&
        updateLoginAttempt
      ) {
        const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
        await emailService.sendFailedLoginAttemptEmail(uuid, practiceSetting, { to: user.email });
      }
    }

    return res.send({ error: true, message: 'Wrong password' });
  }

  if (!user.isActive) {
    if (allowed2FA === false) {
      await loginLogsEntry(email, req, role, 'Failed', deviceId);
    }
    return res.send({ error: true, message: errorMessages.USER_INACTIVE });
  }

  await resetSuccessfulLoginState(db, user);

  if (allowed2FA === true) {
    const existingCodes = await dbService.getOne({ model: codeModel, filter: { where: { email } } });
    if (existingCodes) {
      await dbService.deleteMany({
        model: codeModel,
        filter: { where: { email } },
      });
    }
    const emailPayload = {
      email,
      req,
      ...(isSuperAdmin ? {} : { uuid }),
    };

    const code = await emailService.sendVerificationCodeMail(emailPayload);
    console.log('code-----', code);
    const expiresAt = Date.now() + 15 * 60 * 1000;
    await dbService.createOne({
      model: codeModel,
      reqParams: {
        code,
        email,
        expires: expiresAt,
      },
    });
    const lastLoginTime = UtcToFormat(new Date(), {
      format: dateTimeFormat,
    });
    
    let userTimezone = browserTimezone || 'UTC';
    
    const userIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
    const deviceDetail = req.headers['user-agent'];
    const location = await getLocation(userIp);
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    const { logo } = practiceSetting?.logoConfigs || {};
    const response = await emailService.sendNewDeviceLoginNotificationEmail({
      email,
      userIp,
      deviceDetail,
      location,
      lastLoginTime,
      userTimezone,
      logo,
    });
  } else {
    tokens = await tokenService.generateAuthTokens(user);
    await db.Token.create({
      token: tokens.refresh.token,
      userId: user.id,
      expires: tokens.refresh.expires,
      type: tokenTypes.REFRESH,
    });
    await loginLogsEntry(email, req, role, 'Success', deviceId);
  }
  res.status(httpStatus.OK).send({ user, allowed2FA, tokens });
});

const verifyEmailCode = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { email, code, role, deviceId } = req.body;
  const isSuperAdmin = role === 'superAdmin';
  const db = isSuperAdmin ? initializeModels(sequelize, true) : getModels(uuid);

  let codeModel = isSuperAdmin ? db.Code : db.VerifyCode;

  if (!email && !code) {
    await loginLogsEntry(email, req, role, 'Failed', deviceId);
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  let roleWhere = {};
  if (role !== 'superAdmin') {
    if (role === roles.PATIENT) {
      roleWhere.code = role;
    }
  } else {
    roleWhere = { code: 'superAdmin' };
  }
  const codeData = await dbService.getOne({ model: codeModel, filter: { where: { email } } });

  const isExpired = codeData?.expires && new Date(codeData.expires) < new Date();

  const verifyCode = await codeModel.findOne({
    where: { email },
  });
  ////////////////////////compare code//////////////////////////////
  const isCodeMatch = await verifyCode.isCodeMatch(code);
  if (!isCodeMatch) {
    await loginLogsEntry(email, req, role, 'Failed', deviceId);
    res.send({ error: true, message: errorMessages.INVALID_OR_EXPIRE_CODE });
    return;
  }

  // if(isExpired || (codeData?.code === parseInt(code))){
  if (isExpired || isCodeMatch) {
    await dbService.deleteOne({
      model: codeModel,
      filter: { where: { email } },
    });
  }

  // if(isExpired ||(codeData?.code !== parseInt(code)) || codeData === null ){
  if (isExpired || isCodeMatch === false || codeData === null) {
    await loginLogsEntry(email, req, role, 'Failed', deviceId);
    throw new ApiError(httpStatus.CONFLICT, errorMessages.INVALID_OR_EXPIRE_CODE);
  }

  const user = await db.User.findOne({
    where: { email, isDeleted: false },
    include: [{ model: db.Role, as: 'roles', where: roleWhere }],
  });
  await resetSuccessfulLoginState(db, user);
  const tokens = await tokenService.generateAuthTokens(user);
  await db.Token.create({
    token: tokens.refresh.token,
    userId: user.id,
    expires: tokens.refresh.expires,
    type: tokenTypes.REFRESH,
  });
  await loginLogsEntry(email, req, role, 'Success', deviceId);
  res.send({ user, tokens });
});

const generatePassword = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const newPassword = req.body.password;
  try {
    const generatePasswordTokenDoc = await tokenService.verifyToken(
      { token: req.query.token, type: tokenTypes.GENERATE_PASSWORD },
      { model: db.Token }
    );
    const user = await dbService.getOneById({ model: db.User, id: generatePasswordTokenDoc.userId });
    if (!user) {
      throw new Error('user not found');
    }
    await dbService.updateById({ model: db.User, reqParams: { id: user.id, password: newPassword, firstTimeLogin: false } });
    await dbService.deleteMany({
      model: db.Token,
      filter: { where: { userId: user.id, type: tokenTypes.GENERATE_PASSWORD } },
    });
    const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
    await emailService.sendPasswordGeneratedEmail(uuid, practiceSetting, { to: user.email, firstName: user.firstName });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.PASSWORD_RESET_FAILED);
  }
  res.status(httpStatus.OK).send({ status: 'success' });
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  validateToken,
  registerSuperAdmin,
  forgotPassword,
  resetPassword,
  isValidToken,
  changePassword,
  adminLogin,
  checkUserExistsWithCredentials,
  verifyEmailCode,
  generatePassword,
};
