const httpStatus = require('http-status');
const { pick } = require('lodash');
const { Op } = require('sequelize');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { uploadPatientDataService } = require('../services');

const createDiagnosis = catchAsync(async (req, res) => {
  const triggerFrom = `Patient's Diagnosis Creation`
  const { user, body } = req;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { patientId } = body || {};
  const userId = user.id;
  //   const userId = "123";

  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
});
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  const diagnosis = await dbService.createOne({
    model: db.Diagnosis,
    reqParams: { ...body, createdById: userId },
  });
  const patientAllergyDiagnosisData = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
    include: [{
      model: db.Allergies,
      as: 'allergies',
      where: {
        isActive: true,
        isDeleted:false,
      },
      required: false,
    },
    {
      model: db.Diagnosis,
      as: 'problems',
      where: {
        isActive: 1,
        isDeleted:false,
      },
      required: false,
      include: [{ model: db.DiagnosisIcd, as: 'ICD'},
      ]
    },
  ]
});
  const uploadPatientToMdtoolbox = await uploadPatientDataService.uploadPatientToMdtoolbox(patientAllergyDiagnosisData ,req , triggerFrom)
  res.status(httpStatus.CREATED).send(diagnosis);
});

const getDiagnosis = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText, sortBy } = req.query || {};
  let problemSortObj = [];
  let typeSortObj = [];
  if (sortBy) {
    const sortByArray = sortBy.split(':');
    if (sortByArray[0].includes('problem')) {
      const _sortByArray = sortByArray[0].split('.');
      problemSortObj = [db.DiagnosisProblem, _sortByArray[1], sortByArray[1] == '-1' ? 'DESC' : 'ASC'];
    }
    if (sortByArray[0].includes('problem')) {
      const _sortByArray = sortByArray[0].split('.');
      typeSortObj = [db.GlobalType, _sortByArray[1], sortByArray[1] == '-1' ? 'DESC' : 'ASC'];
    }
  }
  const where = {};
  if (searchText) {
    where.name = { [Op.iLike]: `%${searchText}%` };
  }
  const result = await dbService.getPaginated({
    model: db.Diagnosis,
    req,
    allowedFilters: ['patientId','patientEncounterId'],
    searchFilter: [],
    include: [
      { model: db.DiagnosisIcd, as: 'ICD',attributes:['id','name','description','diagnosisProblemId',] },
      { model: db.DiagnosisProblem, as: 'problem', where},
      { model: db.GlobalType, as: 'type' },
      { model: db.GlobalType, as: 'status' },
      { model: db.User, as: 'createdBy' },
      { model: db.User, as: 'updatedBy' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getDiagnosisById = catchAsync(async (req, res) => {
  const { diagnosisId } = req.params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const diagnosis = await dbService.getOneById({ model: db.Diagnosis, id: diagnosisId });
  if (!diagnosis) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Diagnosis not found');
  }
  res.status(httpStatus.OK).send(diagnosis);
});

const updateDiagnosis = catchAsync(async (req, res) => {
  const triggerFrom = `Patient's Diagnosis Updation`
  const { user, params, body } = req;
  const userId = user.id;
  const { diagnosisId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const existingDiagnosis = await dbService.getOneById({ model: db.Diagnosis, id: diagnosisId,include:[{ model: db.DiagnosisProblem, as: 'problem'}] });
  if (!existingDiagnosis) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Diagnosis not found');
  }
  

  const updateParams = { ...body, updateById: userId };

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }

  const [,[updatedDiagnosis]] = await dbService.updateOne({
    model: db.Diagnosis,
    updateParams,
    // updateParams: body,
    filter: { where: { id: diagnosisId } },
  });
  const patientAllergyDiagnosisData = await dbService.getOneById({
    model: db.Patient,
    id: existingDiagnosis.patientId,
    include: [{
      model: db.Allergies,
      as: 'allergies',
      where: {
        isActive: true,
        isDeleted:false,
      },
      required: false,
    },
    {
      model: db.Diagnosis,
      as: 'problems',
      where: {
        isActive: 1,
        isDeleted:false,
      },
      required: false,
      include: [{ model: db.DiagnosisIcd, as: 'ICD'},
      ]
    },
  ]
  });
  const uploadPatientToMdtoolbox = await uploadPatientDataService.uploadPatientToMdtoolbox(patientAllergyDiagnosisData ,req ,triggerFrom)
  res.status(httpStatus.OK).send(updatedDiagnosis);
});

// const deleteDiagnosis = catchAsync(async (req, res) => {
//   const { diagnosisId } = req.params;
//   const uuid = req.clinicUuid;
//   const db = getModels(uuid);

//   const deletedDiagnosis = await dbService.deleteOne({
//     model: db.Diagnosis,
//     filter: { where: { id: diagnosisId } },
//   });
//   if (!deletedDiagnosis) {
//     throw new ApiError(httpStatus.NOT_FOUND, 'Diagnosis not found');
//   }
//   res.status(httpStatus.OK).send(deletedDiagnosis);
// });

module.exports = {
  createDiagnosis,
  getDiagnosisById,
  updateDiagnosis,
  //   deleteDiagnosis,
  getDiagnosis,
};
