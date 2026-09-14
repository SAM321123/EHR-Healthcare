const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createVitals = catchAsync(async (req, res) => {
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

  const vitals = await dbService.createOne({
    model: db.Vitals,
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(vitals);
});

const getVitals = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.Vitals,
    req,
    allowedFilters: ['patientId','patientEncounterId'],
    searchFilter: ['bpMM','height','weight','bmi','spO2','heartRate'],
  });
  res.status(httpStatus.OK).send(result);
});

const getVitalsById = catchAsync(async (req, res) => {
  const { vitalsId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const vitals = await dbService.getOneById({ model: db.Vitals, id: vitalsId });
  if (!vitals) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Vitals`));
  }
  res.status(httpStatus.OK).send(vitals);
});

const updateVitals = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { vitalsId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingVitals = await dbService.getOneById({ model: db.Vitals, id: vitalsId });
  if (!existingVitals) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Vitals`));
  }

  const [,[updatedVitals]] = await dbService.updateOne({
    model: db.Vitals,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: vitalsId } },
  });
  res.status(httpStatus.OK).send(updatedVitals);
});


module.exports = {
  createVitals,
  getVitalsById,
  updateVitals,
  getVitals,
};
