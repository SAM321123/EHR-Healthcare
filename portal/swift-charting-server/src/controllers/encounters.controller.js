const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const httpStatus = require('http-status');
const { dbService, formService } = require('../services');
const ApiError = require('../utils/ApiError');
const { errorMessages } = require('../config/error');
const { isEmpty } = require('lodash');
const { Op } = require('sequelize');

const createEncounters = catchAsync(async (req, res) => {
  const { user, body } = req;
  const { allergies, labOrders, diagnosis, medications, vitals, dynamicForms, patientId, ...rest } = body || {};
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
  const createParams = { ...rest, patientId, createdById: userId };
  // if(rest?.signature){
  //   createParams.atDraft=false
  // }

  const encounter = await dbService.createOne({
    model: db.PatientEncounters,
    reqParams: createParams,
  });

  const patientEncounterId = encounter?.id;

  if (!isEmpty(allergies) && allergies.length > 0) {
    for (const allergy of allergies) {
      const isAllergyExists = await dbService.getOneById({
        model: db.Allergies,
        id: allergy,
      });

      if (!isAllergyExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }

      await dbService.updateOne({
        model: db.Allergies,
        updateParams: { patientEncounterId },
        filter: { where: { id: allergy } },
      });
    }
  }

  if (!isEmpty(vitals) && vitals.length > 0) {
    for (const vital of vitals) {
      const isVitalExists = await dbService.getOneById({
        model: db.Vitals,
        id: vital,
      });
      if (!isVitalExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.Vitals,
        updateParams: { patientEncounterId },
        filter: { where: { id: vital } },
      });
    }
  }

  if (!isEmpty(medications) && medications.length > 0) {
    for (const medication of medications) {
      const isMedicationExists = await dbService.getOneById({
        model: db.PatientMedication,
        id: medication,
      });
      if (!isMedicationExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.PatientMedication,
        updateParams: { patientEncounterId },
        filter: { where: { id: medication } },
      });
    }
  }

  if (!isEmpty(labOrders) && labOrders.length > 0) {
    for (const labOrder of labOrders) {
      const isLabOrderExists = await dbService.getOneById({
        model: db.LabsRadiology,
        id: labOrder,
      });
      if (!isLabOrderExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.LabsRadiology,
        updateParams: { patientEncounterId },
        filter: { where: { id: labOrder } },
      });
    }
  }

  if (!isEmpty(diagnosis) && diagnosis.length > 0) {
    for (const problem of diagnosis) {
      const isProblemExists = await dbService.getOneById({
        model: db.Diagnosis,
        id: problem,
      });
      if (!isProblemExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.Diagnosis,
        updateParams: { patientEncounterId },
        filter: { where: { id: problem } },
      });
    }
  }

  if (!isEmpty(dynamicForms)) {
    for (const key in dynamicForms) {
      const formId = parseInt(key, 10);
      const formData = await formService.getFormById(formId, { tenantId: uuid });
      if (!formData) {
        console.error(`Form ID ${formId} does not exist`);
        continue;
      }

      await dbService.createOne({
        model: db.PatientEncounterForm,
        reqParams: {
          formData: formData,
          responses: JSON.stringify(dynamicForms[key]),
          formId,
          patientEncounterId,
          createdById: userId,
        },
      });
    }
  }
  res.status(httpStatus.CREATED).send(encounter);
});

