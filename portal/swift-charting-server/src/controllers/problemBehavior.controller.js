const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getProblemBehavior = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;

  const db = getModels(uuid);

  const Behaviors = await dbService.getPaginated({
    model: db.ProblemBehavior,
    allowedFilters: ['problemId'],
    req,
  });

  res.status(httpStatus.OK).send(Behaviors);
});

module.exports = {
  getProblemBehavior,
};
