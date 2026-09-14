const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const getDiagnosisIcd = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const result = await dbService.getPaginated({
      model: db.DiagnosisIcd,
      req,
        allowedFilters: ['diagnosisProblemId'],
        searchFilter: ['name', 'description'],
        attributes:['id','name','description','diagnosisProblemId',],
    });
    res.status(httpStatus.OK).send(result);
  });
  

module.exports = {
    getDiagnosisIcd,
};
