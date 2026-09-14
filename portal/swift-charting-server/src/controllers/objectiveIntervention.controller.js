const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getObjectiveIntervention = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;

  const db = getModels(uuid);

  const Interventions = await dbService.getPaginated({
    model: db.ObjectiveIntervention,
    allowedFilters: ['objectiveId'],
    req,
  });

  res.status(httpStatus.OK).send(Interventions);
});
const createObjectiveIntervention = catchAsync(async (req, res) => {
  const {  body } = req;
  const uuid = req.clinicUuid;

  const db = getModels(uuid);
  const Intervention = await dbService.createOne({model:db.ObjectiveIntervention,reqParams:{...body,isActive: true , isDeleted: false}});


  res.status(httpStatus.CREATED).send(Intervention);
});

module.exports = {
  getObjectiveIntervention,
  createObjectiveIntervention,
};
