const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');

const { getModels } = require('../utils/connection');
const { dbService,  } = require('../services');

const ApiError = require('../utils/ApiError');


const getStaffBookingSetting = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const db = getModels(uuid);
  const {staffId} = req.params || {}
  const bookingSetting = await dbService.getOne({
    model: db.StaffBookingSetting,
    req,
    filter: { where: { staffId, isDeleted: false } },
  });
  res.status(httpStatus.OK).send(bookingSetting);
});
const createStaffBookingSetting = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const {
    staffId,
    cancellationLeadTime,
    cancellationRescheduleTime,
    cancellationPolicyText,
  } = req.body || {};

  const db = getModels(uuid);
  const existingBookingSetting = await dbService.getOne({
    model: db.StaffBookingSetting,
    req,
    filter: { where: { staffId, isDeleted: false } },
  });

  if (existingBookingSetting) {
    throw new Error('Booking setting already exists !');
  }

  const bookingSetting = await db.StaffBookingSetting.create({
    staffId,
    cancellationLeadTime,
    cancellationRescheduleTime,
    cancellationPolicyText,
  });
  res.status(httpStatus.CREATED).send(bookingSetting);
});

const updateStaffBookingSetting = catchAsync(async (req, res) => {
  const { body = {}, user, params, clinicUuid: uuid } = req;
  const { id } = params || {};
  const { id: userId } = user;
  const db = getModels(uuid);
  const existingBookingSetting = await dbService.getOne({ model: db.StaffBookingSetting, filter: { where: { id, isDeleted: false } } });

  if (!existingBookingSetting) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Booking setting not found');
  }
  const updateParams = { id, ...body, updatedById: userId };
  const updatedBookingSetting = await dbService.updateById({ model: db.StaffBookingSetting, reqParams: { ...updateParams } });
  res.status(httpStatus.OK).send(updatedBookingSetting);
});


module.exports = {
  getStaffBookingSetting,
  createStaffBookingSetting,
  updateStaffBookingSetting,
};
