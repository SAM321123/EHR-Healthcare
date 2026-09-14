/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const { isEmpty } = require('lodash');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');
const { default: slugify } = require('slugify');
const { capitalizeFirstLetterOfEachWord, mergeDataUpdates } = require('../utils');
const { uploadPatientDataService } = require('../services');


const createAllergies = catchAsync(async (req, res) => {
  const triggerFrom = `Patient's Allergy Creation`
  const { body } = req || {};
  const { patientId, allergy, reactionCode, severitiesCode, dateOfOnSet, comment, isActive = false,patientEncounterId } = body;

  const newReactions = [];
  const reactionCodeOnly =[]
  reactionCode.forEach(item=>{
    if(typeof item==='string'){
      newReactions.push(    {
        name: capitalizeFirstLetterOfEachWord(item),
        code: `${slugify(item,'_')}_rash_reaction`,
        description: '',
        globalCategoryTypeCode: 'allergy_reactions',
      });
    }else{
      reactionCodeOnly.push(item?.id)
    }
  })
  delete body.reactionCode;
  const { id: userId } = req.user || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  const allergies = await dbService.createOne({
    model: db.Allergies,
    reqParams: { patientId, allergy, severitiesCode, dateOfOnSet, comment, isActive, createdById: userId,patientEncounterId:patientEncounterId || null },
  });

  let newEntryReactions =[]
  if(newReactions?.length){
    const newAddedReactions = await dbService.createBulk({
      model: db.GlobalType,
      reqParams: [...newReactions],
    });
    newEntryReactions=newAddedReactions.map(item=>item.id)
  }
  await allergies.setReactions([...reactionCodeOnly,...newEntryReactions]);
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
      required: false
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
  const uploadPatientToMdtoolbox = uploadPatientDataService.uploadPatientToMdtoolbox(patientAllergyDiagnosisData ,req ,triggerFrom)
  res.status(httpStatus.CREATED).send(allergies);
});

const getAllergies = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const result = await dbService.getPaginated({
    model: db.Allergies,
    req,
    allowedFilters: ['allergy', 'patientId','patientEncounterId'],
    searchFilter: ['allergy'],
    include: [
      {
        model: db.GlobalType,
        as: 'reactions',
      },
      {
        model: db.GlobalType,
        as: 'severities',
      },
      {
        model: db.PatientEncounters,
        as: 'patientEncounter',
        include:[{ model: db.GlobalType, as: 'encounterType' },]
      },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getAllergiesById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { patientId } = req.params || {};
  const db = getModels(uuid);
  const result = await dbService.getOneById({ model: db.Patient, id: patientId });
  res.status(httpStatus.OK).send(result);
});

const updateAllergiesById = catchAsync(async (req, res) => { 
  const triggerFrom = `Patient's Allergy Updation`
  const { body = {}, user, params, clinicUuid: uuid } = req;

  const { reactionCode } = body;
  delete body.reactionCode;
  const { allergiesId } = params || {};

  const { id: userId } = user;
  const db = getModels(uuid);
  const allergies = await dbService.getOneById({
    model: db.Allergies,
    id: allergiesId,
  });
  if (!allergies) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }

  if (!isEmpty(body)) {
    const updateParams = { ...body, updateById: userId };
    if (body.isDeleted === true) {
      updateParams.deletedById = userId;
    }

    const result = await dbService.updateOne({
      model: db.Allergies,
      updateParams,
      filter: { where: { id: allergiesId } },
    });
  }
  if (reactionCode) {
    const newReactions = [];
    const reactionCodeOnly =[]
    reactionCode.forEach(item=>{
      if(typeof item==='string'){
        newReactions.push(    {
          name: capitalizeFirstLetterOfEachWord(item),
          code: `${slugify(item,'_')}_rash_reaction`,
          description: '',
          globalCategoryTypeCode: 'allergy_reactions',
        });
      }else{
        reactionCodeOnly.push(item?.id)
      }
    })
    console.log("🚀 ~ updateAllergiesById ~ newReactions:", newReactions)
    let newEntryReactions =[]
    if(newReactions?.length){
      const newAddedReactions = await dbService.createBulk({
        model: db.GlobalType,
        reqParams: [...newReactions],
      });
      newEntryReactions=newAddedReactions.map(item=>item.id)
    }
    await allergies.setReactions([...reactionCodeOnly,...newEntryReactions]);
  }
  const patientAllergyDiagnosisData = await dbService.getOneById({
    model: db.Patient,
    id: allergies.patientId,
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
  const uploadPatientToMdtoolbox = uploadPatientDataService.uploadPatientToMdtoolbox(patientAllergyDiagnosisData ,req ,triggerFrom)
  res.status(httpStatus.OK).send(allergies);
});
module.exports = {
  createAllergies,
  getAllergies,
  getAllergiesById,
  updateAllergiesById,
};
