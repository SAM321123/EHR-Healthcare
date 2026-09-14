const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getBehaviorGoal = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;

  const db = getModels(uuid);

  const Goals = await dbService.getPaginated({
    model: db.BehaviorGoal,
    allowedFilters: ['behaviorId'],
    req,
  });

  res.status(httpStatus.OK).send(Goals);
});
const createBehaviorGoal = catchAsync(async (req, res) => {
  const {  body } = req;
  const uuid = req.clinicUuid;

  const db = getModels(uuid);
  const Goal = await dbService.createOne({model:db.BehaviorGoal,reqParams:{...body,isActive: true , isDeleted: false}});


  res.status(httpStatus.CREATED).send(Goal);
});

module.exports = {
  getBehaviorGoal,
  createBehaviorGoal,
};
