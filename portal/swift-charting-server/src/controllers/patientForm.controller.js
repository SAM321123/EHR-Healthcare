const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, patientFormService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Sequelize } = require('sequelize');

const createPatientForm = catchAsync(async (req, res) => {
  const { user, body } = req;
  const {formId , ...rest} = body
  const uuid = req.clinicUuid;
  const patientForms =[]
  for(const id of formId ){
   const patientForm = await patientFormService.createPatientForm({formId: id ,...rest}, { user, tenantId: uuid });
   patientForms.push(patientForm)
  }
  res.status(httpStatus.CREATED).send(patientForms);
});

const getPatientForms = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { formTypeCode } = req.query || {};
  let whereClause = {isDeleted: false, isLinkedForm: false};
  if(formTypeCode){
    whereClause = { 'formData.formTypeCode': formTypeCode }
  }
  const result = await dbService.getPaginated({
    model: db.PatientForm,
    req,
    allowedFilters: ['patientId'],
    searchFilter: [],
    include: [
      { model: db.Form, as: 'form' },
      { model: db.Staff, as: 'practitioner' },
    ],
    addOnFilter: whereClause,
    // addOnFilter: {
    //   'formData.formTypeCode': formTypeCode,
    // },
  });
  res.status(httpStatus.OK).send(result);
});

const getPatientFormById = catchAsync(async (req, res) => {
  const { patientFormId } = req.params;
  const uuid = req.clinicUuid;
  const patientForm = await patientFormService.getPatientFormById(patientFormId,{tenantId:uuid}) ;
  if (!patientForm) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Patient form`));
  }
  res.status(httpStatus.OK).send(patientForm);
});

const getPublicPatientFormById = catchAsync(async (req, res) => {
  const { patientFormId } = req.params;
  const uuid = req.clinicUuid;
  const patientForm = await patientFormService.getPublicPatientFormById(patientFormId, { tenantId: uuid });

  if (!patientForm) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Patient form`));
  }

  res.status(httpStatus.OK).send(patientForm);
});

const updatePatientForm = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { patientFormId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingForm = await dbService.getOneById({ model: db.Form, id: patientFormId });
  if (!existingForm) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Form`));
  }

  const updatedForm = await dbService.updateOne({
    model: db.Form,
    updateParams: { ...body, updatedById: userId },
    filter: { where: { id: formId } },
  });
  res.status(httpStatus.OK).send(updatedForm);
});

const shareNoteTemplate = catchAsync(async (req, res) => {
  const {user,clinicUuid:uuid}= req || {}
  const patientForm = await patientFormService.shareNoteTemplate(req.params.patientFormId, req.body, {user,tenantId:uuid});
  res.status(httpStatus.OK).send(patientForm);
});
module.exports = {
  createPatientForm,
  getPatientFormById,
  getPublicPatientFormById,
  updatePatientForm,
  getPatientForms,
  shareNoteTemplate,
};
