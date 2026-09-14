const Joi = require('joi');

const createEncountersBilling = {
  body: Joi.object().keys({
    patientId: Joi.number().integer().required(),
    primaryProviderId: Joi.number().integer().required(),
    referenceProviderId: Joi.number().integer(),
    visitDate: Joi.date().iso().required(),
    locationId: Joi.number().integer().allow(),
    procedureCodeType: Joi.string().allow(''),
    statusCode: Joi.string().allow(''),
    comment: Joi.string().allow(''),
    encounterDiagnosis: Joi.array(),
    encounterDiagnosisSnomeds: Joi.array(),
    encounterProcedureCodes: Joi.array(),
    encounterId: Joi.number().integer().required(),
    total: Joi.number(), 
    subTotal: Joi.number(),
    insuranceSubmittedAmount: Joi.number(),
    coPay: Joi.number(),
    tip: Joi.number().allow(null),
    previousBalance: Joi.number().allow(null),
    insuranceType: Joi.string().allow(''),
    billingType: Joi.string().required(),
    paymentDate: Joi.date().iso(),
    cash: Joi.number().allow(null),
    bankAmount: Joi.number().allow(null),
    balance: Joi.number().allow(null),
    prePaidCash: Joi.number().allow(null),
    cardAmount: Joi.number().allow(null),
    prepaidTyp: Joi.string().allow(''),
    bankTransferType: Joi.string(),
    cardType: Joi.string().allow(null),
    prePaidCash:Joi.number().integer().allow(null),
    prePaidType:Joi.string().allow(''),
    note:Joi.string().allow(''),
    cardAmount:Joi.number().integer().allow(null),
    cardNo:Joi.number().allow(null),
  }),
};


const getEncountersBilling = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    encounterId:Joi.number().integer(),
  }),
};

const getEncounterBillingById = {
  params: Joi.object().keys({
    encounterBillingId: Joi.number().integer(),
  }),
};

const getEncounterBillingByEncounterId = {
    params: Joi.object().keys({
      encounterId: Joi.number().integer(),
    }),
  };

const updateEncounterBilling = {
  params: Joi.object().keys({
    encounterBillingId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
        patientId: Joi.number().integer().required(),
        primaryProviderId:Joi.number().integer().required(),
        referenceProviderId:Joi.number().integer().allow(null),
        visitDate:Joi.date().iso().required(),
        locationId:Joi.number().integer().allow(null),
        statusCode:Joi.string().allow(null),
        comment:Joi.string().allow(''),
        encounterDiagnosis:Joi.array(),
        encounterDiagnosisSnomeds:Joi.array(),
        encounterProcedureCodes:Joi.array(),
        total:Joi.number(),
        subTotal:Joi.number(),
        insuranceSubmittedAmount:Joi.number().allow(null),
        coPay:Joi.number().allow(null),
        procedureCodeType:Joi.string().allow(''),
        tip:Joi.number().allow(null),
        previousBalance:Joi.number().integer().allow(null),
        encounterId:Joi.number().integer().required(),
        insuranceType:Joi.string().allow('').allow(null),
        billingType:Joi.string().required(),
        paymentDate:Joi.date().iso().allow(null),
        cash:Joi.number().integer().allow(null),
        prepaidTyp:Joi.string().allow(''),
        bankAmount:Joi.number().integer().allow(null),
        bankTransferType: Joi.string(),
        cardType: Joi.string().allow(null),
        balance:Joi.number().allow(null),
        prePaidCash:Joi.number().integer().allow(null),
        prePaidType:Joi.string().allow('').allow(null),
        note:Joi.string().allow('').allow(null),
        reSubmit:Joi.boolean().allow(null),
        cardAmount:Joi.number().integer().allow(null),
        cardNo:Joi.number().allow(null),
    })
    .min(1),
};

module.exports = {
  createEncountersBilling,
  getEncountersBilling,
  updateEncounterBilling,
  getEncounterBillingById,
  getEncounterBillingByEncounterId
};