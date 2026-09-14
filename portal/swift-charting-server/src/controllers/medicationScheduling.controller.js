/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { dbService, patientMedicationService, patientMedicationHistroyService, staffService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');

const createMedicationSchedule = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { patientId} = body || {};
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  
  const patient = await dbService.getOneById({
    model: db.Patient,
    id: patientId,
  });
  if (!patient) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
  }
  if(!body?.repeatEvery){
    body.repeatEvery = 1;
  }

  const patientMedicationSchedule = await dbService.createOne({
    model: db.MedicationSchedule,
    reqParams: body,
  });
  res.status(httpStatus.CREATED).send(patientMedicationSchedule);
});

const getPatientMedicationSchedule = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const result = await dbService.getAll({
    model: db.MedicationSchedule,
    req,
    // otherOptions: {include: [
    //   {
    //     model: db.Patient,
    //     as: 'patient',
    //   },
    //   {
    //     model: db.PatientMedicationItems,
    //     as: 'items',
    //     include: [
    //       {
    //         model: db.GenericDrug,
    //         as: 'genericDrug',
    //       },
    //       {
    //         model: db.BrandNameDrug,
    //         as: 'brandNameDrug',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'doseForm',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'unit',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'route',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'frequency',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'duration',
    //       },
    //       {
    //         model: db.GlobalType,
    //         as: 'direction',
    //       },
    //       {
    //         model: db.PatientMedicationDiagnosis,
    //         as: 'diagnoses',
    //         include: [
    //           {
    //             model: db.DiagnosisIcd,
    //             as: 'icd',
    //           },
    //         ],
    //       },
    //     ],
    //   },
    // ],
  // }
  });

  res.status(httpStatus.OK).send(result);
});

const updatePatientMedicationSchedule = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { scheduleId } = params;

  const uuid = req.clinicUuid;
  const db = getModels(uuid);

  const { 
    endDate,
    repeatEvery,
    repeatType,
    repeatWeek,
    monthOnDay,
    monthWeek,
    monthWeekDay,
    isOnDay,
    timeSlots,
  } = body || {}

  let data = body;
  const existingPatientMedicationSchedule = await dbService.getOneById({
    model: db.MedicationSchedule,
    id: scheduleId,
  });
  if (!existingPatientMedicationSchedule) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Patient Medication Schedule not found');
  }

  const recuringSlots = {
    repeatEvery: repeatEvery || 1,
    repeatType: repeatType || '',
    repeatWeek: repeatWeek || [],
    monthOnDay: monthOnDay || '',
    monthWeek: monthWeek || [],
    monthWeekDay: monthWeekDay || [],
    isOnDay: isOnDay || false ,
    endDate,
    timeSlots,
  }

  const [, [updatedPatientMedicationSchedule]] = await dbService.updateOne({
    model: db.MedicationSchedule,
    updateParams: recuringSlots,
    filter: { where: { id: scheduleId } },
  });
  res.status(httpStatus.OK).send(updatedPatientMedicationSchedule);
});



module.exports = {
  createMedicationSchedule,
  getPatientMedicationSchedule,
//   getPatientMedicationById,
  updatePatientMedicationSchedule,
//   sharePatientMedication,
};
