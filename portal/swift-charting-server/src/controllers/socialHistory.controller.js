const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createSocialHistory = catchAsync(async (req, res) => {
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

  const socialHistory = await dbService.createOne({
    model: db.SocialHistory,
    reqParams: { ...body, createdById: userId },
  });
  res.status(httpStatus.CREATED).send(socialHistory);
});

const getSocialHistory = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.SocialHistory,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
    include: [
      { model: db.GlobalType, as: 'socialHistory' },
      { model: db.GlobalType, as: 'status' },

    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getSocialHistoryById = catchAsync(async (req, res) => {
  const { socialHistoryId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const socialHistory = await dbService.getOneById({ model: db.SocialHistory, id: socialHistoryId });
  if (!socialHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Social history`));
  }
  res.status(httpStatus.OK).send(socialHistory);
});

const updateSocialHistory = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { socialHistoryId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingSocialHistory = await dbService.getOneById({ model: db.SocialHistory, id: socialHistoryId });
  if (!existingSocialHistory) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Social history`));
  }

  const updatedSocialHistory = await dbService.updateOne({
    model: db.SocialHistory,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: socialHistoryId } },
  });
  res.status(httpStatus.OK).send(updatedSocialHistory);
});


module.exports = {
  createSocialHistory,
  getSocialHistoryById,
  updateSocialHistory,
  getSocialHistory,
};
