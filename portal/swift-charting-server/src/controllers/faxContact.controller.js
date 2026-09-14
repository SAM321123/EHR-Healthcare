const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');

const getFaxContacts = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const doc = await dbService.getPaginated({
    model: db.FaxContact,
    req,
    allowedFilters: ['name'],
    searchFilter: ['name'],
  });
  res.status(httpStatus.OK).send(doc);
});

const getFaxContact = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const faxContact = await dbService.getOneById({model:db.FaxContact,id:req.params.faxContactId});
  if (!faxContact) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NOT_FOUND);
  }
  res.status(httpStatus.OK).send(faxContact);
});

const createFaxContact = catchAsync(async (req, res) => {
    const {user} =req || {};
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const faxContact = await dbService.createOne({model:db.FaxContact,reqParams:{...req.body,createdById:user.id}});
  res.status(httpStatus.CREATED).send(faxContact);
});

const updateFaxContact = catchAsync(async (req, res) => {
    const {user,body} =req || {};
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
    const updateParams = {id:req.params.faxContactId,...body,updatedById:user.id};
    if(body.isDeleted){
        updateParams.isDeletedById= user.id;
    }
  const faxContact = await dbService.updateById({model:db.FaxContact,reqParams:{...updateParams}});
  res.status(httpStatus.OK).send(faxContact);
});

module.exports = { getFaxContact, getFaxContacts, createFaxContact, updateFaxContact };
