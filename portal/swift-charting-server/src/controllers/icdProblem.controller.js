const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');


const getIcdProblem = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
  
    const db = getModels(uuid);
  
    const Problems = await dbService.getPaginated({
      model: db.IcdProblem,
      allowedFilters:['icdId'],
      req,
    });
  
    res.status(httpStatus.OK).send(Problems);
  });

  const createIcdProblem = catchAsync(async (req, res) => {
    const {  body } = req;
    const uuid = req.clinicUuid;
  
    const db = getModels(uuid);
    const Problem = await dbService.createOne({model:db.IcdProblem,reqParams:{...body,isActive: true , isDeleted: false}});

  
    res.status(httpStatus.CREATED).send(Problem);
  });
  
  
  module.exports = {
    getIcdProblem,
  };