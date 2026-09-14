const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, hl7Service } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');
const { hl7Versions } = require('../../seed-script/mastersData/hl7Versions');
const { getDateDiff } = require('../utils/dateUtility');

const getLabReport= catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {labRadiologyId} = req?.params
  const result = await dbService.getOne({
    model: db.LabReport,
    req,
    filter: {where: {labRadiologyId: labRadiologyId}},
    include: [
      { model: db.LabsRadiology, as: 'labRadiology' },
    ]
    // labRadiologyId: labRadiologyId,
  });
  res.status(httpStatus.OK).send(result);
});
const updateLabReport = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { labReportId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { notes, ...rest } = body || {};

  const existingLabReport = await dbService.getOneById({ 
    model: db.LabReport, 
    id: labReportId,
  });
  if (!existingLabReport) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Lab/Report`));
  }
  
  const updateParams = { ...rest,clinicNote: notes, updatedById: userId,};

  const [, [updatedLabReport]] = await dbService.updateOne({
    model: db.LabReport,
    updateParams,
    filter: { where: { id: labReportId } },
  });
  res.status(httpStatus.OK).send(updatedLabReport);
});

module.exports = {
  getLabReport,
  updateLabReport,
};
