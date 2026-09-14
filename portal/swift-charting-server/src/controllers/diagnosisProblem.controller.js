const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getDiagnosisProblems = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.DiagnosisProblem,
    req,
    allowedFilters: [],
    searchFilter: ['name'],
  });
  res.status(httpStatus.OK).send(result);
});

module.exports = {
  getDiagnosisProblems,
};
