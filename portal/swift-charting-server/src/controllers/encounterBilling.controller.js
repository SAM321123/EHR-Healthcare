const httpStatus = require('http-status');
const { encounterBillingService, dbService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');

const getEncounterBilling = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const billingData = await dbService.getPaginated({
    model: db.PatientEncounterBilling,
    allowedFilters: ['encounterId'],
    searchFilter: [],
    req,
    include: [
      { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
      { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
      {
        model: db.ProcedureCode,
        as: 'encounterProcedureCodes',
        through: {
          attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price'],
          as: 'addOnFields',
        },
        attributes: ['id', 'name', 'description','cptCode'],
      },
    ],
  });
  res.status(httpStatus.OK).send(billingData);
});

const getEncounterBillingByEncounterId = catchAsync(async (req, res) => {
  const {  params } = req;
  const uuid = req.clinicUuid;
  const {encounterId} = params;

  if(!encounterId){
    throw new Error(errorMessages.NOT_FOUND)
  }
  const db = getModels(uuid);
  const billingData = await dbService.getOne({
    model: db.PatientEncounterBilling,
    filter:{where:{encounterId}},
    id: params.encounterBillingId,
    include: [
      { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
      { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
      {
        model: db.ProcedureCode,
        as: 'encounterProcedureCodes',
        through: {
          attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price', 'serviceDate', 'discPer', 'discAmt',  'taxPer', 'taxAmt'],
          as: 'addOnFields',
        },
        attributes: ['id', 'name', 'description','cptCode'],
      },
    ],
  });
  res.status(httpStatus.OK).send(billingData);
});

const getEncounterBillingById = catchAsync(async (req, res) => {
  const { user, params } = req;
  const userId = user.id;
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const billingData =await  dbService.getOneById({
    model: db.PatientEncounterBilling,
    id: params.encounterBillingId,
    include: [
      { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
      { model: db.DiagnosisSnomedCt, as: 'encounterDiagnosisSnomeds' },
      {
        model: db.ProcedureCode,
        as: 'encounterProcedureCodes',
        through: {
          attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price', 'serviceDate'],
          as: 'addOnFields',
        },
        attributes: ['id', 'name', 'description','cptCode'],
      },
    ],
  });
  res.status(httpStatus.OK).send(billingData);
});

const createEncounterBilling = catchAsync(async (req, res) => {
  const { user, body } = req;
  const userId = user.id;
  const uuid = req.clinicUuid;
  const billingData = await encounterBillingService.createEncounterBilling({
    tenantId: uuid,
    body: { ...body, createdById: userId },
    user,
  });
  res.status(httpStatus.CREATED).send(billingData);
});

const updateEncounterBilling = catchAsync(async (req, res) => {
  const { user, params,body } = req;
  const { encounterBillingId } = params || {};
  const uuid = req.clinicUuid;
  const billingData = await encounterBillingService.updateEncounterBilling({
    tenantId: uuid,
    encounterBillingId,
    updateParams: { ...body },
    user,
  });
  res.status(httpStatus.OK).send(billingData);
});

module.exports = {
  createEncounterBilling,
  getEncounterBillingById,
  updateEncounterBilling,
  getEncounterBilling,
  getEncounterBillingByEncounterId,
};
