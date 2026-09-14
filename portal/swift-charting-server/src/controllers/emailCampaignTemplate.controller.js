const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');
const { isUserExist: isTemplateExist } = require('../services/user.service');
const ApiError = require('../utils/ApiError');

const getEmailCampaignTemplates = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const emailTemplates = await dbService.getPaginated({
    model: db.EmailCampaignTemplate,
    req,
    allowedFilters: ['name', 'subject'],
    searchFilter: ['name','subject'],
  });
  res.status(httpStatus.OK).send(emailTemplates);
});
const createEmailCampaignTemplate = catchAsync(async (req, res) => {
  const {user , body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const emailTemplate = await dbService.createOne({model:db.EmailCampaignTemplate,reqParams:{...body,createdById:user.id}});
  res.status(httpStatus.CREATED).send(emailTemplate);
});

const updateEmailCampaignTemplate = catchAsync(async (req, res) => {
  const {user,body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const updateParams = {id:req.params.templateId,...body,updatedById:user.id};
  if(body.isDeleted){
      updateParams.isDeletedById= user.id;
  }
const updatedEmaleTemplate = await dbService.updateById({model:db.EmailCampaignTemplate,reqParams:{...updateParams}});
res.status(httpStatus.OK).send(updatedEmaleTemplate);
});


module.exports = { getEmailCampaignTemplates ,createEmailCampaignTemplate ,updateEmailCampaignTemplate };