const getEncounterById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const encounter = await dbService.getOneById({
    model: db.PatientEncounters,
    id: req.params.encounterId,
    include: [
      { model: db.GlobalType, as: 'billingType', attributes: ['id', 'name'] },
      {
        model: db.Patient, as: 'patient',
        include: [{
          model: db.Insurance, as: 'insurance',
          attributes: ['payerId', 'insuranceType'],
          include: [{
            model: db.PayerList, as: 'payerData',
            attributes: ['payerName'],
          }]
        }]
      },
      { model: db.PatientEncounterForm, as: 'patientEncounterForms' },
      { model: db.GlobalType, as: 'encounterType', attributes: ['id', 'name'] },
      { model: db.Staff, as: 'assignedTo', include: [{ model: db.GlobalType, as: 'title', attributes: ['name', 'code', 'id'] }], attributes: ['id', 'firstName', 'lastName'] },
      {
        model: db.Allergies,
        as: 'Allergies',
        include: [
          {
            model: db.GlobalType,
            as: 'reactions',
            attributes: ['id', 'name']
          },
          {
            model: db.GlobalType,
            as: 'severities',
            attributes: ['id', 'name']
          },
        ],
      },
      {
        model: db.Diagnosis,
        as: 'Diagnosis',
        include: [
          { model: db.DiagnosisIcd, as: 'ICD', attributes: ['id', 'name', 'description', 'diagnosisProblemId'] },
          { model: db.DiagnosisProblem, as: 'problem', },
          { model: db.GlobalType, as: 'type', attributes: ['id', 'name'] },
          { model: db.GlobalType, as: 'status', attributes: ['id', 'name'] },
          { model: db.User, as: 'createdBy' },
          { model: db.User, as: 'updatedBy' },
        ],
      },
      {
        model: db.PatientMedication,
        as: 'Medications',
        include: [
          {
            model: db.Patient,
            as: 'patient',
          },
          {
            model: db.Staff,
            as: 'prescriber',
          },
          {
            model: db.PatientMedicationItems,
            as: 'items',
            include: [
              {
                model: db.GlobalType,
                as: 'doseForm',
                attributes: ['id', 'name']
              },
              {
                model: db.GlobalType,
                as: 'unit',
                attributes: ['id', 'name']
              },
              {
                model: db.GlobalType,
                as: 'route',
                attributes: ['id', 'name']
              },
              {
                model: db.GlobalType,
                as: 'frequency',
                attributes: ['id', 'name']
              },
              {
                model: db.GlobalType,
                as: 'duration',
                attributes: ['id', 'name']
              },
              {
                model: db.GlobalType,
                as: 'direction',
                attributes: ['id', 'name']
              },
              {
                model: db.PatientMedicationDiagnosis,
                as: 'diagnoses',
                include: [
                  {
                    model: db.DiagnosisIcd,
                    as: 'icd',
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        model: db.LabsRadiology,
        as: 'LabRadiologies',
        include: [
          { model: db.Patient, as: 'patient' },
          { model: db.Staff, as: 'provider' },
          { model: db.DiagnosisIcd, as: 'diagnosisIcd' },
          { model: db.Diagnosis, as: 'patientDiagnosis' },
          { model: db.LaboratoryTest, as: 'laboratoryTests' },
          { model: db.TestingLab, as: 'testingLabs' },
          { model: db.GlobalType, as: 'status', attributes: ['id', 'name'] },
        ],
      },
      { model: db.Vitals, as: 'Vitals' },
      // {
      //   model: db.PatientEncounterBilling,
      //   as: 'billing',
      //   include: [
      //     { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
      //     { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
      //     {
      //       model: db.ProcedureCode,
      //       as: 'encounterProcedureCodes',
      //       through: {
      //         attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price'],
      //         as: 'addOnFields'
      //       },
      //       attributes:['id','name','description']

      //     },
      //   ],
      // },
    ],
  });
  res.status(httpStatus.OK).send(encounter);
});

const getEncounters = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  console.log("🚀 ~ uuid:", uuid)
  const db = getModels(uuid);
  const { searchText, practitionerId, patientId } = req?.query || {};

  let whereClause = {}
  let whereEncounterClause = {};
  let countWhereClause = {}
  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  if (practitionerId) {
    whereEncounterClause = { assignedToId: practitionerId };
  }
  if (patientId) {
    countWhereClause = { patientId: patientId };
  }
  // filter;
  const totalCount = await db.PatientEncounters.count({
    where: {
      ...whereEncounterClause, ...countWhereClause,
      isDeleted: false,
    },
    include: [{ model: db.Patient, as: 'patient', include: [{ model: db.GlobalType, as: 'title' }], where: whereClause },]
  });
  const result = await dbService.getPaginated({
    model: db.PatientEncounters,
    req,
    allowedFilters: ['patientId', 'atDraft', 'encounterTypeCode'],
    addOnFilter: whereEncounterClause,
    include: [
      { model: db.Patient, as: 'patient', include: [{ model: db.GlobalType, as: 'title' }], where: whereClause },
      { model: db.Staff, as: 'assignedTo' },
      { model: db.GlobalType, as: 'encounterType' },
      { model: db.User, as: 'createdBy' },
      { model: db.User, as: 'updatedBy' },
      {
        model: db.EncounterNote, as: 'notes', 
        separate: true, // 👈 important
        order: [['createdAt', 'ASC']],
        include: [
          {
            model: db.User, as: 'createdBy',
            include: [
              {
                model: db.Role,
                as: 'roles',
                attributes: ['id', 'name', 'code'],
                through: { attributes: [] },
              },
            ],
          }
        ]
      },
    ],
  });
  result.totalResults = totalCount,
    result.totalPages = Math.ceil(totalCount / 10)
  res.status(httpStatus.OK).send(result);
});

const updateEncounter = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const userId = user.id;
  const { encounterId } = params;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  let { allergies, labOrders, diagnosis, medications, vitals, dynamicForms, ...rest } = body || {};
  const { selectedForms, signature } = rest || {};
  const existingEncounters = await dbService.getOneById({
    model: db.PatientEncounters,
    id: encounterId,
  });
  if (!existingEncounters) {
    throw new ApiError(httpStatus.NOT_FOUND, errorMessages._NOT_FOUND(`Encounters`));
  }



  const updateParams = { ...rest, updatedById: userId };
  // if(signature){
  //   updateParams.atDraft=false
  // }

  if (!selectedForms?.staticForms?.soapForm) {
    updateParams.soapForm = null;
  }

  if (body.hasOwnProperty('isDeleted')) {
    updateParams.deletedById = userId;
  }

  const [, [updatedEncounters]] = await dbService.updateOne({
    model: db.PatientEncounters,
    updateParams,
    filter: { where: { id: encounterId } },
  });

  if (!isEmpty(allergies) && allergies.length > 0) {
    for (const allergy of allergies) {
      const isAllergyExists = await dbService.getOneById({
        model: db.Allergies,
        id: allergy,
      });

      if (!isAllergyExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }

      await dbService.updateOne({
        model: db.Allergies,
        updateParams: { patientEncounterId: encounterId },
        filter: { where: { id: allergy } },
      });
    }
  }

  if (!isEmpty(vitals) && vitals.length > 0) {
    for (const vital of vitals) {
      const isVitalExists = await dbService.getOneById({
        model: db.Vitals,
        id: vital,
      });
      if (!isVitalExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.Vitals,
        updateParams: { patientEncounterId: encounterId },
        filter: { where: { id: vital } },
      });
    }
  }

  if (!isEmpty(medications) && medications.length > 0) {
    for (const medication of medications) {
      const isMedicationExists = await dbService.getOneById({
        model: db.PatientMedication,
        id: medication,
      });
      if (!isMedicationExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.PatientMedication,
        updateParams: { patientEncounterId: encounterId },
        filter: { where: { id: medication } },
      });
    }
  }

  if (!isEmpty(labOrders) && labOrders.length > 0) {
    for (const labOrder of labOrders) {
      const isLabOrderExists = await dbService.getOneById({
        model: db.LabsRadiology,
        id: labOrder,
      });
      if (!isLabOrderExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.LabsRadiology,
        updateParams: { patientEncounterId: encounterId },
        filter: { where: { id: labOrder } },
      });
    }
  }

  if (!isEmpty(diagnosis) && diagnosis.length > 0) {
    for (const problem of diagnosis) {
      const isProblemExists = await dbService.getOneById({
        model: db.Diagnosis,
        id: problem,
      });
      if (!isProblemExists) {
        throw new ApiError(httpStatus.NOT_FOUND, errorMessages.NO_RECORD_FOUND);
      }
      await dbService.updateOne({
        model: db.Diagnosis,
        updateParams: { patientEncounterId: encounterId },
        filter: { where: { id: problem } },
      });
    }
  }
  try {
    await dbService.deleteMany({ model: db.PatientEncounterForm, filter: { where: { patientEncounterId: encounterId } } });
  } catch (err) {
    console.log('🚀 ~ updateEncounter ~ err:', err);
  }
  if (!isEmpty(dynamicForms)) {
    for (const key in dynamicForms) {
      if (selectedForms?.dynamicForms?.[key]) {
        const formId = parseInt(key, 10);
        const formData = await formService.getFormById(formId, { tenantId: uuid });
        if (!formData) {
          console.error(`Form ID ${formId} does not exist`);
          continue;
        }

        await dbService.createOne({
          model: db.PatientEncounterForm,
          reqParams: {
            formData: formData,
            responses: dynamicForms[key] === 'string' ? dynamicForms[key] : JSON.stringify(dynamicForms[key]),
            formId,
            patientEncounterId: encounterId,
            createdById: userId,
          },
        });
      }
    }
  }
  res.status(httpStatus.OK).send(updatedEncounters);
});

