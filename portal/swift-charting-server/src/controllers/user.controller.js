const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService, dbService, tokenService } = require('../services');
const { User, initializeModels } = require('../models');
const { getModels } = require('../utils/connection');
const { tokenTypes } = require('../config/tokens');
const { modulePermission } = require('../utils');
const { sequelize } = require('../config/database');
const { roles } = require('../config/roles');

const createUserBySuperAdmin = catchAsync(async (req, res) => {
  const { email, password, role = 1 } = req.body || {};
  const user = await User.create({ email, password, role });
  res.status(httpStatus.CREATED).send(user);
});

const createUser = catchAsync(async (req, res) => {
  const { email, password, role = 1 } = req.body || {};
  const { tenantId } = req.user || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const user = await db.User.create({ email, password, role, tenantId });
  res.status(httpStatus.CREATED).send(user);
});

const getUsers = catchAsync(async (req, res) => {
  const {query} = req;
  
  const uuid = query?.practice ?  parseInt(query.practice, 10): req.clinicUuid;

  const db = getModels(uuid);
  const { roleId } = req.query;
  const roleFilter = roleId ? {
    include: [{
      model: db.Role,
      where: { id: roleId },
      as:'roles',
    }],
  } : [];
  const result = await dbService.getPaginated({
    model: db.User,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName'],
    searchFilter: ['firstName', 'lastName', 'middleName'],
    ...roleFilter
  });
  res.status(httpStatus.OK).send(result);
});

const getUser = catchAsync(async (req, res) => {
  // const user = await userService.getProfileFromRole(req);
  // if(user){
  // delete user.signature;
  try{
    const { query } = req;
    const uuid = req.clinicUuid;
    const isSuperAdmin = query.role === 'superAdmin';
    const db = isSuperAdmin ? initializeModels(sequelize, true) : getModels(uuid);
    
    let userRoleDeatil = await userService.getProfileFromRole(req);
    if(userRoleDeatil){
      delete userRoleDeatil.signature;
    }
    const user = isSuperAdmin ? userRoleDeatil : await userRoleDeatil.getUser();
    const tokens = await tokenService.generateAuthTokens(user,query.role); 

    userRoleDeatil = await userRoleDeatil.get({plain:true});
  
    userRoleDeatil.tokens = tokens;
    await db.Token.create({
      token: tokens.refresh.token,
      userId: user?.id,
      expires: tokens.refresh.expires,
      type: tokenTypes.REFRESH,
    });

    if(!isSuperAdmin){  
      const result = await dbService.getAll({ 
        model: db.Role,
        req,
        allowedFilters: [],
        searchFilter: ['name'],
        filter: {where: {code:query.role}},
        otherOptions: {
          include: [{
            model: db.RoleAndPermissions,
            as: 'RoleAndPermission',
            include: [
              { model: db.Module, as: "module" },
              { model: db.GlobalType, as: "permissions" }
            ]
          }]
        }
      });
      const permission = modulePermission(result);
      userRoleDeatil.permissions = permission;
    }
    res.status(httpStatus.OK).send(userRoleDeatil);
  }catch(error){
    console.error("Error while getting user:", error);
    res.status(httpStatus.INTERNAL_SERVER_ERROR).send({
      message: "Error while getting user",
      error: error.message,
    });
  }
});

const getUsersBySuperAdmin = catchAsync(async (req, res) => {
  const {query} = req;
  
  const uuid = query?.practice ?  parseInt(query.practice, 10): req.clinicUuid;

  const db = getModels(uuid);
  const role = await dbService.getOne({
      model: db.Role,
      filter: {
        where: {
          code:roles.CLINIC_ADMIN,
        },
        attributes: ['id'],
      },
    });
    const roleId = role?.id;
  // const { roleId } = req.query;
  const roleFilter = roleId ? {
    include: [{
      model: db.Role,
      where: { id: roleId },
      as:'roles',
    }],
  } : [];
  const result = await dbService.getPaginated({
    model: db.User,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName'],
    searchFilter: ['firstName', 'lastName', 'middleName'],
    ...roleFilter
  });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  createUser,
  createUserBySuperAdmin,
  getUsers,
  getUser,
  getUsersBySuperAdmin
};
