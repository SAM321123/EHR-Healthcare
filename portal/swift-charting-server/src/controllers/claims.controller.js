const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { dbService } = require('../services');
const { getModels } = require('../utils/connection');
const { Op } = require('sequelize');

const getClaims = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const { searchText,claimStatus } = req?.query || {};
  let whereClause = {};
  let statusClause = {};
  if (searchText) {
    whereClause = {
      [Op.or]: [
        { firstName: { [Op.iLike]: `%${searchText}%` } },
        { lastName: { [Op.iLike]: `%${searchText}%` } },
        { middleName: { [Op.iLike]: `%${searchText}%` } },
      ],
    };
  }
  if(claimStatus){
    statusClause ={
      claimStatus
    }
  }
  const totalCount = await db.PatientEncounterClaims.count({
    where: {
      isDeleted: false,
      ...statusClause,
    },
    include: [{ model: db.Patient, as: 'patient', where: whereClause }],
  });
  const result = await dbService.getPaginated({
    model: db.PatientEncounterClaims,
    req,
    allowedFilters: [],
    searchFilter: [],
    addOnFilter: { ...statusClause },
    include: [
      { model: db.Patient, as: 'patient', where: whereClause ,include: [{model: db.GlobalType , as: 'sexAtBirth'},{model: db.Staff , as: 'primaryProvider'}]},
      { model: db.GlobalType, as: 'status' },
      {
        model: db.PatientEncounterBilling,
        as: 'encounterBilling',
        include: [
          { model: db.PatientEncounters, as: 'encounter' ,include:[{model: db.GlobalType , as: 'billingType'}]},
          { model: db.Insurance, as: 'insurance', include: [{model: db.PayerList , as: 'payerData'}, {model: db.GlobalType , as: 'insurancePolicy'}] },
          {
            model: db.ProcedureCode,
            as: 'encounterProcedureCodes',
            through: {
              attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price','serviceDate','discAmt','discPer','taxAmt','taxPer'],
              as: 'fields',
            },
            attributes: ['id', 'name', 'description', 'cptCode'],
          },
          { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
          { model: db.Staff, as: 'primaryProvider' }
        ],
      },
    ],
  });
  result.totalResults = totalCount,
  result.totalPages = Math.ceil(totalCount/ 10)
  res.status(httpStatus.OK).send(result);
});

const getClaimByEncounterId = catchAsync(async (req, res) => {
  const uuid = req.clinicUuid;
  const db = getModels(uuid);
  const {encounterId} = req.params;

  if(!encounterId){
    throw new Error(errorMessages.NOT_FOUND)
  }

  const result = await dbService.getOne({
    model: db.PatientEncounterClaims,
    filter: { where: {encounterId},  order: [['createdAt', 'DESC']]},
    include: [
      { model: db.Patient, as: 'patient' ,include: [{model: db.GlobalType , as: 'sexAtBirth'},{model: db.Staff , as: 'primaryProvider'}]},
      { model: db.GlobalType, as: 'status' },
      {
        model: db.PatientEncounterBilling,
        as: 'encounterBilling',
        include: [
          { model: db.PatientEncounters, as: 'encounter' ,include:[{model: db.GlobalType , as: 'billingType'}]},
          { model: db.Insurance, as: 'insurance', include: [{model: db.PayerList , as: 'payerData'}, {model: db.GlobalType , as: 'insurancePolicy'}] },
          {
            model: db.ProcedureCode,
            as: 'encounterProcedureCodes',
            through: {
              attributes: ['modifier1', 'modifier2', 'modifier3', 'modifier4', 'total', 'qty', 'price'],
              as: 'addOnFields',
            },
            attributes: ['id', 'name', 'description', 'cptCode'],
          },
          { model: db.DiagnosisIcd, as: 'encounterDiagnosis' },
          { model: db.Staff, as: 'primaryProvider' }
        ],
      },
    ],
  });
  res.status(httpStatus.OK).send(result);
});

module.exports = { getClaims, getClaimByEncounterId };
