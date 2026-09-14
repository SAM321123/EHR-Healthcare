const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const { dbService } = require('../services');

const createOfficeallyConfig = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const { user, body } = req;
  const userId = user.id;
  const { appName , practiceId , officeallyKey} = body || {};

  const db = getModels(uuid);
  const officeallyConfig = await db.OfficeallyConfig.create({
    appName , practiceId , officeallyKey , createdById: userId
  });
  res.status(httpStatus.CREATED).send(officeallyConfig);
});

const getOfficeallyConfigs = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
const doc = await dbService.getPaginated({
  model: db.OfficeallyConfig,
  req,
  allowedFilters: ['appName'],
  searchFilter: ['appName'],
});
res.status(httpStatus.OK).send(doc);
});


const updateOfficeallyConfig = catchAsync(async (req, res) => {
  const {user,body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const updateParams = {id:req.params.officeallyConfigId,...body,updatedById:user.id};
  if(body.isDeleted){
      updateParams.deletedById= user.id;
  }
const officeallyConfig = await dbService.updateById({model:db.OfficeallyConfig,reqParams:{...updateParams}});
res.status(httpStatus.OK).send(officeallyConfig);
});

const getOfficeallyConfig = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
const officeallyConfig = await dbService.getOneById({model:db.OfficeallyConfig,id:req.params.officeallyConfigId});
if (!officeallyConfig) {
  throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
}
res.status(httpStatus.OK).send(officeallyConfig);
});

module.exports = {
  createOfficeallyConfig,
  getOfficeallyConfigs,
  updateOfficeallyConfig,
  getOfficeallyConfig,
};