const getEncounterBilling = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const patientEncounterBillingId = req.params.billingId;
  const result = await dbService.getOneById({
    model: db.PatientEncounterBilling,
    id: patientEncounterBillingId,
    include: [
      { model: db.Patient, as: 'patient' },
      { model: db.Staff, as: 'primaryProvider' },
      { model: db.Staff, as: 'referenceProvider' },
      { model: db.DiagnosisIcd, as: 'encounterDiagnosisIcd' },
      { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomedId' },
      { model: db.ProcedureCode, as: 'encounterProcedureCodeId' },
      { model: db.PracticeLocation, as: 'location' },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

const getEncounterInfoById = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const encounter = await dbService.getOneById({
    model: db.PatientEncounters,
    id: req.params.encounterId,
    include: [
      {
        model: db.GlobalType,
        as: 'billingType',
        attributes: ['id', 'name']
      },
      {
        model: db.Patient,
        as: 'patient'
      },
      // { model: db.PatientEncounterForm, as: 'patientEncounterForms' },
      {
        model: db.GlobalType,
        as: 'encounterType',
        attributes: ['id', 'name']
      },
      {
        model: db.Staff,
        as: 'assignedTo',
        include: [{
          model: db.GlobalType,
          as: 'title',
          attributes: ['name', 'code', 'id']
        }],
        attributes: ['id', 'firstName', 'lastName']
      },
      {
        model: db.PatientEncounterBilling,
        as: 'billing',
        include: [
          { model: db.PatientEncounterClaims, as: 'claims', attributes: ['claimStatus'] },
          { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
          { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
          {
            model: db.ProcedureCode,
            as: 'encounterProcedureCodes',
            through: {
              attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price', 'serviceDate', 'discPer', 'discAmt', 'taxPer', 'taxAmt'],
              as: 'addOnFields'
            },
            attributes: ['id', 'name', 'description', 'cptCode']

          },
          {
            model: db.Staff,
            as: 'primaryProvider',
            include: [{
              model: db.GlobalType,
              as: 'title',
              attributes: ['name', 'code', 'id']
            }],
            attributes: ['id', 'firstName', 'lastName']
          },
          {
            model: db.Staff,
            as: 'referenceProvider',
            include: [{
              model: db.GlobalType,
              as: 'title',
              attributes: ['name', 'code', 'id']
            }],
            attributes: ['id', 'firstName', 'lastName']
          },
        ],
      },
    ],
  });
  res.status(httpStatus.OK).send(encounter);
});


module.exports = {
  createEncounters,
  getEncounters,
  updateEncounter,
  getEncounterById,
  getEncounterInfoById,
  getEncounterBilling,
};
