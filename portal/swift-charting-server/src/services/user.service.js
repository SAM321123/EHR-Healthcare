const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { getModelFromRole } = require('../utils');
const { roles } = require('../config/roles');
const { errorMessages } = require('../config/error');
const { getModels } = require('../utils/connection');
const dbService  = require('./db.service');
const randomPassword = require('../utils/randomPassword');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');

const createUser = async (userBody,{tenantId}) => {
  const db = getModels(tenantId);
  const user = await dbService.createOne({ model: db.User, reqParams: { ...userBody } });
  return user;
};

const getUserById = async (id,{tenantId}) => {
  const db = getModels(tenantId);

  return dbService.getOne({ model: db.User, filter: {  where:{id} }});
};

const updateUserById = async (userId, updateBody,{tenantId}) => {
  const user = await getUserById(userId,{tenantId});
  const db = getModels(tenantId);

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.USER_NOT_FOUND);
  }
  const doc = await dbService.updateById({ model: db.User, reqParams: { id: userId, ...updateBody } });
  return doc;
};

const getProfileFromRole = async (reqParams) => {
  const { params, query, user, clinicUuid: uuid } = reqParams;
  const { role } = query;
  // const db = getModels(uuid);
  const db = query?.role === 'superAdmin' ? initializeModels(sequelize, master=true) : getModels(uuid);
  if (params.userId.toString() !== user.id.toString() || !user?.roles?.length || user?.roles?.includes(item=>item.code==role)) {
    throw new ApiError(httpStatus.UNAUTHORIZED, errorMessages.PLEASE_AUTHENTICATE);
  }

  const model = getModelFromRole({ role, db });
  let userDetail;
  if(role === 'superAdmin'){
    userDetail = await dbService.getOne({model});
  }else{
    userDetail = await dbService.getOne({model,filter:{ where: { userId: params.userId } },include:[{model:db.GlobalType,as:'title'},{model:db.File,as:'file'}]});
  }
  return userDetail;
};

const isUserExist = async (model, filter) => {
  return model.findOne(filter);
};


module.exports = {
  getProfileFromRole,
  isUserExist,
  updateUserById,
};
