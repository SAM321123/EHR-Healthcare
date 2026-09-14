const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { dbService, emailService } = require('../services');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');
const { isUserExist: isTemplateExist } = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');

const getEmailTemplates = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const db = getModels(uuid);
  const emailTemplates = await dbService.getPaginated({
    model: db.EmailTemplate,
    req,
    allowedFilters: ['name'],
    searchFilter: ['name','subject'],
    include: [
      { model: db.GlobalType, as: 'emailType' },
      { model: db.GlobalType, as: 'appointmentType' },
    ],
  });
  res.status(httpStatus.OK).send(emailTemplates);
});
const getAllEmailTemplates = catchAsync(async (req, res) => {
    const uuid = req.clinicUuid;
    const masterDb = initializeModels(sequelize,true);
    // const db = getModels(uuid);
    console.log('getAllEmailTemplates called with clinicUuid:', uuid);
  const emailTemplates = await dbService.getAll({
    model: masterDb.AdminEmailTemplate,
    req,
  });
  res.status(httpStatus.OK).send(emailTemplates);
});
const createEmailTemplate = catchAsync(async (req, res) => {
  const {user , body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { emailTypeCode, typeCode } = body;
  const whereClause = { emailTypeCode, isDeleted: false };
  if (typeCode) {
    whereClause.typeCode = typeCode;
  }
  const existingEmailType = await isTemplateExist(db.EmailTemplate, { where: whereClause });
  if (existingEmailType) {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_TYPE_EXIST);
  }
  const emailTemplate = await dbService.createOne({model:db.EmailTemplate,reqParams:{...req.body,createdById:user.id}});
  res.status(httpStatus.CREATED).send(emailTemplate);
});

const updateEmailTemplate = catchAsync(async (req, res) => {
  const {user,body} =req || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const existingEmailTemplate = await isTemplateExist(db.EmailTemplate, {
    where: { id: req.params.templateId ,isDeleted: false}
  });
  
    if (body.emailTypeCode || body.typeCode || existingEmailTemplate.emailTypeCode || existingEmailTemplate.typeCode) {
    // Check if the emailTypeCode or typeCode is being updated
    if ((body.emailTypeCode && body.emailTypeCode !== existingEmailTemplate.emailTypeCode) || 
        (body.typeCode && body.typeCode !== existingEmailTemplate.typeCode)) {
      // Check for an existing record with the same emailTypeCode and typeCode combination
      const emailTypeExists = await isTemplateExist(db.EmailTemplate, {
        where: {
          emailTypeCode: body.emailTypeCode || existingEmailTemplate.emailTypeCode,
          typeCode: body.typeCode || existingEmailTemplate.typeCode,
          isDeleted: false
        }
      });

      if (emailTypeExists) {
        throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_TYPE_EXIST);
      }
    }
  }

  const updateParams = {id:req.params.templateId,...body,updatedById:user.id};
  if(body.isDeleted){
      updateParams.isDeletedById= user.id;
  }
const updatedEmaleTemplate = await dbService.updateById({model:db.EmailTemplate,reqParams:{...updateParams}});
res.status(httpStatus.OK).send(updatedEmaleTemplate);
});
const sendBirthdayMail = catchAsync(async (req, res) => {
  const {patientId} = req.body
  const uuid = req.clinicUuid;
  const db = getModels(uuid)
  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  })
  const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
  emailService.sendBirthdayMail(uuid , practiceSetting , {patient });
  res.send({message:'Mail Send'})
});

module.exports = { getEmailTemplates ,createEmailTemplate ,updateEmailTemplate ,sendBirthdayMail, getAllEmailTemplates};
