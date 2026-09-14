/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const randomPassword = require('../utils/randomPassword');
const { dbService,emailService } = require('../services');
const { isUserExist } = require('../services/user.service');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { Op } = require('sequelize');
const { getPracticeSettingsConfig } = require('../services/practiceSetting.service');
const { roles } = require('../config/roles');
const { uploadPatientDataService, tokenService } = require('../services');
const { tokenTypes } = require('../config/tokens');

const getThreeMonthsAgoDate = () => {
  const date = new Date();
  date.setMonth(date.getMonth() - 3);
  return date;
};

const createPatient = catchAsync(async (req, res) => {
  const triggerFrom = 'Patient Creation'
  const { email, firstName, middleName, lastName, file: { id: fileId = null } = {} } = req.body || {};
  const { tenantId, id: userId } = req.user || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const password = randomPassword();
  let user = await isUserExist(db.User, { where: { email },include:[{model:db.Role,as:'roles'}] });
  const patientRole = await dbService.getOne({model:db.Role,filter:{where:{code:roles.PATIENT}}});

  if(!user){
      user = await dbService.createOne({
      model: db.User,
      reqParams: {
        email,
        firstName,
        middleName,
        lastName,
        tenantId,
        password,
        createdById: userId,
        updatedById: userId,
        fileId,
      },
    });
    await user.addRole(patientRole.id);
  } else if (
    user &&
    user.roles &&
    user.roles.includes(item=>item.code===roles.PATIENT) 
  ) {
    await user.addRole(patientRole.id);
  }else {
    throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_EXISTS);
  }
  if(req.body.sexAtBirthCode !== 'gender_at_birth_other'){
    req.body.otherSexAtBirth = null
  }
  if(req.body.genderIdentityCode !== 'another_gender_identity'){
    req.body.anotherGenderIdentity = null
  }
  if(req.body.sexualOrientationCode !== 'another_orientation_not_listed'){
    req.body.anotherOrientation = null
  }
  if(req.body.raceCode !== 'unknown'){
    req.body.raceUnknown = null
  }
  if(req.body.titleCode !== 'name_prefixes_other'){
    req.body.otherTitle = null
  }
  if(req.body.titleCode === 'name_prefixes_other' && !req.body.otherTitle){
    req.body.titleCode = null
  }
  
  const patient = await dbService.createOne({
    model: db.Patient,
    reqParams: { ...req.body,fileId, userId: user.id, createdById: userId },
  });
  const practiceSetting = await getPracticeSettingsConfig({ tenantId: uuid });
  // // upload patient data to md toolbox
  if(patient){
    //////////////////////generate password token/////////////
    const { generatePasswordToken,expires } = await tokenService.generatePasswordToken(user);
    await db.Token.create({
      token: generatePasswordToken,
      userId: user.id,
      expires,
      type: tokenTypes.GENERATE_PASSWORD,
    });
   emailService.sendWelcomeEmailToPatient(uuid , practiceSetting , {patient ,user : {userId:userId}, token: generatePasswordToken }, password);
  }
  const uploadPatientToMdtoolbox =  uploadPatientDataService.uploadPatientToMdtoolbox(patient ,req, triggerFrom )
  res.status(httpStatus.CREATED).send(patient);
});

const getPaitents = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { patientSegment } = req.query || {};
  const db = getModels(uuid);
  const addOnFilter = {};

  if (patientSegment === 'new_patients') {
    addOnFilter.createdAt = {
      [Op.gte]: getThreeMonthsAgoDate(),
    };
  }

  if (patientSegment === 'active_last_3_months') {
    const activeSince = getThreeMonthsAgoDate();
    const patientEmails = (
      await db.LoginLogs.findAll({
        attributes: ['email'],
        where: {
          status: 'Success',
          loginTime: {
            [Op.gte]: activeSince,
          },
          email: {
            [Op.ne]: null,
          },
        },
        group: ['email'],
        raw: true,
      })
    )
      .map((item) => item.email)
      .filter(Boolean);

    addOnFilter.email = patientEmails.length
      ? { [Op.in]: patientEmails }
      : { [Op.in]: ['__no_matching_patient__'] };
  }

  const result = await dbService.getPaginated({
    model: db.Patient,
    req,
    allowedFilters: ['firstName', 'lastName', 'middleName','dob'],
    addOnFilter,
    searchFilter: ['firstName', 'lastName', 'middleName',{field:'dob',type:'date'}, 'email' ],
    include: [
      {
        model: db.User,
        as: 'user',
      },
      { model: db.File, as: 'file' },
      { model: db.Staff, as: 'primaryProvider' ,include:[{ model: db.GlobalType, as: 'title' },]},
      { model: db.GlobalType, as: 'sexAtBirth' },
      { model: db.GlobalType, as: 'genderIdentity' },
      { model: db.GlobalType, as: 'title' },

      {
        model: db.Diagnosis,
        as: 'problems',
        where: {
          isDeleted: false,
        },
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'ICD',
          },
        ],
        required: false,
      },
      {
        model: db.MdToolbox,
        as: 'mdToolboxData',
        order: [['createdAt', 'DESC']], 
        limit: 1, 

      },
      {
        model: db.PatientEncounters,
        as: 'encounters',
        where: {
          isDeleted: false,
        },
        required: false,
      }
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getPatientById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const { patientId } = req.params || {};
  const {subscribeSocket} = req.query || {}
  const db = getModels(uuid);
  const result = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
    include: [
      { model: db.File, as: 'file' },
      { model: db.GlobalType, as: 'sexAtBirth' },
      { model: db.GlobalType, as: 'genderIdentity' },
      { model: db.Allergies, as: 'allergies', required: false },
      { model: db.GlobalType, as: 'title' },
      {
        model: db.PatientMedication,
        as: 'medications',
        where: {
          isDeleted: false,
        },
        include:[{
          model: db.PatientMedicationItems,
          as: 'items',
        }],
        required: false,
      },
      {
        model: db.Diagnosis,
        as: 'problems',
        where: {
          isDeleted: false,
        },
        include: [
          {
            model: db.DiagnosisIcd,
            as: 'ICD',
          },
        ],
        required: false,
      },
      {
        model: db.Insurance,
        as: 'insurance',
        where: {
          isDeleted: false,
        },
        required: false,
      },
      {
        model: db.FamilyHistory,
        as: 'familyHistories',
        where: {
          isDeleted: false,
        },
        required: false,
        include: [
          {
            model: db.GlobalType,
            as: 'condition',
          },
        ],
      },
      {
        model: db.SocialHistory,
        as: 'socialHistories',
        where: {
          isDeleted: false,
        },
        required: false,
        include: [
          {
            model: db.GlobalType,
            as: 'socialHistory',
          },
        ],
      },
      {
        model: db.Appointment,
        as: 'appointments',
        where: {
          isDeleted: false,
        },
        required: false,
        include: [
          {
            model: db.Staff,
            as: 'practitioner',
            include:[{ model: db.GlobalType, as: 'title' },]
          },
        ],
      },
      {
        model: db.LabsRadiology,
        as: 'labsRadiologies',
        where: {
          isDeleted: false,
        },
        required: false,
        include: [
          {
            model: db.Patient,
            as: 'patient',
          },
          {
            model: db.LaboratoryTest,
            as: 'laboratoryTests',
          },
          {
            model: db.PracticeLocation,
            as: 'sendingFacility',
          },
          { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
        ],
      },
      {
        model: db.PatientEncounters,
        as: 'encounters',
        where: {
          isDeleted: false,
        },
        required: false,
        include:[{model:db.GlobalType,as:'encounterType'}]
      },
      {
        model: db.MdToolbox,
        as: 'mdToolboxData',
        order: [['createdAt', 'DESC']], 
        limit: 1, 
      },
    ],
    order:[[{model:db.Allergies,as:'allergies'},'id','DESC']],
    tenantId:uuid,
    subscribeSocket
  });
  res.status(httpStatus.OK).send(result);
});

