const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createFamilyHistory = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId } = body || {};
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const familyHistory = await dbService.createOne({
    model: db.FamilyHistory,
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(familyHistory);
});

const getFamilyHistory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.FamilyHistory,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
    include: [
      { model: db.GlobalType, as: 'relationship' },
      { model: db.GlobalType, as: 'condition' },
      { model: db.GlobalType, as: 'status' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getFamilyHistoryById = catchAsync(async (req, res) => {
  const { familyHistoryId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const familyHistory = await dbService.getOneById({ model: db.FamilyHistory, id: familyHistoryId });
  if (!familyHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Family history`));
  }
  res.status(httpStatus.OK).send(familyHistory);
});

const updateFamilyHistory = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { familyHistoryId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingFamilyHistory = await dbService.getOneById({ model: db.FamilyHistory, id: familyHistoryId });
  if (!existingFamilyHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Family history`));
  }
  const updateParams = { ...body, updateById: userId };
  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  const updatedFamilyHistory = await dbService.updateOne({
    model: db.FamilyHistory,
    updateParams,
    filter: { where: { id: familyHistoryId } },
  });
  res.status(httpStatus.OK).send(updatedFamilyHistory);
});

module.exports = {
  createFamilyHistory,
  getFamilyHistoryById,
  updateFamilyHistory,
  getFamilyHistory,
};
