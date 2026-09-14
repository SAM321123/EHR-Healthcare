const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { getModels } = require('../utils/connection');
const { dbService} = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');


const getBlockedUser = catchAsync(async (req, res) => {
const uuid = req.clinicUuid
  const db = getModels(uuid);
  const { role } = req?.query || {};

  let whereClause = {};
  if (role) {
    whereClause = { code: req.query.role };
  }
  const result = await dbService.getPaginated({
    model: db.User,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName', 'email'],
    searchFilter: ['firstName', 'lastName', 'middleName', 'email'],
    addOnFilter:{isBlocked: true},
    include: [{ model: db.Role, as: 'roles', where: whereClause }],
  });
  res.status(httpStatus.OK).send(result);
});

const updateBlockedUser = catchAsync(async (req, res) => {
  const { body = {}, user, params, clinicUuid: uuid } = req;
  console.log("🚀 ~ uuid:", uuid)
  console.log("🚀 ~ body:", body)
  const { staffId } = params || {};
  const { id: userId } = user;
  const db = getModels(uuid);
  const { file} = body || {};
  const { id: fileId = null } = file || {};
  delete body.file;
  const updateParams = { ...body, ...(file ? { fileId } : {}), updateById: userId , loginAttempt: 0};
  console.log("🚀 ~ updateParams:", updateParams)

  const existingStaff = await dbService.getOneById({
    model: db.User,
    id: staffId,
  });
  console.log("🚀 ~ existingStaff:", existingStaff)
  if (!existingStaff) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND('User'));
  }

  const result = await dbService.updateOne({
    model: db.User,
    updateParams,
    filter: { where: { id: staffId } },
  });

  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getBlockedUser,
  updateBlockedUser,
};