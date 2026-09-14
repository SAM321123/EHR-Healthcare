const Joi = require('joi');

const createInvoice = {
  body: Joi.object().keys({
    patientId: Joi.number().integer().required(),
    encounterId: Joi.number().integer().required(),
    payInvoiceInFull: Joi.bool(),
    payCopay: Joi.bool(),
    payNonCoveredServices: Joi.bool(),
    subTotal:Joi.number(),
    due:Joi.number().integer(),
    grandTotal:Joi.number().integer(),
    totalDiscount:Joi.number(),
    status: Joi.string().allow(null),
    comment:Joi.string(),
    refrenceId:Joi.string(),
    paymentType:Joi.string(),
    paymentAmount:Joi.number(),
    paymentMode:Joi.string(), 
    due:Joi.number(),
    totalAmount:Joi.number(),
    totalPayment:Joi.number().integer().allow(null),
  }),
};

const getInvoice = {
  query: Joi.object().keys({
    patientId: Joi.number().integer(),
    searchText: Joi.string(),
    subscribeSocket: Joi.bool(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    practitionerId: Joi.number().integer(),
  }),
};

const getInvoiceById = {
  params: Joi.object().keys({
    invoiceId: Joi.string().required(),
  }),
};

const updateInvoice = {
  params: Joi.object().keys({
    invoiceId: Joi.string().required(),
  }),
  body: Joi.object()
    .keys({
      payInvoiceInFull: Joi.bool(),
      payCopay: Joi.bool(),
      payNonCoveredServices: Joi.bool(),
      subTotal:Joi.number().integer(),
      total:Joi.number().integer(),
      comment:Joi.string(),
      isDeleted: Joi.boolean(),
      referenceId:Joi.number().integer(),
      paymentType:Joi.string(),
      paymentAmount:Joi.number().integer(),
      paymentMode:Joi.string(), 
      due:Joi.number().integer(),
      totalAmount:Joi.number().integer(),
      totalPayment:Joi.number().integer(),
    })
    .min(1),
};

module.exports = {
  createInvoice,
  getInvoice,
  getInvoiceById,
  updateInvoice,
};
