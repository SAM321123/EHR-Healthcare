const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createAllPatientHistroy = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId,typeCode,...rest } = body || {};
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

  const patientHistory = await dbService.upsert({
    model: db.AllPatientHistory,
    filter:{where:{patientId,typeCode}},
    reqParams: { ...rest, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(patientHistory);
});

const getAllPatientHistory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.AllPatientHistory,
    req,
    allowedFilters: ['patientId','typeCode'],
    searchFilter: [],
  });
  res.status(httpStatus.OK).send(result);
});

const getAllPatientHistoryById = catchAsync(async (req, res) => {
  const { patientHistoryId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const patientHistory = await dbService.getOneById({ model: db.AllPatientHistory, id: patientHistoryId });
  if (!patientHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Medical history`));
  }
  res.status(httpStatus.OK).send(patientHistory);
});

const updatePatientAllHistory = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { patientHistoryId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingPatientHistory = await dbService.getOneById({ model: db.AllPatientHistory, id: patientHistoryId });
  if (!existingPatientHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Medical history`));
  }

  const updateParams = { ...body, updateById: userId };
  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  const updatedMedicalHistory = await dbService.updateOne({
    model: db.AllPatientHistory,
    updateParams,
    filter: { where: { id: patientHistoryId } },
  });
  res.status(httpStatus.OK).send(updatedMedicalHistory);
});

module.exports = {
  createAllPatientHistroy,
  getAllPatientHistoryById,
  updatePatientAllHistory,
  getAllPatientHistory,
};