const updatePatient = catchAsync(async (req, res) => {
  const triggerFrom = 'Patient Updation'
  const { body = {}, user, params, clinicUuid: uuid } = req;
  const { patientId } = params || {};
  const { id: userId } = user;
  const db = getModels(uuid);
  const { email, isActive, file ,twoFaEnable } = body || {};
  const { id: fileId = null } = file || {};
  delete body.file;
  if (email) {
    const existingUser = await isUserExist(db.User, { where: { email } });
    if (existingUser) {
      throw new ApiError(httpStatus.CONFLICT, errorMessages.EMAIL_EXISTS);
    }
  }

    const patient = await dbService.getOneById({ model: db.Patient, id: patientId});

    const updateParams = { ...body, ...(file ? { fileId } : {}), updateById: userId };
    await dbService.updateOne({
      model: db.User,
      updateParams: { ...body, updateById: userId },
      filter: { where: { id: patient.userId } },
    });

  if (body.isDeleted === true) {
    updateParams.deletedById = userId;
  }
  if(body.sexAtBirthCode !== 'gender_at_birth_other'){
    updateParams.otherSexAtBirth = null
  }
  if(body.genderIdentityCode !== 'another_gender_identity'){
    updateParams.anotherGenderIdentity = null
  }
  if(body.sexualOrientationCode !== 'another_orientation_not_listed'){
    updateParams.anotherOrientation = null
  }
  if(body.raceCode !== 'unknown'){
    updateParams.raceUnknown = null
  }
  if(body.titleCode !== 'name_prefixes_other'){
    updateParams.otherTitle = null
  }
  if(body.titleCode === 'name_prefixes_other' || patient.titleCode === 'name_prefixes_other' ){
    if(!body.otherTitle || patient.otherTitle ){
    updateParams.titleCode = null
    }
  }
  if (body.hasOwnProperty('twoFaEnable')) {
      const twoFaToggle = await dbService.updateOne({
        model: db.User,
        updateParams: { twoFaEnable, updateById: userId },
        filter: { where: { id: patient.userId  } },
      });
      if(twoFaToggle){
        //mail send 
         await emailService.sendTwoFaToggleEmail({
        uuid,
        email: patient.email,
        twoFaEnable
      })
      }
    }
  const result = await dbService.updateOne({
    model: db.Patient,
    updateParams,
    filter: { where: { id: patientId } },
  });
  const updatedPatient = await dbService.getOneById({ model: db.Patient, id: patientId, include: [{
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
  const uploadPatientToMdtoolbox = uploadPatientDataService.uploadPatientToMdtoolbox( updatedPatient ,req ,triggerFrom)
  res.status(httpStatus.OK).send(result);
});

const getPatientsCount = catchAsync(async (req, res) => {
  const { clinicUuid: uuid } = req;
  const db = getModels(uuid);
  const { fromDate, toDate } = req.query || {};
  const filter = { isDeleted: false };
  if (fromDate && toDate) {
    filter.createdAt = { [Op.between]: [new Date(`${fromDate}T00:00:00.000Z`), new Date(`${toDate}T23:59:59.999Z`)] };
  }
  const docs = await dbService.getCounts({ model: db.Patient, filter: { where: filter } });
  res.status(httpStatus.OK).send({ count: docs });
});
module.exports = {
  createPatient,
  getPaitents,
  getPatientById,
  updatePatient,
  getPatientsCount,
};
