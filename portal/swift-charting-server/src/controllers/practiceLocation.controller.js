const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const { dbService } = require('../services');

const createPracticeLocation = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const { name, address, faxNo, phoneNo, contactPersonNo ,schedule} = req.body || {};

  const db = getModels(uuid);
  const practiceLocation = await db.PracticeLocation.create({
    name,
    address,
    faxNo, 
    phoneNo,
    schedule,
    contactPersonNo,
  });
  res.status(httpStatus.CREATED).send(practiceLocation);
});

const getPracticeLocations = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const db = getModels(uuid);
  
  const practiceLocations = await dbService.getPaginated({
    model: db.PracticeLocation,
    req,
    allowedFilters: [],
    searchFilter: ['name'],
  })
  // const practiceLocations = await db.PracticeLocation.findAll();
  res.status(httpStatus.CREATED).send(practiceLocations);
});

const getPracticeLocation = catchAsync(async (req, res) => {
  const { clinicUuid: uuid, params: { practiceLocationId } = {} } = req || {};

  const db = getModels(uuid);
  const practiceLocation = await db.PracticeLocation.findOne({ where: { id: practiceLocationId } });
  res.status(httpStatus.CREATED).send(practiceLocation);
});

const updatePracticeLocation = catchAsync(async (req, res) => {
  const { clinicUuid: uuid, params: { practiceLocationId } = {}, body: { name, address } = {},body } = req || {};

  const db = getModels(uuid);
  const practiceLocation = await db.PracticeLocation.findOne({ where: { id: practiceLocationId } });
  if (!practiceLocation) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Practition Location not found');
  }
  // await db.PracticeLocation.update({ name, address }, { where: { id: practiceLocationId } });
  await db.PracticeLocation.update({...body}, { where: { id: practiceLocationId } });
  res.status(httpStatus.CREATED).send('Practice location updated');
});

module.exports = {
  createPracticeLocation,
  getPracticeLocations,
  getPracticeLocation,
  updatePracticeLocation,
};
