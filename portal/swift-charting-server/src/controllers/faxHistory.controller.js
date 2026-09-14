const httpStatus = require('http-status');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const catchAsync = require('../utils/catchAsync');
const { faxHistoryService, dbService } = require('../services');
const { getModels } = require('../utils/connection');


const createFaxHistory = catchAsync(async (req, res) => {
    const {user,clinicUuid:tenantId} = req;
  const faxHistory = await faxHistoryService.createFaxHistory(req.body,{user,tenantId});
  res.status(httpStatus.CREATED).send(faxHistory);
});

const getFaxHistories = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const doc = await dbService.getPaginated({
    model: db.FaxHistory,
    req,
    allowedFilters: [],
    popOptions: 'faxContact,faxType',
    include:[{model:db.FaxContact,as:'faxContact'},{model:db.PatientForm,as:'patientForm'},{model:db.PatientMedication,as:'patientMedication'}]

  });
  res.status(httpStatus.OK).send(doc);
});

const getFaxHistory = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const doc = await dbService.getOneById({model:db.FaxHistory,id:req.params.faxHistoryId});
  if (!doc) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
  }
  res.status(httpStatus.OK).send(doc);
});

const updateFaxHistory = catchAsync(async (req, res) => {
    const {body,clinicUuid:uuid,user:{id:userId}={}} = req || {}
    const db = getModels(uuid);
    const updateParams = {...body,updatedById:userId,id:req.params.faxHistoryId};
    if(body.isDeleted){
        updateParams.deletedById = userId
    }
  const doc = await dbService.updateById({model:db.FamilyHistory,reqParams:updateParams});
  res.status(httpStatus.OK).send(doc);
});

module.exports = {
  createFaxHistory,
  getFaxHistories,
  getFaxHistory,
  updateFaxHistory,
};
