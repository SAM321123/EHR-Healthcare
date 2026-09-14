const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { dbService } = require('../services');

const createModule = catchAsync(async (req, res) => {
  const { clinicUuid: uuid, body } = req || {};
  const { name, permissionIds } = body || {};
  const data = {...body};
  delete data?.permissions;

  const db = getModels(uuid);
   // Convert name to camelCase for the code
   const toCamelCase = (str) => {
    return str
      .split(' ')
      .map((word, index) => 
        index === 0 ? word.toLowerCase() : word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      )
      .join('');
  };

  const code = toCamelCase(name);
  
  const Module = await db.Module.create({
    ...data, code
    // ...body, code
  });

  if( permissionIds && permissionIds.length){
      await Module.setPermissions(permissionIds);
    }
  res.status(httpStatus.CREATED).send(Module);
});



const getModule = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { module } = req?.query || {};
  
  const result = await dbService.getPaginated({
    model: db.Module,
    req,
    allowedFilters: [],
    searchFilter: ['name'],
    include: [
      { model: db.GlobalType, as: 'permissions' },
    ],
  });

  result?.results?.forEach(module => {
    const permissionIds = module.permissions?.map(permission => permission.id) || [];
    module.setDataValue('permissionIds', permissionIds);
  });
  res.status(httpStatus.OK).send(result);
});

const updateModule = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { permissionIds } = body;
  const { moduleId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingModule = await dbService.getOneById({ model: db.Module, id: moduleId });
  if (!existingModule) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Module`));
  }

  const [, [updatedModule]] = await dbService.updateOne({
    model: db.Module,
    updateParams: { ...body },
    filter: { where: { id: moduleId } },
  });
  if( permissionIds && permissionIds.length){
    await updatedModule.setPermissions(permissionIds);
  }
  res.status(httpStatus.OK).send(updatedModule);
});

module.exports = {
  createModule,
  getModule,
  updateModule,
};
