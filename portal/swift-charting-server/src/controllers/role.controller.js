const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { dbService } = require('../services');

const createRole = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const { name, description } = req.body || {};

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
  const role = await db.Role.create({
    name, code, description
  });
  res.status(httpStatus.CREATED).send(role);
});

const createRoleSuperAdmin = catchAsync(async (req, res) => {
  const { name } = req.body || {};
  const db = initializeModels(sequelize);
  const role = await db.Role.create({
    name,
  });
  res.status(httpStatus.CREATED).send(role);
});

const getRole = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { role } = req?.query || {};
  const result = await dbService.getPaginated({
    model: db.Role,
    req,
    allowedFilters: [],
    searchFilter: ['name'],
  });
  res.status(httpStatus.OK).send(result);
});

const updateRole = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { roleId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingRole = await dbService.getOneById({ model: db.Role, id: roleId });
  if (!existingRole) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Role`));
  }

  const updatedRole = await dbService.updateOne({
    model: db.Role,
    updateParams: { ...body },
    filter: { where: { id: roleId } },
  });
  res.status(httpStatus.OK).send(updatedRole);
});

module.exports = {
  createRole,
  createRoleSuperAdmin,
  getRole,
  updateRole,
};
