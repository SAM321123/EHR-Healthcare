const httpStatus = require('http-status');
const { pick } = require('lodash');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createHomework = catchAsync(async (req, res) => {
  const { user, body } = req;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientId } = body || {};
  const userId = user.id;
  //   const userId = "123";

  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
});
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  const homework = await dbService.createOne({
    model: db.Homework,
    reqParams: { ...body, createdById: userId },
  });

  res.status(httpStatus.CREATED).send(homework);
});

const getHomework = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  
  const result = await dbService.getPaginated({
    model: db.Homework,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
    include: [
      { model: db.User, as: 'createdBy' },
      { model: db.User, as: 'updatedBy' },
      { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
      { model: db.GlobalType, as: 'status' },

    ],
  });
  res.status(httpStatus.OK).send(result);
});

const updateHomework = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { homeworkId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingHomework = await dbService.getOneById({ model: db.Homework, id: homeworkId });
  if (!existingHomework) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Homework not found');
  }
  

  const updateParams = { ...body, updateById: userId };

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  const [,[updatedHomework]] = await dbService.updateOne({
    model: db.Homework,
    updateParams,
    // updateParams: body,
    filter: { where: { id: homeworkId } },
  });

  res.status(httpStatus.OK).send(updatedHomework);
});


module.exports = {
    createHomework,
    getHomework,
    updateHomework,
};
