const catchAsync = require('../utils/catchAsync');
const { dbService } = require('../services');
const httpStatus = require('http-status');
const { initializeModels } = require('../models');
const { sequelize } = require('../config/database');
const { getModels } = require('../utils/connection');

const getForms = catchAsync(async (req, res) => {
  const masterDB = initializeModels(sequelize);

  const sharedForms = await dbService.getPaginated({
    model: masterDB.Form,
    req,
    allowedFilters: ['name'],
    searchFilter: ['name'],
    include: [
      { model: masterDB.GlobalType, as: 'formCategory' },
      { model: masterDB.GlobalType, as: 'formType' },
    ],
  });
  res.status(httpStatus.OK).send(sharedForms);
});
const getFormById = catchAsync(async (req, res) => {
  const { formId } = req.params;
  const masterDB = initializeModels(sequelize);
  const form = await dbService.getOneById({
    model: masterDB.Form,
    id: formId,
    include: [
      { model: masterDB.GlobalType, as: 'formCategory' },
      { model: masterDB.GlobalType, as: 'formType' },
    ],
  });

  if (!form) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }
  res.status(httpStatus.OK).send(form);
});

const createForm = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { id: sharedFormId , formCategory , name : updateName  } = body;
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const masterDB = initializeModels(sequelize);
  // find shared form from master db
  let sharedForm = await dbService.getOneById({
    model: masterDB.Form,
    id: sharedFormId,
  });

  if (!sharedForm) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }
  sharedForm = sharedForm.get({plain:true})

  const { id , name , formCategoryCode , ...rest} = sharedForm
  const form = await dbService.createOne({
    model: db.Form,
    reqParams: { ...rest, formCategoryCode: formCategory.code, name: updateName , createdById: userId,updatedById:userId },
  });
  res.status(httpStatus.OK).send(form);
});
module.exports = { getForms, getFormById,createForm };
