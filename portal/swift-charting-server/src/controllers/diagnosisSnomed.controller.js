const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');

const getDiagnosisSnomed = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const result = await dbService.getPaginated({
      model: db.DiagnosisSnomedCt,
      req,
        allowedFilters: ['diagnosisProblemId'],
        searchFilter: ['name', 'description'],
        attributes:['id','name','description','diagnosisProblemId',],
    });
    res.status(httpStatus.OK).send(result);
  });
  

module.exports = {
    getDiagnosisSnomed,
};
