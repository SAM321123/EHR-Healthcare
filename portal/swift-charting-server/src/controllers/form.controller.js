const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, formService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { sequelize } = require('../config/database');
const { initializeModels } = require('../models');
const { shareFromCategoryMap } = require('../utils');

const createForm = catchAsync(async (req, res) => {
  const { user, body } = req;
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { linkedConsentForms,encounterTypeCode, ...formBody } = body;

  const form = await dbService.createOne({
    model: db.Form,
    reqParams: { ...formBody, createdById: userId },
  });
  if (linkedConsentForms && linkedConsentForms.length > 0) {
    await form.setLinkedConsentForms(linkedConsentForms);
  }
  if (encounterTypeCode && encounterTypeCode.length > 0) {
    await form.setEncounterTypes(encounterTypeCode);
  }
  const  formType= await form.getFormType();

  const newFormData = await dbService.getOneById({model:db.Form,id:form.id, include: [
    { model: db.GlobalType, as: 'formCategory' },
    { model: db.GlobalType, as: 'formType' },
    { model: db.GlobalType, as: 'encounterTypes' },
    {
      model: db.Form,
      as: 'linkedConsentForms',
      include: [
        {
          model: db.Form,
          as: 'questionnaires',
          through: {
            attributes: [],
          },
        }
      ],
    },
  ],})
  await form.getEncounterTypes();
  await form.getLinkedConsentForms();

  res.status(httpStatus.CREATED).send(newFormData);
});

const getForms = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  
  const result = await dbService.getPaginated({
    model: db.Form,
    req,
    allowedFilters: ['formTypeCode', 'formCategoryCode'],
    searchFilter: ['name'],
    include: [
      { model: db.GlobalType, as: 'formCategory' },
      { model: db.GlobalType, as: 'formType' },
      { model: db.GlobalType, as: 'encounterTypes' },
      {
        model: db.Form,
        as: 'linkedConsentForms',
        include: [
          {
            model: db.Form,
            as: 'questionnaires',
            through: {
              attributes: [],
            },
          }
        ],
      },
    ],
  });

  res.status(httpStatus.OK).send(result);
});


const getFormById = catchAsync(async (req, res) => {
  const { formId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const form = await formService.getFormById(formId,{tenantId:uuid});
  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }
  res.status(httpStatus.OK).send(form);
});
const shareForm = catchAsync(async (req, res) => {
  const { formId } = req.params;
  const uuid = req.clinicUuid;
  const { user} = req;
  const masterDB = initializeModels(sequelize);

  let form = await formService.getFormById(formId,{tenantId:uuid});  
  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }
  form = form.get({plain:true})
  const {formTypeCode,createdById,updatedById  ,id, ...rest} = form
  const shareFromCategoryCode = shareFromCategoryMap[formTypeCode];
  const getSharedForm = await dbService.createOne({
     model: masterDB.Form,
     reqParams: { ...rest,formTypeCode, formCategoryCode: shareFromCategoryCode },
 
   });
  res.status(httpStatus.OK).send(getSharedForm);
});

const updateForm = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { formId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { linkedConsentForms,encounterTypeCode, ...formBody } = body;

  const existingForm = await dbService.getOneById({ model: db.Form, id: formId });
  if (!existingForm) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }

  const [,[updatedForm]] = await dbService.updateOne({
    model: db.Form,
    updateParams: { ...formBody, updatedById: userId },
    filter: { where: { id: formId } },
  });
  if (linkedConsentForms && linkedConsentForms.length > 0) {
    await updatedForm.setLinkedConsentForms(linkedConsentForms);
  }else {
    // Remove all associated linkedConsentForms if linkedConsentForms is empty
    await updatedForm.setLinkedConsentForms([]);
  }
  if (encounterTypeCode && encounterTypeCode.length > 0) {
    await updatedForm.setEncounterTypes(encounterTypeCode);
  }else {
    await updatedForm.setEncounterTypes([]);
  }
  const newFormData = await dbService.getOneById({model:db.Form,id:updatedForm.id, include: [
    { model: db.GlobalType, as: 'formCategory' },
    { model: db.GlobalType, as: 'formType' },
    { model: db.GlobalType, as: 'encounterTypes' },
    {
      model: db.Form,
      as: 'linkedConsentForms',
      include: [
        {
          model: db.Form,
          as: 'questionnaires',
          through: {
            attributes: [],
          },
        }
      ],
    },
  ],})
  res.status(httpStatus.OK).send(newFormData);
});


module.exports = {
  createForm,
  getFormById,
  updateForm,
  getForms,
  shareForm,
};
