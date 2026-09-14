const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getTestingLabs = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.TestingLab,
    req,
    allowedFilters: [],
    searchFilter: ['name'],
  });
  res.status(httpStatus.OK).send(result);
});

const createTestingLab = catchAsync(async (req, res) => {
  const { user: { id: userId } = {} } = req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const doc = await db.TestingLab.create({...req.body, createdBy: userId });
  res.status(httpStatus.CREATED).send(doc);
});

const updateTestingLab = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { testingLabId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingTestingLab = await dbService.getOneById({ model: db.TestingLab, id: testingLabId });
  if (!existingTestingLab) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Lab Test`));
  }

  const updatedTestingLab = await dbService.updateOne({
    model: db.TestingLab,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: testingLabId } },
  });
  res.status(httpStatus.OK).send(updatedTestingLab);
});


module.exports = {
  getTestingLabs,
  createTestingLab,
  updateTestingLab,
};
