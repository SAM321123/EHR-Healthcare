const Joi = require('joi');

const createProcedureCode = {
  body: Joi.object().keys({
    name: Joi.string().required(),
    useForBillingCode: Joi.boolean(),
    cptCode: Joi.when('useForBillingCode', {
      is: true,
      then: Joi.string().trim().required(),
      otherwise: Joi.string().trim().allow(''),
    }),
    price: Joi.number().integer().required(),
    qty: Joi.number().integer().required(),
    modifier1: Joi.number().integer().required(),
    modifier2: Joi.number().integer().required(),
    modifier3: Joi.number().integer().required(),
    modifier4: Joi.number().integer().required(),
    description:Joi.string().allow(''),
  }),
};

const getProcedureCodeById = {
  params: Joi.object().keys({
    procedureCodeId: Joi.string(),
  }),
  query: Joi.object().keys({
    subscribeSocket: Joi.boolean(),
  }),
};

const getProcedureCodes = {
  query: Joi.object().keys({
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    role: Joi.string(),
    isActive: Joi.boolean().default(true),
  }),
};


const updateProcedureCode = {
  params: Joi.object().keys({
    procedureCodeId: Joi.required(),
  }),
  body: Joi.object()
    .keys({
        name: Joi.string(),
        useForBillingCode: Joi.boolean(),
        cptCode: Joi.when('useForBillingCode', {
          is: true,
          then: Joi.string().trim().required(),
          otherwise: Joi.string().trim().allow(''),
        }),
        price: Joi.number().integer(),
        qty: Joi.number().integer(),
        modifier1: Joi.number().integer(),
        modifier2: Joi.number().integer(),
        modifier3: Joi.number().integer(),
        modifier4: Joi.number().integer(),
        description:Joi.string().allow(''),
    })
    .min(1),
};

module.exports = {
  createProcedureCode,
  getProcedureCodes,
  updateProcedureCode,
  getProcedureCodeById,

};
