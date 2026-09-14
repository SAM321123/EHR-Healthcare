const httpStatus = require('http-status');
const { encounterBillingService, dbService, encounterClaimBillingService } = require('../services');
const catchAsync = require('../utils/catchAsync');
const { getModels } = require('../utils/connection');
const { errorMessages } = require('../config/error');

const getEncounterClaimBilling = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const claimData = await dbService.getPaginated({
    model: db.PatientEncounterClaims,
    allowedFilters: ['encounterId'],
    searchFilter: [],
    req,
    include: [
      { model: db.PatientEncounters, as: 'encounterDetails' },
      { model: db.Patient, as: 'patientDetails' },
    ],
  });
  res.status(httpStatus.OK).send(claimData);
});

const getEncounterBillingByEncounterId = catchAsync(async (req, res) => {
  const { params } = req;
  const uuid = req.clinicUuid;
  const { encounterId } = params;

  if (!encounterId) {
    throw new Error(errorMessages.NOT_FOUND);
  }
  const db = getModels(uuid);
  const billingData = await dbService.getOne({
    model: db.PatientEncounterBilling,
    filter: { where: { encounterId } },
    id: params.encounterBillingId,
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
        attributes: ['id', 'name', 'description'],
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
  const billingData = await dbService.getOneById({
    model: db.PatientEncounterBilling,
    id: params.encounterBillingId,
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
        attributes: ['id', 'name', 'description'],
      },
    ],
  });
  res.status(httpStatus.OK).send(billingData);
});

const createEncounterClaimBilling = catchAsync(async (req, res) => {
  const { user, body } = req;
  const userId = user.id;
  const uuid = req.clinicUuid;
  const billingData = await encounterClaimBillingService.createEncounterClaimBilling({
    tenantId: uuid,
    body: { ...body, createdById: userId },
    user,
  });
  res.status(httpStatus.CREATED).send(billingData);
});

const updateEncounterClaimBilling = catchAsync(async (req, res) => {
  const { user, params, body } = req;
  const { encounterBillingId } = params || {};
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const oldData = await dbService.getOneById({
    model: db.PatientEncounterBilling,
    id: encounterBillingId,
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
        attributes: ['id', 'name', 'description', 'cptCode'],
      },
    ],
  });

  const billingData = await encounterClaimBillingService.updateEncounterClaimBilling({
    tenantId: uuid,
    encounterBillingId,
    updateParams: { ...body },
    user,
  });
  if (billingData && body?.reSubmit === true) {
    const reSubmitClaimEncounterBilling = await dbService.createOne({
      model: db.ReSubmitClaimEncounterBillingLog,
      reqParams: {
        encounterId: oldData.encounterId,
        patientId: oldData.patientId,
        encounterBillingId,
        primaryProviderId: oldData.primaryProviderId,
        referenceProviderId: oldData.referenceProviderId,
        insuranceId: oldData.insuranceId,
        visitDate: oldData.visitDate,
        locationId: oldData.locationId,
        procedureCodeType: oldData.procedureCodeType,
        subtotal: oldData.subtotal,
        total: oldData.total,
        tip: oldData.tip,
        insuranceSubmittedAmount: oldData.insuranceSubmittedAmount,
        previousBalance: oldData.previousBalance,
        copay: oldData.copay,
        billingType: oldData.billingType,
        comment: oldData.comment,
        encounterDiagnosis: oldData.encounterDiagnosis,
        encounterDiagnosisSnomeds: oldData.encounterDiagnosisSnomeds,
        encounterProcedureCodes: oldData.encounterProcedureCodes,
        createdById: user.id,
      },
    });
  }
  res.status(httpStatus.OK).send(billingData);
});

module.exports = {
  createEncounterClaimBilling,
  getEncounterBillingById,
  updateEncounterClaimBilling,
  getEncounterClaimBilling,
  getEncounterBillingByEncounterId,
};
