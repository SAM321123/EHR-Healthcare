const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createMedicalHistroy = catchAsync(async (req, res) => {
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

  const medicalHistory = await dbService.upsert({
    model: db.MedicalHistory,
    filter:{where:{patientId}},
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(medicalHistory);
});

const getMedicalHistory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.MedicalHistory,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
  });
  res.status(httpStatus.OK).send(result);
});

const getMedicalHistoryById = catchAsync(async (req, res) => {
  const { medicalHistoryId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const medicalHistory = await dbService.getOneById({ model: db.MedicalHistory, id: medicalHistoryId });
  if (!medicalHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Medical history`));
  }
  res.status(httpStatus.OK).send(medicalHistory);
});

const updateMedicalHistory = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { medicalHistoryId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingMedicalHistory = await dbService.getOneById({ model: db.MedicalHistory, id: medicalHistoryId });
  if (!existingMedicalHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Medical history`));
  }

  const updateParams = { ...body, updateById: userId };
  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  const updatedMedicalHistory = await dbService.updateOne({
    model: db.MedicalHistory,
    updateParams,
    filter: { where: { id: medicalHistoryId } },
  });
  res.status(httpStatus.OK).send(updatedMedicalHistory);
});

module.exports = {
  createMedicalHistroy,
  getMedicalHistoryById,
  updateMedicalHistory,
  getMedicalHistory,
};
