const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const ApiError = require('../utils/ApiError');
const { dbService } = require('../services');

const createMdToolboxConfig = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req || {};
  const { user, body } = req;
  const userId = user.id;
  const { appName , practiceId , mdToolboxKey} = body || {};

  const db = getModels(uuid);
  const mdToolboxConfig = await db.MdToolboxConfig.create({
    appName , practiceId , mdToolboxKey , createdById: userId
  });
  res.status(httpStatus.CREATED).send(mdToolboxConfig);
});

const getMdToolboxConfigs = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
const mdToolboxConfig = await dbService.getPaginated({
  model: db.MdToolboxConfig,
  req,
  allowedFilters: ['appName'],
  searchFilter: ['appName'],
});
res.status(httpStatus.OK).send(mdToolboxConfig);
});


const updateMdToolboxConfig = catchAsync(async (req, res) => {
  const {user,body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const updateParams = {id:req.params.mdToolboxConfigId,...body,updatedById:user.id};
  if(body.isDeleted){
      updateParams.deletedById= user.id;
  }
const mdToolboxConfig = await dbService.updateById({model:db.MdToolboxConfig,reqParams:{...updateParams}});
res.status(httpStatus.OK).send(mdToolboxConfig);
});

const getMdToolboxConfig = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
const mdToolboxConfig = await dbService.getOneById({model:db.MdToolboxConfig,id:req.params.mdToolboxConfigId});
if (!mdToolboxConfig) {
  throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
}
res.status(httpStatus.OK).send(mdToolboxConfig);
});

module.exports = {
  createMdToolboxConfig,
  getMdToolboxConfigs,
  updateMdToolboxConfig,
  getMdToolboxConfig,
};
