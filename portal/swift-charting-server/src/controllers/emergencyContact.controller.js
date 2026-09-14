/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const randomPassword = require('../utils/randomPassword');
const { dbService } = require('../services');
const { isUserExist } = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createEmergencyContact = catchAsync(async (req, res) => {
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

  const emergencyContactDocument = await dbService.createOne({
    model: db.EmergencyContact,
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(emergencyContactDocument);
});

const getEmergencyContact = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.EmergencyContact,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
    include: [{ model: db.Patient, as: 'patient' },{ model: db.GlobalType, as: 'patientRelation' }],
  });
  res.status(httpStatus.OK).send(result);
});

const getEmergencyContactById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { emergencyContactId } = req.params || {};
  const db = getModels(uuid);
  const result = await dbService.getOneById({ model: db.EmergencyContact, id: emergencyContactId });
  res.status(httpStatus.OK).send(result);
});

const updateEmergencyContact = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { emergencyContactId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingPatientDocument = await dbService.getOneById({ model: db.EmergencyContact, id: emergencyContactId });
  if (!existingPatientDocument) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient Medication not found');
  }

  const updateParams = { ...body, updateById: userId };

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  const updatedPatientDoument = await dbService.updateOne({
    model: db.EmergencyContact,
    updateParams,
    // updateParams: body,
    filter: { where: { id: emergencyContactId } },
  });
  res.status(httpStatus.OK).send(updatedPatientDoument);
});
module.exports = {
  createEmergencyContact,
  getEmergencyContact,
  getEmergencyContactById,
  updateEmergencyContact,
};
