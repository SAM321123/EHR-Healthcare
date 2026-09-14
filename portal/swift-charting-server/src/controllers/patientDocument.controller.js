/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const randomPassword = require('../utils/randomPassword');
const { dbService } = require('../services');
const { isUserExist } = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createPatientDocument = catchAsync(async (req, res) => {
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

  const patientDocument = await dbService.createOne({
    model: db.PatientDocument,
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(patientDocument);
});

const getPaitentDocument = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.PatientDocument,
    req,
    allowedFilters: ['patientId'],
    searchFilter: ['title'],
    include: [
      { model: db.File, as: 'file' },
      { model: db.GlobalType, as: 'type' },
      { model: db.Staff, as: 'provider',include:[{model:db.GlobalType,as:'title'}] },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getPatientDocumentById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { patientDocumentId } = req.params || {};
  const db = getModels(uuid);
  const result = await dbService.getOneById({ model: db.PatientDocument, id: patientDocumentId });
  res.status(httpStatus.OK).send(result);
});

const updatePatientDocument = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { patientDocumentId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingPatientDocument = await dbService.getOneById({ model: db.PatientDocument, id: patientDocumentId });
  if (!existingPatientDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient Document not found');
  }

  const updateParams = { ...body, updateById: userId };

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  const updatedPatientDoument = await dbService.updateOne({
    model: db.PatientDocument,
    updateParams,
    // updateParams: body,
    filter: { where: { id: patientDocumentId } },
  });
  res.status(httpStatus.OK).send(updatedPatientDoument);
});
module.exports = {
  createPatientDocument,
  getPaitentDocument,
  getPatientDocumentById,
  updatePatientDocument,
};
