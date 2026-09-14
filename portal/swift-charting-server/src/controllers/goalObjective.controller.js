const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getGoalObjective = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;

  const db = getModels(uuid);

  const Objectives = await dbService.getPaginated({
    model: db.GoalObjective,
    allowedFilters: ['goalId'],
    req,
  });

  res.status(httpStatus.OK).send(Objectives);
});
const createGoalObjective = catchAsync(async (req, res) => {
  const {  body } = req;
  const uuid = req.clinicUuid;

  const db = getModels(uuid);
  const Objective = await dbService.createOne({model:db.GoalObjective,reqParams:{...body,isActive: true , isDeleted: false}});


  res.status(httpStatus.CREATED).send(Objective);
});

module.exports = {
  getGoalObjective,
  createGoalObjective,
};
